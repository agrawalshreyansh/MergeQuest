'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-[#191120] text-white px-10 py-4 flex items-center justify-between font-sans border-b-2 border-[#A78BFA] transition-all duration-300 ease-in-out">
      {/* Logo */}
      <div className="text-2xl font-bold transition-transform duration-300 hover:scale-105">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={120} 
          height={40}
          className="object-contain"
        />
      </div>

      {/* Centered Links */}
      <div className="flex-1 flex justify-center gap-10 text-xl">
        {[
          { href: "/", text: "Home" },
          { href: "/leaderboard", text: "Leaderboard" },
          { href: "/badges", text: "Badges" },
          { href: "/about", text: "About" },
          { href: "/projects", text: "Projects" }
        ].map((link, index) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className="hover:underline transition-all duration-300 hover:text-purple-400"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {link.text}
          </Link>
        ))}
      </div>

      {/* Login/Signup */}
      <div className="flex items-center gap-5 text-xl">
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
