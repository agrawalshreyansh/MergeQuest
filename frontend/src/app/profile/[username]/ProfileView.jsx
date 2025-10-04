'use client'; // The 'use client' directive goes here

import React from 'react';
import { FiShare2 } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Reusable Child Components ---

const ProfileHeader = ({ user }) => (
  <header className="flex flex-col items-center text-center relative">
    <div className="relative">
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="w-28 h-28 rounded-full border-4 border-[#7C3AED] object-cover"
      />
      <button className="absolute bottom-0 right-0 bg-[#7C3AED] p-2 rounded-full hover:bg-[#6D28D9] transition-colors">
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


// --- Main View Component ---
export default function ProfileView({ user, progress, stats, graphData }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen font-sans p-4 sm:p-8 bg-[#191120] pt-20">
        <main className="max-w-7xl mx-auto">
          <ProfileHeader user={user} />
          <div className="space-y-8 mt-8">
            <ProgressSection progress={progress} />
            <ContributionBreakdown stats={stats} />
            <ContributionsGraph data={graphData} />
          </div>
        </main>
      </div>
    </>
  );
}