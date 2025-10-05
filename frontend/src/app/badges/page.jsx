"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar'; 
import BadgesPage from '@/components/BadgesPage';

export default function BadgesPageRoute() {
  const [userId, setUserId] = useState(null);
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {
    // Get user from localStorage if available
    const getUserFromLocalStorage = () => {
      try {
        // Try the format from the provided storage object
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData && userData.id) {
            setUserId(userData.id);
            
            // If total_points is available, use it
            if (userData.total_points) {
              setUserScore(userData.total_points);
            }
            return;
          }
        }
        
        // Try alternate format if first one fails
        const altUserDataString = localStorage.getItem('userData');
        if (altUserDataString) {
          const userData = JSON.parse(altUserDataString);
          if (userData && userData._id) {
            setUserId(userData._id);
            
            // If total_points is available, use it
            if (userData.total_points) {
              setUserScore(userData.total_points);
            }
          }
        }
      } catch (error) {
        console.error("Error getting user data from localStorage:", error);
      }
    };

    getUserFromLocalStorage();
  }, []);

  return (
    <div>
      <BadgesPage userId={userId} userScore={userScore} />
    </div>
  );
}