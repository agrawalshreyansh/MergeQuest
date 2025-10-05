"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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

// Default badges data (all locked initially)
const defaultBadgesData = [
	{
		id: 1,
		title: 'Newbie Committer',
		image: '/1.png',
		locked: true,
	},
	{
		id: 2,
		title: 'Rising Contributor',
		image: '/2.png',
		locked: true,
	},
	{
		id: 3,
		title: 'Issue Solver',
		image: '/3.png',
		locked: true,
	},
	{
		id: 4,
		title: 'Merge Artisian',
		image: '/4.png',
		locked: true,
	},
	{
		id: 5,
		title: 'PR Ninja',
		image: '/5.png',
		locked: true,
	},
	{
		id: 6,
		title: 'Open Source Expert',
		image: '/6.png',
		locked: true,
	},
	{
		id: 7,
		title: 'Open Source Guru',
		image: '/7.png',
		locked: true,
	},
	{
		id: 8,
		title: 'Open Source Samurai',
		image: '/8.png',
		locked: true,
	},
];

// Badge Component
const Badge = ({ title, image, locked }) => (
	<div className="transform transition-all duration-500 hover:scale-105 relative">
		<div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-72 lg:h-72">
			<Image
				src={image}
				alt={title}
				fill
				className={`object-contain transition-all duration-300 ${
					locked ? 'opacity-30' : 'hover:scale-105'
				}`}
			/>
			{locked && (
				<div className="absolute inset-0 flex items-center justify-center transform transition-all duration-300 hover:scale-110">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-16 w-16 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
			)}
		</div>
		<div className="text-center mt-4 transform transition-all duration-300">
			<h3 className="text-2xl font-bold mb-2 bg-white bg-clip-text text-transparent">
				{title}
			</h3>
			<p className={`text-lg ${locked ? 'text-gray-500' : 'text-purple-400'}`}>
				{locked ? 'Locked' : 'Unlocked'}
			</p>
		</div>
	</div>
);

// Function to determine the highest badge a user can earn based on their score
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

// Function to determine the next badge a user can earn based on their score
const getNextBadge = (score) => {
	let nextBadge = null;
	
	// Find the next badge the user can earn
	const orderedBadges = Object.entries(badgeMapping).sort((a, b) => a[1].range[0] - b[1].range[0]);
	
	for (let [badgeName, badgeInfo] of orderedBadges) {
		const [min, max] = badgeInfo.range;
		if (score < min) {
			nextBadge = {
				name: badgeName,
				...badgeInfo,
				pointsNeeded: min - score
			};
			break;
		}
	}
	
	return nextBadge;
};

// Main Badges Page Component
export default function BadgesPage({ userId: propUserId, userScore: initialUserScore = 0 }) {
	const [badgesData, setBadgesData] = useState(defaultBadgesData);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [user, setUser] = useState(null);
	const [userScore, setUserScore] = useState(initialUserScore);
	const [nextBadge, setNextBadge] = useState(null);
	const [userId, setUserId] = useState(propUserId);

	// Get user data from localStorage on component mount if no userId prop provided
	useEffect(() => {
		if (!userId) {
			try {
				// Try format from the storage object you provided
				const userDataString = localStorage.getItem('user');
				if (userDataString) {
					const userData = JSON.parse(userDataString);
					if (userData && userData.id) {
						setUserId(userData.id);
						return;
					}
				}

				// Try alternate format
				const altUserDataString = localStorage.getItem('userData');
				if (altUserDataString) {
					const userData = JSON.parse(altUserDataString);
					if (userData && userData._id) {
						setUserId(userData._id);
					}
				}
			} catch (error) {
				console.error("Error parsing user data from localStorage:", error);
			}
		}
	}, [userId]);	// Update userScore when prop changes
	useEffect(() => {
		setUserScore(initialUserScore);
		
		// Calculate the next badge the user can earn
		const next = getNextBadge(initialUserScore);
		setNextBadge(next);
	}, [initialUserScore]);
	
	// Fetch user badges from the API
	useEffect(() => {
		const fetchUserBadges = async () => {
			// If no userId is provided, use the default badges with locked state
			if (!userId) {
				// Keep all badges locked if no user is logged in
				setBadgesData(defaultBadgesData);
				return;
			}
			
			setLoading(true);
			setError(null);
			
			try {
				const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
				const res = await fetch(`${backendUrl}/api/badges/user/${userId}`, {
					headers: { "Content-Type": "application/json" },
				});
				
				if (!res.ok) {
					throw new Error(`Request failed: ${res.status}`);
				}
				
				const json = await res.json();
				
				if (!json || !json.success) {
					throw new Error(json?.message || "Failed to load user badges");
				}
				
				// Update the badges data based on the API response
				const userBadges = json.data.badges.map(badge => badge.badge);
				const fetchedUser = json.data.user;
				setUser(fetchedUser);
				
				// Get the user's total points from the API
				const userPoints = fetchedUser?.total_points || 0;
				setUserScore(userPoints);
				
				// Calculate the next badge the user can earn
				const next = getNextBadge(userPoints);
				setNextBadge(next);
				
				// Update the badges data (unlock badges that the user has)
				const updatedBadgesData = defaultBadgesData.map(badge => {
					// Find if user has a corresponding badge
					const matchingBackendBadge = Object.entries(badgeMapping).find(
						([_, frontendBadge]) => frontendBadge.id === badge.id
					);
					
					if (matchingBackendBadge) {
						const [backendBadgeName] = matchingBackendBadge;
						// Check if the user has this badge
						const isUnlocked = userBadges.includes(backendBadgeName);
						
						// Also check if the user's score qualifies them for this badge
						const badgeInfo = badgeMapping[backendBadgeName];
						const scoreQualifies = userPoints >= badgeInfo.range[0];
						
						return {
							...badge,
							locked: !(isUnlocked || scoreQualifies),
						};
					}
					
					return badge;
				});
				
				setBadgesData(updatedBadgesData);
			} catch (err) {
				console.error("Error fetching badges:", err);
				setError(err.message || "Unknown error");
			} finally {
				setLoading(false);
			}
		};
		
		fetchUserBadges();
	}, [userId]);
	
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry, idx) => {
					if (entry.isIntersecting) {
						setTimeout(() => {
							entry.target.classList.add('animate-fade-in');
						}, idx * 100); // Stagger the animations
					}
				});
			},
			{ threshold: 0.1 }
		);

		document.querySelectorAll('.badge-item').forEach((badge) => {
			observer.observe(badge);
		});

		return () => observer.disconnect();
	}, [badgesData]);

	return (
		<div className="min-h-screen bg-[#191120] p-8 text-white">
			<main className="max-w-7xl mx-auto py-12">
				<div className="text-center mb-16 animate-fade-in">
					<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-white bg-clip-text text-transparent">
						Achievement Badges
					</h1>
					<p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
						Showcase your open source journey through earned badges. Each badge
						represents a milestone in your contribution journey.
					</p>
					{user && (
						<div className="mt-4 text-xl text-purple-300">
							<span className="font-bold">{user.name}</span>'s achievement
							<div className="mt-4 text-lg">
								<div className="flex items-center justify-center">
									<div>Current Score: <span className="text-purple-400 font-bold">{userScore || 0} points</span></div>
								</div>
								{nextBadge && userScore < nextBadge.range[0] && (
									<div className="mt-2 p-4 bg-black/30 rounded-lg inline-block">
										<div className="flex items-center gap-3">
											<div className="text-center">
												<div className="font-semibold">Next Badge: {nextBadge.title}</div>
												<div className="text-sm text-purple-300">
													{nextBadge.pointsNeeded} more points to earn
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{loading && (
					<div className="text-center text-gray-400 text-lg">
						Loading badges...
					</div>
				)}
				
				{error && !loading && (
					<div className="text-center text-rose-400 text-lg">
						Error: {error}
					</div>
				)}
				
				{!loading && !error && (
					<div className="mt-20">
						<div className="text-3xl font-bold mb-12 text-center text-purple-400">
							All Achievement Badges
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
							{badgesData.map((badge, index) => (
								<div key={badge.id} className="badge-item opacity-0 flex justify-center">
									<Badge
										title={badge.title}
										image={badge.image}
										locked={badge.locked}
									/>
								</div>
							))}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}