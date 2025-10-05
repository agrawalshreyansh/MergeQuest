'use client';

import React, { useEffect, useState } from "react";

export default function PrsPage() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log("📦 User data from localStorage:", userData);
    
    const user = JSON.parse(userData);
    setUsername(user.name);
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!username) {
    return null;
  }

  return <PullRequestsDashboard username={username} />;
}

const PullRequestsDashboard = ({ username }) => {
  const [pullRequests, setPullRequests] = useState([]);
  const [filteredPRs, setFilteredPRs] = useState([]);
  const [loading, setLoading] = useState(true);

  // stats
  const [mergedCount, setMergedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [repoFilter, setRepoFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // show all PRs by default
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!username) {
      console.log("⚠️ No username provided, skipping fetch");
      return;
    }
    
    const fetchData = async () => {
      try {
        const encodedUsername = encodeURIComponent(username);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/github/user/prs/${encodedUsername}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const response = await res.json();
        const prsArray = response.data || [];
        setPullRequests(prsArray);

        // calculate stats
        let merged = 0, pending = 0, rejected = 0;

        prsArray.forEach((pr) => {
          const state = pr.state?.toLowerCase();
          if (state === "merged" || pr.merged === true) merged++;
          else if (state === "open") pending++;
          else if (state === "closed" && !pr.merged) rejected++;
        });

        console.log("📊 Stats - Merged:", merged, "Pending:", pending, "Rejected:", rejected);

        setMergedCount(merged);
        setPendingCount(pending);
        setRejectedCount(rejected);
      } catch (err) {
        console.error("💥 Error fetching PRs:", err);
        setPullRequests([]);
        setMergedCount(0);
        setPendingCount(0);
        setRejectedCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [username]);

  // filtering logic
  useEffect(() => {
    console.log("🔍 Filtering PRs. Total:", pullRequests.length);
    
    // Log all unique states
    const states = [...new Set(pullRequests.map(pr => pr.state))];
    console.log("📊 Unique PR states:", states);
    console.log("📊 PR state breakdown:", pullRequests.map(pr => ({ 
      title: pr.title?.substring(0, 30), 
      state: pr.state, 
      merged: pr.merged 
    })));
    
    let prs = [...pullRequests];

    // status filter
    if (statusFilter !== "all") {
      prs = prs.filter((pr) => {
        const state = pr.state?.toLowerCase();
        if (statusFilter === "merged") {
          return state === "merged" || pr.merged === true;
        } else if (statusFilter === "open") {
          return state === "open";
        } else if (statusFilter === "closed") {
          return state === "closed" && pr.merged !== true;
        }
        return true;
      });
      console.log(`  ✓ Status filter (${statusFilter}):`, prs.length);
    }

    // repo filter
    if (repoFilter !== "all") {
      prs = prs.filter((pr) => {
        const repoName = pr.repository?.name || pr.repo_name;
        return repoName === repoFilter;
      });
      console.log(`  ✓ Repo filter (${repoFilter}):`, prs.length);
    }

    // date filter
    if (dateFilter !== "all") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(dateFilter));
      prs = prs.filter((pr) => {
        const createdDate = new Date(pr.createdAt || pr.created_at);
        return createdDate >= cutoff;
      });
      console.log(`  ✓ Date filter (${dateFilter} days):`, prs.length);
    }

    // search filter
    if (search.trim() !== "") {
      prs = prs.filter((pr) =>
        pr.title.toLowerCase().includes(search.toLowerCase())
      );
      console.log(`  ✓ Search filter ("${search}"):`, prs.length);
    }

    console.log("📌 Final filtered PRs:", prs.length);
    setFilteredPRs(prs);
  }, [pullRequests, statusFilter, repoFilter, dateFilter, search]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  // unique repos for dropdown
  const repos = [
    ...new Set(pullRequests.map((pr) => pr.repository?.name || pr.repo_name || "")),
  ].filter(r => r !== "");
  
  console.log("🏢 Available repos:", repos);

  return (
    <div className="p-6 text-white bg-[#191120] min-h-screen pt-20">
      {/* Stats */}
      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
        Your Pull Requests
      </h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
          <h3 className="text-lg text-gray-400">Merged</h3>
          <p className="text-4xl font-bold text-green-400">{mergedCount}</p>
        </div>
        <div className="p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
          <h3 className="text-lg text-gray-400">Pending</h3>
          <p className="text-4xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all">
          <h3 className="text-lg text-gray-400">Rejected</h3>
          <p className="text-4xl font-bold text-red-400">{rejectedCount}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20">
        <p className="mb-3 text-lg text-gray-300">
          Progress to Next Badge:{" "}
          <span className="text-purple-400 font-semibold">Code Conjurer</span>
        </p>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((mergedCount / 200) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-center p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20">
        {/* Status Buttons */}
        <div className="flex gap-2">
          {["all", "merged", "open", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                statusFilter === s
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
              }`}
            >
              {s === "all"
                ? "All"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300 border border-gray-700 focus:border-purple-500 outline-none"
        >
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
          <option value="all">All time</option>
        </select>

        {/* Repo Filter */}
        <select
          value={repoFilter}
          onChange={(e) => setRepoFilter(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300 border border-gray-700 focus:border-purple-500 outline-none"
        >
          <option value="all">All Repositories</option>
          {repos.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search PRs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300 border border-gray-700 focus:border-purple-500 outline-none w-60"
        />
      </div>

      {/* PR List */}
      {filteredPRs.length === 0 ? (
        <div className="text-gray-400 text-center p-10">No pull requests found.</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredPRs.map((pr, idx) => (
            <div
              key={pr._id || idx}
              className="group bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                {pr.title}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {pr.repository?.name || pr.repo_name || 'Unknown Repo'}
              </p>
              <div className="space-y-1 mb-4">
                <p className="text-xs text-gray-500">
                  Opened: {new Date(pr.createdAt || pr.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  Updated: {new Date(pr.updatedAt || pr.updated_at || pr.createdAt || pr.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pr.state?.toLowerCase() === "merged" || pr.merged === true
                      ? "bg-green-500/20 text-green-400"
                      : pr.state?.toLowerCase() === "open"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {pr.state?.toLowerCase() === "merged" || pr.merged === true
                    ? "Merged"
                    : pr.state?.toLowerCase() === "open"
                    ? "Pending"
                    : "Rejected"}
                </span>

                <a
                  href={pr.url || pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
                >
                  View PR →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
