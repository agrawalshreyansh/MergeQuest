'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiShare2 } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserData, getProfileImage } from '@/utils/user';

const ProfileHeader = ({ user }) => (
  <header className="flex flex-col items-center text-center relative">
    <div className="relative">
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="w-28 h-28 rounded-full border-4 border-[#7C3AED] object-cover"
      />
      <button className="absolute bottom-0 right-0 bg-[#191120] p-2 rounded-full hover:bg-[#6D28D9] transition-colors">
        <FiShare2 size={16} />
      </button>
    </div>
    <h1 className="mt-4 text-4xl font-bold text-white capitalize">{user.name}</h1>
    <p className="mt-2 text-lg text-gray-400">{user.title}</p>
  </header>
);

const ProgressSection = ({ progress }) => (
  <section className="bg-black/40 rounded-2xl p-6">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-2xl font-semibold text-white">{progress.title}</h2>
      <span className="text-sm font-medium text-gray-400">{progress.percentage}%</span>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-2.5">
      <div 
        className="bg-[#7C3AED] h-2.5 rounded-full" 
        style={{ width: `${progress.percentage}%` }}
      ></div>
    </div>
    <p className="mt-2 text-sm text-gray-400">{progress.description}</p>
  </section>
);

const StatCard = ({ stat }) => {
    const ChartBars = () => {
        const barHeights = Array.from({ length: 7 }, () => `${Math.floor(Math.random() * 80) + 20}%`);
        return (
            <div className="w-full h-16 mt-4 flex items-end justify-between gap-1">
                {barHeights.map((height, index) => (
                    <div 
                        key={index} 
                        className="w-full bg-purple-600 rounded-sm"
                        style={{ height }}
                    ></div>
                ))}
            </div>
        );
    };
    return (
        <div className="bg-black/40 p-6 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-[#7C3AED]/50 transition-all">
            <p className="text-sm text-gray-400">{stat.title}</p>
            <p className="text-4xl font-bold text-white my-1">{stat.value}</p>
            <ChartBars />
        </div>
    );
};

const ContributionBreakdown = ({ stats }) => (
  <section>
    <h2 className="text-2xl font-semibold text-gray-200 mb-6">Contribution Breakdown</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  </section>
);

const ContributionsGraph = ({ data }) => (
    <section className="bg-black/40 rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Contribution Activity</h2>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    />
                    <YAxis 
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(30, 20, 40, 0.8)', 
                            borderColor: '#7C3AED',
                            color: '#FFFFFF'
                        }}
                        labelStyle={{ color: '#D1D5DB' }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="contributions" 
                        stroke="#8B5CF6" 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </section>
);

const BadgesSection = ({ userScore = 0 }) => {
  const badgeMapping = {
    'Newbie Committer': { id: 1, title: 'Newbie Committer', image: '/1.png', range: [10, 99] },
    'Rising Contributor': { id: 2, title: 'Rising Contributor', image: '/2.png', range: [100, 249] },
    'Issue Solver': { id: 3, title: 'Issue Solver', image: '/3.png', range: [250, 499] },
    'Merge Artisian': { id: 4, title: 'Merge Artisian', image: '/4.png', range: [500, 749] },
    'PR Ninja': { id: 5, title: 'PR Ninja', image: '/5.png', range: [750, 999] },
    'Open Source Expert': { id: 6, title: 'Open Source Expert', image: '/6.png', range: [1000, 1249] },
    'Open Source Guru': { id: 7, title: 'Open Source Guru', image: '/7.png', range: [1250, 1499] },
    'Open Source Samurai': { id: 8, title: 'Open Source Samurai', image: '/8.png', range: [1500, 10000] },
  };

  const getHighestBadge = (score) => {
    let highestBadge = null;
    if (score < 10) return null;
    Object.entries(badgeMapping).forEach(([badgeName, badgeInfo]) => {
      const [min, max] = badgeInfo.range;
      if (score >= min && score <= max) {
        highestBadge = { name: badgeName, ...badgeInfo };
      }
    });
    return highestBadge;
  };

  const highestBadge = getHighestBadge(userScore);

  return (
    <section className="bg-black/40 rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Highest Badge</h2>
      <div className="flex justify-center">
        {highestBadge ? (
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <Image
                src={highestBadge.image}
                alt={highestBadge.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-center mt-4">
              <p className="text-xl font-bold text-purple-300">{highestBadge.title}</p>
              <p className="text-sm text-gray-400 mt-1">Score: {userScore} points</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No badges earned yet. You need at least 10 points to earn your first badge!</p>
        )}
      </div>
    </section>
  );
};

// --- Main Page Component ---

export default function ProfileView() {
  const [userData, setUserData] = useState(null);
  const [pointsData, setPointsData] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUserData({
        ...user,
        // Use the 'avatar_url' key from the user object in localStorage.
        avatarUrl: user.avatar_url || getProfileImage(user.name)
      });
      
      // Fetch points data from API
      fetchUserPoints(user.github_id);
      // Fetch user stats from API
      fetchUserStats(user.github_id);
    }
  }, []);

  const fetchUserPoints = async (githubId) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/getusergraph/${githubId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch points: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Transform API data for the graph with cumulative points
        const sortedData = result.data.sort((a, b) => new Date(a.pull_created_at) - new Date(b.pull_created_at));
        
        let cumulativePoints = 0;
        const transformedData = [];
        
        // Process each PR and calculate cumulative points
        sortedData.forEach((point) => {
          cumulativePoints += point.total_points;
          const date = new Date(point.pull_created_at);
          transformedData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            contributions: cumulativePoints,
            fullDate: date.toISOString().split('T')[0],
            actualDate: date
          });
        });
        
        // Extend graph to current date if the last PR is not today
        const today = new Date();
        const lastPRDate = transformedData.length > 0 ? transformedData[transformedData.length - 1].actualDate : new Date(0);
        
        if (transformedData.length > 0 && lastPRDate < today) {
          // Add current date with same cumulative points
          transformedData.push({
            date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            contributions: cumulativePoints,
            fullDate: today.toISOString().split('T')[0],
            actualDate: today
          });
        }
        
        setPointsData(transformedData);
        
        // Update user total points if available
        if (result.user_total_points !== undefined) {
          setUserData(prev => ({
            ...prev,
            total_points: result.user_total_points
          }));
        }
      } else {
        setError(result.message || 'Failed to fetch points data');
      }
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (username) => {
    try {
      setStatsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user/${username}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data.github_stats) {
        const stats = result.data.github_stats;
        
        // Transform API data to match the expected format
        const transformedStats = [
          { id: 1, title: 'Pull Requests', value: stats.total_pull_requests.toString() },
          { id: 2, title: 'Contributed Repos', value: stats.repositories_contributed_to.toString() },
          { id: 3, title: 'Forked Repos', value: stats.forked_repositories.toString() },
          { id: 4, title: 'Longest Streak', value: stats.longest_streak.toString() }
        ];
        
        setStatsData(transformedStats);
      } else {
        console.error('Failed to fetch user stats:', result.message || 'Unknown error');
        // Fallback to default stats if API fails
        setStatsData([
          { id: 1, title: 'Pull Requests', value: '0' },
          { id: 2, title: 'Contributed Repos', value: '0' },
          { id: 3, title: 'Forked Repos', value: '0' },
          { id: 4, title: 'Longest Streak', value: '0' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      // Fallback to default stats if API fails
      setStatsData([
        { id: 1, title: 'Pull Requests', value: '0' },
        { id: 2, title: 'Contributed Repos', value: '0' },
        { id: 3, title: 'Forked Repos', value: '0' },
        { id: 4, title: 'Longest Streak', value: '0' }
      ]);
    } finally {
      setStatsLoading(false);
    }
  };

  const progressData = { title: 'PR Machine', percentage: 76, description: 'You are 5 PRs away from unlocking the PR Machine badge!' };

  if (!userData) {
    return (
        <div className="min-h-screen bg-[#191120] flex items-center justify-center text-white">
            Loading Profile...
        </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <main className="max-w-7xl mx-auto">
        <ProfileHeader user={userData} />
        <div className="space-y-8 mt-8">

          {statsLoading ? (
            <section>
              <h2 className="text-2xl font-semibold text-gray-200 mb-6">Contribution Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-black/40 p-6 rounded-2xl backdrop-blur-sm border border-white/10 animate-pulse">
                    <div className="h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="h-8 bg-gray-600 rounded mb-4"></div>
                    <div className="h-16 bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <ContributionBreakdown stats={statsData} />
          )}
          <BadgesSection userScore={userData.total_points || 0} />
          
          {/* Points Graph Section */}
          <section className="bg-black/40 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Points Over Time</h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                Loading points data...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 text-red-400">
                Error: {error}
              </div>
            ) : pointsData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No pull requests found for this user.
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={pointsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      label={{ value: 'Points', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(30, 20, 40, 0.9)', 
                        borderColor: '#7C3AED',
                        color: '#FFFFFF',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#D1D5DB' }}
                      formatter={(value, name) => [`${value} points`, 'Points Earned']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return `Date: ${payload[0].payload.fullDate}`;
                        }
                        return `Date: ${label}`;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="contributions" 
                      stroke="#8B5CF6" 
                      strokeWidth={2} 
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#FFFFFF' }}
                      dot={{ r: 4, fill: '#8B5CF6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}