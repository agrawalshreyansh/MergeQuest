'use client';

import React, { useState, useEffect } from 'react';
import { FiShare2 } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserData, getProfileImage } from '@/utils/user';

// --- Reusable Child Components ---

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


// Badges Section
const BadgesSection = ({ userScore = 0 }) => {
  // Mapping between backend badge names and frontend display names
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

  // Function to determine the highest badge based on score
  const getHighestBadge = (score) => {
    let highestBadge = null;
    
    // If score is below minimum, return no badge
    if (score < 10) return null;
    
    // Find the highest badge the user can earn based on their score
    Object.entries(badgeMapping).forEach(([badgeName, badgeInfo]) => {
      const [min, max] = badgeInfo.range;
      if (score >= min && score <= max) {
        highestBadge = {
          name: badgeName,
          ...badgeInfo
        };
      }
    });
    
    return highestBadge;
  };

  // Get the highest badge
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

export default function ProfileView() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUserData({
        ...user,
        avatarUrl: getProfileImage(user.name)
      });
    }
  }, []);

  const progressData = { title: 'PR Machine', percentage: 76, description: 'You are 5 PRs away from unlocking the PR Machine badge!' };
  const statsData = [ { id: 1, title: 'Pull Requests', value: '25' }, { id: 2, title: 'Stars Received', value: '150' }, { id: 3, title: 'Forks Created', value: '50' }, { id: 4, title: 'Longest Streak', value: '30' } ];
  const graphData = [ { x: 1, y: 10 }, { x: 2, y: 25 }, { x: 3, y: 15 }, { x: 4, y: 30 }, { x: 5, y: 20 }, { x: 6, y: 35 }, { x: 7, y: 28 }, { x: 8, y: 40 }, { x: 9, y: 32 }, { x: 10, y: 45 }];
  const processedGraphData = graphData.map((dataPoint, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (graphData.length - index - 1));
    return { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), contributions: dataPoint.y };
  });

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
          <ProgressSection progress={progressData} />
          <ContributionBreakdown stats={statsData} />
          <ContributionsGraph data={processedGraphData} />
        </div>
      </main>
    </div>
  );
}