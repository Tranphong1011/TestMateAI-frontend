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

const Sidebar: React.FC<SidebarProps> = ({ projectName, navigation }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="w-64 h-screen bg-[#0A2533] text-white p-4">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-500 text-white px-2 py-1 rounded text-sm">PR</div>
        <h2 className="font-semibold">{projectName}</h2>
      </div>
      
      <nav className="space-y-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 text-gray-300 hover:text-white ${
              pathname === item.href
                ? 'bg-gray-700'
                : 'hover:bg-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      
      <div className="absolute bottom-4">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 text-gray-300 hover:text-white w-full px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 