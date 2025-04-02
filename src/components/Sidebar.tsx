'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { IconType } from 'react-icons';

interface SidebarProps {
  projectName: string;
  navigation: {
    name: string;
    href: string;
    icon: IconType;
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ projectName, navigation = [] }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="w-80 h  -screen bg-[#0A2533] text-white flex">
      {/* Project Icons Column */}
      <div className="w-16 h-full border-r border-gray-700 p-2">
        <div className="flex flex-col items-center space-y-4">
          {/* Project Logo */}
          <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm mb-4">PR</div>
          
          {/* Project Icons */}
          <div className="space-y-2">
            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600">
              <span className="text-xs">P1</span>
            </div>
            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600">
              <span className="text-xs">P2</span>
            </div>
            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-600">
              <span className="text-xs">P3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Column */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center space-x-3 mb-8">
          <h2 className="font-semibold">{projectName}</h2>
        </div>
        
        <nav className="space-y-4 flex-1">
          {navigation.length > 0 ? (
            navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 text-gray-300 hover:text-white px-3 py-2 rounded-md ${
                  pathname === item.href ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))
          ) : (
            <div className="text-gray-500">No navigation items available.</div>
          )}
        </nav>
        
        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-gray-300 hover:text-white w-full px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 