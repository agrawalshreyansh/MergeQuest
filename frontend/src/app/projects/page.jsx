'use client';

import { useState, useEffect } from 'react';
import ProjectCard from './components/ProjectCard';
import Filters from './components/Filters';
import Navbar from '@/components/navbar';

export default function ExplorePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    languages: [],
    starCount: null,
    forkCount: null,
    goodFirstIssues: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Build request parameters
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
      });

      // Add search query
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      // Add language filters
      if (filters.languages && filters.languages.length > 0) {
        params.append('languages', filters.languages.join(','));
      }

      // Add star count filter
      if (filters.starCount) {
        params.append('stars', filters.starCount);
      }

      // Add fork count filter
      if (filters.forkCount) {
        params.append('forks', filters.forkCount);
      }

      // Add good first issues filter
      if (filters.goodFirstIssues) {
        params.append('good_first_issues', filters.goodFirstIssues);
      }

      // Send request to backend
      const response = await fetch(
        `/api/projects?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      
      // Expecting backend to return: { projects: [], total: number, page: number, per_page: number }
      setProjects(data.projects || []);
      setTotalResults(data.total || 0);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  const totalPages = Math.min(Math.ceil(totalResults / 12), 8); // GitHub API limit

  return (
    <div className="min-h-screen bg-[#191120]">
      <Navbar />
      
      <div className="flex max-w-[1400px] mx-auto px-8 py-10 gap-10">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0">
          <div className="sticky top-10">
            <h1 className="text-4xl font-bold text-white mb-4">
              Explore Projects
            </h1>
            <p className="text-gray-400 text-lg mb-10">
              Discover projects based on your interests.
            </p>
            
            <Filters filters={filters} setFilters={setFilters} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
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

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-white">
              Search Results ({totalResults})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-[#2a2a3e] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
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
                        } transition-colors text-2xl`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-400 text-2xl">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-12 h-12 rounded bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] transition-colors text-2xl"
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
          )}
        </main>
      </div>
    </div>
  );
}
