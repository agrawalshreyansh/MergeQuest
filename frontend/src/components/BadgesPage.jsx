// /app/components/BadgesPage.js or wherever you prefer

import React from 'react';
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

// Reusable Badge Card Component
const BadgeCard = ({ title, tier, image, locked }) => {
	// Function to get the correct text color based on the tier
	const getTierColor = (tierName) => {
		switch (tierName.toLowerCase()) {
			case 'bronze tier':
				return 'text-amber-400';
			case 'silver tier':
				return 'text-slate-300';
			case 'gold tier':
				return 'text-yellow-400';
			case 'diamond tier':
				return 'text-cyan-300';
			case 'legendary tier':
				return 'text-purple-400';
			default:
				return 'text-gray-400';
		}
	};

	return (
		<div className="flex flex-col items-center text-center">
			{/* Updated container sizes for image */}
			<div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-72 lg:h-72 transition-transform duration-300 hover:scale-105">
				<Image
					src={image}
					alt={title}
					width={120}
					height={120}
					className="w-full h-full object-contain"
				/>
				{locked && (
					<div className="absolute inset-0 flex items-center justify-center">
						{/* Lock SVG Icon */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-12 w-12 text-gray-300"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
				)}
			</div>
			<h3 className="mt-4 font-semibold text-white text-xl">{title}</h3> {/* increased from text-lg to text-xl */}
			<p className={`text-base ${ /* increased from text-sm */ '' }`}>
        {tier}
      </p>
		</div>
	);
};

// Main Badges Page Component
export default function BadgesPage() {
	return (
		<div className="min-h-screen p-8 text-white">
			{/* Assuming your navbar is above this component */}
			<main className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-bold">Badges</h1>
				<p className="mt-2 text-gray-400">
					Collect badges by contributing to open source projects.
				</p>

				<div className="mt-12 grid grid-cols-4 gap-x-6 gap-y-10">
					{badgesData.slice(0, 8).map((badge) => (
						<BadgeCard
							key={badge.id}
							title={badge.title}
							tier={badge.tier}
							image={badge.image}
							locked={badge.locked}
						/>
					))}
				</div>
			</main>
		</div>
	);
}