"use client"
import React, { useEffect } from 'react';
import { FaGithub, FaReact, FaNodeJs } from 'react-icons/fa';
import { SiPostgresql } from 'react-icons/si';
import Navbar from '@/components/navbar';
import Link from 'next/link';
// Component 2: Hero Section
const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative bg-[#191120] py-20 px-6">
      <div className="absolute inset-0 overflow-hidden">
      </div>
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-clip-text text-transparent bg-white">
          Level Up Your Contributions
        </h1>
        <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          Unlock achievements, climb leaderboards, and showcase your impact on the
          open-source community.
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold py-5 px-12 rounded-lg transition-all duration-300 transform hover:scale-105">
          Get Started
        </button>
      </div>
    </section>
  );
};

// Component 3: Mission Section
const MissionSection = () => {
  return (
    <section className="py-28 bg-black/20">
      <div className="container mx-auto px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h2>
        <p className="max-w-4xl mx-auto text-gray-400 text-xl">
          We're on a mission to empower developers, foster a thriving community, and promote open-source. Our platform is designed to recognize and reward meaningful contributions, making every commit a step towards personal and collective growth.
        </p>
      </div>
    </section>
  );
};

// Component 4: Features Section
const featuresData = [
  {
    image: '/empowerment.png', // <-- REPLACE WITH YOUR IMAGE PATH
    title: 'Empowerment',
    description: 'We are empowering developers to showcase their skills and contributions, providing a platform for recognition and growth.',
  },
  {
    image: '/community.png', // <-- REPLACE WITH YOUR IMAGE PATH
    title: 'Community',
    description: 'Join a vibrant community where developers can connect, collaborate, and celebrate each other\'s achievements.',
  },
  {
    image: '/open-source.png', // <-- REPLACE WITH YOUR IMAGE PATH
    title: 'Open Source',
    description: 'We are committed to promoting open source by making contributions more visible and impactful, encouraging wider participation.',
  },
];

const FeatureCard = ({ image, title, description }) => (
  <div className="bg-[#150d1e] rounded-xl p-10 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
    <img src={image} alt={title} className="w-64 h-64 mx-auto mb-8 object-contain" />
    <h3 className="text-3xl font-bold mb-4 bg-white bg-clip-text text-transparent">{title}</h3>
    <p className="text-gray-400 text-xl leading-relaxed">{description}</p>
  </div>
);

const FeaturesSection = () => {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-20 bg-white bg-clip-text text-transparent">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuresData.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Component 5: Tech Stack Section
const TechStackSection = () => {
  return (
    <section className="py-28 bg-black/20">
      <div className="container mx-auto px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-10">Powered by Open Source</h2>
        <div className="flex justify-center items-center space-x-12 md:space-x-16 mb-10">
          <FaGithub className="text-5xl md:text-6xl text-gray-400 hover:text-white transition" />
          <FaReact className="text-5xl md:text-6xl text-gray-400 hover:text-white transition" />
          <FaNodeJs className="text-5xl md:text-6xl text-gray-400 hover:text-white transition" />
          <SiPostgresql className="text-5xl md:text-6xl text-gray-400 hover:text-white transition" />
        </div>
        <p className="max-w-4xl mx-auto text-gray-400 mb-10 text-xl">
          Our platform is built on the shoulders of giants, leveraging the power of open-source technologies. We're grateful for the incredible work of the developer community and believe in giving back to the community by contributing to our project on GitHub.
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold py-4 px-10 rounded-lg transition duration-300">
          <Link href="/projects">Contribute on GitHub</Link>
        </button>
      </div>
    </section>
  );
};


// Component 7: Footer
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-black/20 border-t border-gray-800 py-8">
      <div className="container mx-auto px-8 text-center text-gray-500 text-lg">
        <p>&copy; {currentYear} DingDong. All rights reserved.</p>
      </div>
    </footer>
  );
};


// Main Page Component that combines everything
const AboutPage = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-[#191120] text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <FeaturesSection />
      <TechStackSection />
      <Footer />
    </main>
  );
};

export default AboutPage;