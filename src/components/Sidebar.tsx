import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  projectName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ projectName }) => {
  return (
    <div className="w-64 h-screen bg-[#0A2533] text-white p-4">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm">PR</div>
        <h2 className="font-semibold">{projectName}</h2>
      </div>
      
      <nav className="space-y-4">
        <Link href="/dashboard" className="flex items-center space-x-3 text-gray-300 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Dashboard</span>
        </Link>
        
        <Link href="/review" className="flex items-center space-x-3 text-gray-300 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Review and management</span>
        </Link>
        
        <Link href="/knowledge" className="flex items-center space-x-3 text-gray-300 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>LLM knowledge base</span>
        </Link>
      </nav>
      
      <div className="absolute bottom-4">
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 