"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';

// Data for all the badges.
// You can easily add or remove badges here.
// Images are named 1.png to 8.png as you specified, placed in the /public folder.
// I've added all 10 from your design and reused images for the last two.
const badgesData = [
	{
		id: 1,
		title: 'PR Novice',
		tier: 'Bronze Tier',
		image: '/1.png',
		locked: false,
	},
	{
		id: 2,
		title: 'Star Collector',
		tier: 'Silver Tier',
		image: '/2.png',
		locked: false,
	},
	{
		id: 3,
		title: 'Commit Streak',
		tier: 'Gold Tier',
		image: '/3.png',
		locked: false,
	},
	{
		id: 4,
		title: 'Issue Solver',
		tier: 'Locked',
		image: '/4.png',
		locked: true,
	},
	{
		id: 5,
		title: 'Code Reviewer',
		tier: 'Locked',
		image: '/5.png',
		locked: true,
	},
	{
		id: 6,
		title: 'Project Contributor',
		tier: 'Diamond Tier',
		image: '/6.png',
		locked: false,
	},
	{
		id: 7,
		title: 'Community Builder',
		tier: 'Locked',
		image: '/7.png',
		locked: true,
	},
	{
		id: 8,
		title: 'Open Source Advocate',
		tier: 'Legendary Tier',
		image: '/8.png',
		locked: false,
	},
	{
		id: 9,
		title: 'GitGamer Elite',
		tier: 'Locked',
		image: '/1.png', // Reusing image as per your count
		locked: true,
	},
	{
		id: 10,
		title: 'Legendary Coder',
		tier: 'Locked',
		image: '/2.png', // Reusing image as per your count
		locked: true,
	},
];

// Badge Component
const Badge = ({ title, tier, image, locked }) => (
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
				{tier}
			</p>
		</div>
	</div>
);

// Main Badges Page Component
export default function BadgesPage() {
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
	}, []);

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
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mt-20">
					{badgesData.slice(0, 8).map((badge, index) => (
						<div
							key={badge.id}
							className="badge-item opacity-0"
							style={{ animationDelay: `${index * 100}ms` }}
						>
							<Badge {...badge} />
						</div>
					))}
				</div>
			</main>
		</div>
	);
}