import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  userName: string;
  temperature?: number;
  date: string;
}

const Header: React.FC<HeaderProps> = ({ userName, temperature = 22, date }) => {
  return (
    <div className="bg-white w-full px-6 py-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <span>/</span>
        <Link href="/my-projects" className="hover:text-gray-700">My Projects</Link>
        <span className="ml-1">...</span>
      </div>

      {/* Greeting and Weather */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, {userName}</h1>
          <p className="text-gray-500 text-sm">{date}</p>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-lg">{temperature}°C</span>
        </div>
      </div>
    </div>
  );
};

export default Header; 