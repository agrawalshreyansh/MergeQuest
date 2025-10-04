"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/navbar";

// Mapping between backend badge names and frontend display names
const badgeMapping = {
	'Newbie Committer': { id: 1, title: 'Newbie Committer', image: '/1.png',range:[10,99] },
	'Rising Contributor': { id: 2, title: 'Rising Contributor', image: '/2.png',range:[100,249] },
	'Issue Solver': { id: 3, title: 'Issue Solver', image: '/3.png',range:[250,499] },
	'Merge Artisian': { id: 4, title: 'Merge Artisian', image: '/4.png',range:[500,749] },
	'PR Ninja': { id: 5, title: 'PR Ninja', image: '/5.png',range:[750,999] },
	'Open Source Expert': { id: 6, title: 'Open Source Expert', image: '/6.png',range:[1000,1249] },
	'Open Source Guru': { id: 7, title: 'Open Source Guru', image: '/7.png',range:[1250,1499] },
	'Open Source Samurai': { id: 8, title: 'Open Source Samurai', image: '/8.png',range:[1500,10000] },
};
export default function LeaderboardPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const controller = new AbortController();

		async function fetchLeaderboard() {
			setLoading(true);
			setError(null);
			try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                const res = await fetch(`${backendUrl}/api/users/leaderboard`, {
                    signal: controller.signal,
                    headers: { "Content-Type": "application/json" },
                });
                console.log("Fetch response:", res); // Debug log

				if (!res.ok) {
					throw new Error(`Request failed: ${res.status}`);
				}

				const json = await res.json();
				if (!json || !json.success) {
					throw new Error(json?.message || "Failed to load leaderboard");
				}

				setUsers(Array.isArray(json.data) ? json.data : []);
			} catch (err) {
				if (err.name !== "AbortError") {
					setError(err.message || "Unknown error");
				}
			} finally {
				setLoading(false);
			}
		}

		fetchLeaderboard();

		return () => controller.abort();
	}, []);

	const rankCircle = (rank) => {
		if (rank === 1) return "bg-yellow-400 text-black";
		if (rank === 2) return "bg-gray-300 text-black";
		if (rank === 3) return "bg-orange-400 text-black";
		return "bg-[#2b2433] text-gray-300 border border-[#2f2a39]";
	};
	
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

	return (
        <>
		<div className="min-h-screen p-8 text-white">
			<main className="max-w-6xl mx-auto py-12">
				<div className="text-center mb-8">
					<h1 className="text-5xl font-bold mb-2 bg-white bg-clip-text text-transparent">
						Leaderboard
					</h1>
					<p className="text-lg text-gray-300">See who's crushing it on the contribution charts.</p>
				</div>

				<div className="flex justify-center my-6">
					<div className="inline-flex bg-[#241a2b] rounded-full p-1">
						{["Weekly", "Monthly", "All-Time"].map((t, i) => (
							<button
								key={t}
								className={`px-5 py-2 rounded-full text-sm font-medium ${i === 0 ? "bg-purple-600 text-white" : "text-gray-300"}`}
							>
								{t}
							</button>
						))}
					</div>
				</div>

				<section className="rounded-xl overflow-hidden shadow-lg border border-[#2d2535]">
					<table className="w-full table-fixed text-left">
						<thead className="text-gray-300 border-b border-[#352a3a]">
							<tr>
								<th className="w-28 px-6 py-4">Rank</th>
								<th className="px-6 py-4">Contributor</th>
								<th className="w-40 px-6 py-4">Score</th>
								<th className="w-48 px-6 py-4">Highest Badge</th>
							</tr>
						</thead>
						<tbody>
							{loading && (
								<tr>
									<td colSpan={4} className="px-6 py-12 text-center text-gray-400">
										Loading leaderboard...
									</td>
								</tr>
							)}

							{error && !loading && (
								<tr>
									<td colSpan={4} className="px-6 py-12 text-center text-rose-400">
										Error: {error}
									</td>
								</tr>
							)}

							{!loading && !error && users.length === 0 && (
								<tr>
									<td colSpan={4} className="px-6 py-12 text-center text-gray-400">
										No users found.
									</td>
								</tr>
							)}

							{!loading && !error && users.map((u, idx) => (
								<tr key={u._id} className={`border-t border-[#2f2636] hover:bg-[#241a2b]`}> 
									<td className="px-6 py-6 align-top">
										<div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${rankCircle(idx + 1)}`}>
											<span className="font-semibold">{idx + 1}</span>
										</div>
									</td>

									<td className="px-6 py-6">
										<div className="flex items-center gap-4">
											<div className="w-12 h-12 rounded-full overflow-hidden bg-[#1f1724] flex-shrink-0">
												{u.avatar_url ? (
													<Image src={u.avatar_url} alt={u.github_id || u.name || "avatar"} width={48} height={48} className="object-cover" />
												) : (
													<div className="w-full h-full bg-gray-700" />
												)}
											</div>
											<div>
												<div className="font-medium">{u.name || u.github_id}</div>
												<div className="text-sm text-gray-400">{u.github_id}</div>
											</div>
										</div>
									</td>

									<td className="px-6 py-6 align-top">
										<div className="text-purple-300 font-semibold">{u.total_points ?? 0}</div>
									</td>

									<td className="px-6 py-6 align-top">
										<div className="flex items-center gap-2">
											{(() => {
												// Get the highest badge based on score
												const highestBadge = getHighestBadge(u.total_points || 0);
												
												if (highestBadge) {
													return (
														<div className="flex items-center gap-2">
															<div className="w-8 h-8 rounded-full bg-[#3a2b45] flex items-center justify-center overflow-hidden">
																<Image 
																	src={highestBadge.image} 
																	alt={highestBadge.title}
																	width={24}
																	height={24}
																	className="object-cover"
																/>
															</div>
															<span className="text-xs text-purple-300">{highestBadge.title}</span>
														</div>
													);
												}
												
												// If no score-based badge
												return <div className="text-gray-500 text-sm">—</div>;
											})()}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			</main>
		</div>
        </>
	);
}

