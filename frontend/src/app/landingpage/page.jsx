'use client';
import React from 'react';

const Badge = ({ bgColor, title, glowColor }) => (
  <div className="flex flex-col items-center text-center">
    <div
      className={`
        w-40 h-40 md:w-48 md:h-48
        ${bgColor}
        rounded-2xl
        shadow-lg
        hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
        ${glowColor}
      `}
    >
    </div>
    <p className="mt-4 font-semibold text-gray-200">{title}</p>
  </div>
);

const LandingPage = () => {
  const badges = [
    { title: 'Bronze Contributor', bgColor: 'bg-teal-900', glowColor: 'hover:shadow-teal-500/40' },
    { title: 'Silver Committer', bgColor: 'bg-lime-900', glowColor: 'hover:shadow-lime-500/40' },
    { title: 'Golden Pull Request', bgColor: 'bg-slate-800', glowColor: 'hover:shadow-blue-500/40' },
    { title: 'Diamond Issue Solver', bgColor: 'bg-slate-700', glowColor: 'hover:shadow-gray-400/40' },
    { title: 'Legendary Code Ninja', bgColor: 'bg-indigo-900', glowColor: 'hover:shadow-indigo-500/40' },
  ];

  const openPopup = () => {
    const CLIENT_ID = "Ov23liEmXHdfU7FXmH3m";
    const REDIRECT_URI = "https://merge-quest-hcwslo8kq-shrages-projects-e1cadf02.vercel.app/oauth-callback"; // Explicit URL instead of dynamic

    const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:email`;
    console.log("OAuth URL:", url); // Debug log
    const width = 600, height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      url,
      "GitHub OAuth",
      `width=${width},height=${height},left=${left},top=${top}`
    );

    window.addEventListener("message", async (event) => {
      if (event.origin !== window.location.origin) return;
      const { code, error } = event.data;
      
      if (error) {
        console.error("OAuth error:", error);
        return;
      }

      if (!code) return;

      try {
        console.log("Sending auth request with code:", code);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })        
        });

        if (!res.ok) {
          console.error("HTTP error:", res.status, res.statusText);
          return;
        }

        const responseText = await res.text();

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          console.error("Response text was:", responseText);
          return;
        }

        if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.data));
            window.location.href = '/projects';
        } else {
          console.error("Authentication failed:", data.message);
        }
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    });

    if (!popup) {
      alert("Popup was blocked! Please allow popups for this site.");
    }
  };

  return (
    <div
      className="text-white font-sans min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #2c0e3a, #120c18, #000000)',
      }}
    >
      <main className="container mx-auto px-6">

        <section className="min-h-[60vh] flex flex-col items-center justify-center text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            Turn your open-source journey into a game.
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl">
            Earn badges, climb leaderboards, and showcase your GitHub milestones.
          </p>
          <button
            onClick={openPopup}
            className="mt-8 px-8 py-3 bg-[#6D28D9] hover:bg-[#5B21B6] rounded-lg font-semibold transition-colors duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Login with GitHub
          </button>
        </section>

        {/* ========= Achievements Section ========= */}
        <section className="py-20">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Collect & Showcase Your Achievements
            </h2>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
              Celebrate every milestone with unique, beautifully designed badges.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {badges.map((badge) => (
              <Badge key={badge.title} {...badge} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default LandingPage;