"use client";

import React, { useEffect, useState } from 'react';
import ProfileView from './ProfileView';

// Client Component to handle params and data fetching
export default function UserProfilePage({ params }) {
  const resolvedParams = React.use(params);
  const { username } = resolvedParams;
  const [userData, setUserData] = useState({
    name: username.replace('-', ' '),
    title: 'Software Engineer | Open Source Enthusiast',
    avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
  });
  const [userId, setUserId] = useState(null);
  const [userScore, setUserScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from localStorage
  useEffect(() => {
    const getUserFromLocalStorage = () => {
      try {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const storedUserData = JSON.parse(userDataString);
          if (storedUserData) {
            setUserData({
              name: storedUserData.name || username.replace('-', ' '),
              title: 'Software Engineer | Open Source Enthusiast',
              avatarUrl: storedUserData.avatar_url || `https://i.pravatar.cc/150?u=${username}`,
            });
            
            setUserId(storedUserData._id);
          }
        }
      } catch (error) {
        console.error("Error getting user data from localStorage:", error);
      }
    };

    getUserFromLocalStorage();
  }, [username]);

  // Fetch user data including score
  useEffect(() => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    // Get user data from localStorage or API
    const getUserData = () => {
      try {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData && userData.total_points) {
            setUserScore(userData.total_points);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error getting user data:", err);
        setError(err.message || "Unknown error");
        setLoading(false);
      }
    };
    
    getUserData();
  }, [userId]);

  const progressData = { 
    title: 'PR Machine', 
    percentage: 76, 
    description: 'You are 5 PRs away from unlocking the PR Machine badge!' 
  };
  
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
  
  return (
    <ProfileView 
      user={userData}
      progress={progressData}
      stats={statsData}
      graphData={processedGraphData}
      userScore={userScore}
    />
  );
}