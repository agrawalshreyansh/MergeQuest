import React from 'react';
import ProfileView from './ProfileView'; // Import the new client component

// This is an async Server Component to handle params and data
export default async function UserProfilePage({ params }) {
  const { username } = params;

  // --- All data logic runs on the server ---
  const userData = {
    name: username.replace('-', ' '),
    title: 'Software Engineer | Open Source Enthusiast',
    avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
  };
  
  const progressData = { title: 'PR Machine', percentage: 76, description: 'You are 5 PRs away from unlocking the PR Machine badge!' };
  const statsData = [
    { id: 1, title: 'Pull Requests', value: '25' },
    { id: 2, title: 'Stars Received', value: '150' },
    { id: 3, title: 'Forks Created', value: '50' },
    { id: 4, title: 'Longest Streak', value: '30' }
  ];

  const graphData = [
    { x: 1, y: 10 }, { x: 2, y: 25 }, { x: 3, y: 15 }, { x: 4, y: 30 }, { x: 5, y: 20 },
    { x: 6, y: 35 }, { x: 7, y: 28 }, { x: 8, y: 40 }, { x: 9, y: 32 }, { x: 10, y: 45 }
  ];

  const processedGraphData = graphData.map((dataPoint, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (graphData.length - index - 1));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      contributions: dataPoint.y,
    };
  });
  
  // --- Render the Client Component and pass the data as props ---
  return (
    <ProfileView 
      user={userData}
      progress={progressData}
      stats={statsData}
      graphData={processedGraphData}
    />
  );
}