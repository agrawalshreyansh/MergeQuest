'use client';

import { useState, useEffect, useMemo } from 'react';
import ProjectCard from './components/ProjectCard';
import Filters from './components/Filters';
// import Navbar from '@/components/navbar';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    languages: [],
    starCount: null,
    forkCount: null,
    goodFirstIssues: null,
    onlyGoodFirstIssues: false
  });
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 12;
  
  // Fetch repositories from GitHub API
  // Determine which filters require API calls and which are client-side only
  const apiFilters = useMemo(() => ({
    searchQuery,
    languages: filters.languages,
    starCount: filters.starCount,
    currentPage,
  }), [searchQuery, filters.languages, filters.starCount, currentPage]);
  
  useEffect(() => {
    const fetchRepositories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Base query to get public repositories sorted by stars
        let queryString = 'q=is:public';
        
        // Add language filter if selected
        if (filters.languages && filters.languages.length > 0) {
          queryString += filters.languages.map(lang => `+language:${lang}`).join('');
        }
        
        // Add star count filter
        if (filters.starCount) {
          const [min, max] = filters.starCount.includes('..') 
            ? filters.starCount.split('..').map(n => parseInt(n))
            : filters.starCount.startsWith('>=')
              ? [parseInt(filters.starCount.substring(2)), null]
              : [0, null];
          
          queryString += `+stars:${min}${max ? '..' + max : ''}`;
        }
        
        // Add text search
        if (searchQuery.trim()) {
          queryString += `+${encodeURIComponent(searchQuery.trim())}`;
        }
        
        // Sort by stars in descending order
        queryString += '&sort=stars&order=desc';
        
        // Add pagination
        const perPage = 30; // GitHub's default is 30 items per page
        const apiPage = Math.floor((currentPage - 1) * itemsPerPage / perPage) + 1;
        queryString += `&page=${apiPage}&per_page=${perPage}`;
        
        const response = await fetch(`https://api.github.com/search/repositories?${queryString}`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          }
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
            const rateLimitReset = response.headers.get('X-RateLimit-Reset');
            
            if (rateLimitRemaining === '0' && rateLimitReset) {
              const resetTime = new Date(parseInt(rateLimitReset) * 1000);
              const now = new Date();
              const minutesUntilReset = Math.ceil((resetTime - now) / 60000);
              
              throw new Error(`No Repos Match Your Result`);
            }
          }
          throw new Error('Failed to fetch repositories');
        }
        
        const data = await response.json();
        
        // First show the repositories immediately
        const initialRepos = data.items.map(repo => ({
          ...repo,
          good_first_issues: 0  // Will be updated later
        }));
        
        setRepositories(initialRepos);
        setLoading(false);
        setLoadingIssues(true);
        
        // Then fetch the good first issues counts
        try {
          // Only fetch good first issues for visible repositories (limited by page)
          const startIndex = ((currentPage - 1) * itemsPerPage) % 30; // GitHub returns max 30 items per page
          const endIndex = Math.min(startIndex + itemsPerPage, data.items.length);
          const visibleRepos = data.items.slice(startIndex, endIndex);
          
          // Create a map to store good first issue counts
          const goodFirstIssuesMap = new Map();
          
          // Fetch good first issues count for visible repos only
          await Promise.all(visibleRepos.map(async (repo) => {
            let goodFirstIssuesCount = 0;
            
            try {
              const issuesResponse = await fetch(
                `https://api.github.com/search/issues?q=repo:${repo.full_name}+label:"good first issue"+state:open&per_page=1`,
                {
                  headers: {
                    Accept: 'application/vnd.github.v3+json',
                  }
                }
              );
              
              if (issuesResponse.ok) {
                const issuesData = await issuesResponse.json();
                goodFirstIssuesCount = issuesData.total_count;
              }
            } catch (error) {
              console.error(`Error fetching good first issues for ${repo.full_name}:`, error);
              // Continue with goodFirstIssuesCount as 0 if there's an error
            }
            
            // Store in map
            goodFirstIssuesMap.set(repo.id, goodFirstIssuesCount);
          }));
          
          // Update all repos with good first issues data
          const processedRepos = data.items.map(repo => ({
            ...repo,
            good_first_issues: goodFirstIssuesMap.get(repo.id) || 0
          }));
          
          setRepositories(processedRepos);
        } catch (err) {
          console.error('Error fetching good first issues:', err);
          // We already have the repositories, so don't set an error state
        } finally {
          setLoadingIssues(false);
        }
      } catch (err) {
        console.error('Error fetching repositories:', err);
        setError(err.message || 'Failed to fetch repositories');
        setLoading(false);
        setLoadingIssues(false);
      }
    };
    
    fetchRepositories();
  }, [apiFilters]);

  // Additional client-side filtering for any filters that can't be done via API
  const clientFilteredProjects = useMemo(() => {
    let results = repositories;
    
    // Apply fork count filter if specified
    if (filters.forkCount) {
      const [min, max] = filters.forkCount.includes('..') 
        ? filters.forkCount.split('..').map(n => parseInt(n))
        : filters.forkCount.startsWith('>=')
          ? [parseInt(filters.forkCount.substring(2)), Infinity]
          : [0, Infinity];
      
      results = results.filter(project => 
        project.forks_count >= min && (max === Infinity || project.forks_count <= max)
      );
    }
    
    // Apply good first issues filter
    if (filters.goodFirstIssues) {
      const [min, max] = filters.goodFirstIssues.includes('..') 
        ? filters.goodFirstIssues.split('..').map(n => parseInt(n))
        : filters.goodFirstIssues.startsWith('>=')
          ? [parseInt(filters.goodFirstIssues.substring(2)), Infinity]
          : [0, Infinity];
      
      results = results.filter(project => 
        project.good_first_issues >= min && (max === Infinity || project.good_first_issues <= max)
      );
    }
    
    // Only show projects with good first issues
    if (filters.onlyGoodFirstIssues) {
      results = results.filter(project => project.good_first_issues > 0);
    }
    
    return results;
  }, [repositories, filters.forkCount, filters.goodFirstIssues, filters.onlyGoodFirstIssues]);

  // Paginate the filtered projects
  const paginatedProjects = useMemo(() => {
    // GitHub API results are already paginated, so we just take the number of items we need
    const startIndex = ((currentPage - 1) * itemsPerPage) % 30; // Modulo 30 since GitHub returns max 30 items per request
    const endIndex = Math.min(startIndex + itemsPerPage, clientFilteredProjects.length);
    return clientFilteredProjects.slice(startIndex, endIndex);
  }, [clientFilteredProjects, currentPage, itemsPerPage]);

  // For pagination we'll estimate total pages based on GitHub API response
  const totalPages = Math.ceil(100 / itemsPerPage); // GitHub API typically shows 1000 results max (showing 100 for simplicity)

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#191120]">
      <div className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-white mb-4">
            Explore Popular Repositories
          </h1>
          <p className="text-gray-400 text-xl mb-8">
            Discover open-source projects from across GitHub
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, language, or topic..."
                className="w-full px-6 py-4 pl-14 bg-[#2a2a3e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500 text-xl"
              />
              <svg
                className="w-6 h-6 text-gray-500 absolute left-5 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Results Count */}
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-white">
              {loading ? 'Loading repositories...' : 
               `${clientFilteredProjects.length} ${clientFilteredProjects.length === 1 ? 'Repository' : 'Repositories'}`}
            </h2>
            {loadingIssues && (
              <div className="flex items-center text-sm text-purple-400">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500 mr-2"></div>
                Fetching good first issues...
              </div>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                Clear search
              </button>
            )}
            {(filters.languages.length > 0 || filters.starCount || filters.forkCount || filters.goodFirstIssues || filters.onlyGoodFirstIssues) && (
              <button
                onClick={() => {
                  setFilters({
                    languages: [],
                    starCount: null,
                    forkCount: null,
                    goodFirstIssues: null,
                    onlyGoodFirstIssues: false
                  });
                  setCurrentPage(1);
                }}
                className="text-purple-400 hover:text-purple-300 text-sm underline ml-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-8">
              <Filters filters={filters} setFilters={setFilters} />
            </div>
          </div>
          
          {/* Projects Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-xl text-gray-400">Loading repositories...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="text-rose-400 text-xl mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Error: {error}
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      languages: [],
                      starCount: null,
                      forkCount: null,
                      goodFirstIssues: null,
                      onlyGoodFirstIssues: false
                    });
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : clientFilteredProjects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                  {paginatedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-3 rounded bg-[#2a2a3e] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a4e] transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-12 h-12 rounded ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e]'
                          } transition-colors text-xl font-semibold`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-gray-400 text-xl">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-12 h-12 rounded bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors text-xl font-semibold"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded bg-[#2a2a3e] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3a3a4e] transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 text-xl mb-4">
                  <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No repositories found matching "{searchQuery}"
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
