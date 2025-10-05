import { Inter } from 'next/font/google';
import Navbar from '@/components/navbar';
import './globals.css';

// const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MergeQuest',
  description: 'Gamified GitHub Contributions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#191120]`}>
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
