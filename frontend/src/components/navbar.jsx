'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[#191120] text-white px-10 py-4 flex items-center justify-between font-sans border-b-2 border-[#A78BFA]">
      {/* Logo */}
      <div className="text-2xl font-bold">
        <p>LOGO</p>
      </div>

      {/* Centered Links */}
      <div className="flex-1 flex justify-center gap-10 text-xl">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/leaderboard" className="hover:underline">
          Leaderboard
        </Link>
        <Link href="/badges" className="hover:underline">
          Badges
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
      </div>

      {/* Login/Signup */}
      <div className="flex items-center gap-5 text-base text-xl">
        <Link href="/login" className="hover:underline">
          Login
        </Link>
        <Link
          href="/signup"
          className="border border-white px-4 py-2 rounded transition-colors duration-300 hover:bg-[#442A64]"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
