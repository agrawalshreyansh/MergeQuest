'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiGithub, FiChevronDown, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { getUserData, getProfileImage } from '../utils/user';

import { useRouter } from 'next/navigation';
export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
    window.location.reload();
  };

  const navLinks = [
    { href: "/", text: "Home", showOnlyLoggedOut: true },
    { href: "/leaderboard", text: "Leaderboard" },
    { href: "/prs", text: "PRs", requiresAuth: true },
    { href: "/badges", text: "Badges" },
    { href: "/about", text: "About" },
    { href: "/projects", text: "Projects" }
  ];

  return (
    <>
      <nav className="fixed w-full bg-[#191120] text-white px-10 py-4 flex items-center justify-between font-sans transition-all duration-300 ease-in-out z-[49]">
        {/* Logo */}
        <div className="text-2xl font-bold transition-transform duration-300 hover:scale-105">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={120} 
              height={40}
              className="object-contain"
              priority={true}
              style={{ height: 'auto' }}
            />
          </Link>
        </div>

        {/* Centered Links */}
        <div className="flex-1 flex justify-center gap-10 text-xl">
          {navLinks
            .filter(link => (
              (!user && !link.requiresAuth && !link.showOnlyLoggedOut) || 
              (user && !link.showOnlyLoggedOut) ||
              (!user && link.showOnlyLoggedOut)
            ))
            .map((link, index) => (
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

        {/* Auth Section */}
        <div className="flex items-center gap-5 text-xl relative">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:text-purple-400 transition-colors"
              >
                <img
                  src={user.avatar_url || `https://github.com/${user.name}.png`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                  onError={() => setImageError(true)}
                />
                <span>{user.name}</span>
                <FiChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#191120] border border-[#A78BFA] rounded-lg shadow-xl py-2 z-50">
                  <Link 
                    href={`/profile/${user.name}`}
                    className="block px-4 py-2 hover:bg-[#442A64] transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-[#442A64] transition-colors text-red-400 flex items-center gap-2"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // If not logged in, show "Login with GitHub"
<div></div>
          )}
        </div>
      </nav>
      <div className="fixed top-[4rem] w-full h-[2px] bg-[#A78BFA] z-40" />
    </>
  );
}