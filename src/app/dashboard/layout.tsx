'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon, DocumentTextIcon, BookOpenIcon, PlusIcon, MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import Image from 'next/image'; // Keep this import if used elsewhere, otherwise remove

const navigation = [
  { name: 'My Projects', href: '/dashboard/my-projects', icon: HomeIcon },
  { name: 'Review and Management', href: '/dashboard/review-and-management', icon: BookOpenIcon },
  { name: 'LLM Tuning', href: '/dashboard/llm-tuning', icon: BookOpenIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectName] = useState('Project Name'); // You might want to fetch this dynamically
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    if (!pathname) return [];
    // Basic breadcrumb logic, might need refinement based on actual routes
    const paths = pathname.split('/').filter(p => p && p !== 'dashboard');
    const crumbs = [{ href: '/dashboard/my-projects', label: 'Dashboard' }]; // Start with Dashboard base

    paths.forEach((path, index) => {
      // Construct href based on previous path
      const prevPath = index > 0 ? crumbs[index].href : '/dashboard';
      const href = `${prevPath}/${path}`;
      // Capitalize and replace dashes for label
      const label = path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      // Avoid duplicating dashboard if it's the only path
      if (label !== 'Dashboard') {
        crumbs.push({ href, label });
      }
    });
    // If only 'Dashboard' exists after processing, check if we are actually on a subpage
    if (crumbs.length === 1 && paths.length > 0) {
       const label = paths[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
       crumbs.push({ href: `/dashboard/${paths[0]}`, label: label });
    }


    return crumbs;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-[#0A2533] text-white h-16 flex items-center justify-between px-6 shadow-md z-20 flex-shrink-0">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="w-16 h-16 flex items-center justify-center mt-2"> {/* Container for Image */}
             {/* Replaced SVG with Next.js Image component */}
             <Image
               src="/logo2.png" // Assuming logo2.png is in the public directory
               alt="Company Logo"
               width={55} // Corresponds to w-16
               height={55} // Corresponds to h-16
               priority // Optional: Preload logo if it's above the fold
             />
          </div>
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#1E4253] text-white placeholder-gray-400 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#2a5870]"
            />
          </div>
        </div>
        <div className="flex items-center space-x-5">
          {/* Notification Icon */}
          <button className="relative text-gray-300 hover:text-white focus:outline-none">
            <BellIcon className="w-6 h-6" />
            {/* Optional: Notification badge */}
            {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0A2533]"></span> */}
          </button>
          {/* User Profile */}
          <button className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A2533] focus:ring-white">
            R {/* Replace with user initial or avatar */}
          </button>
           {/* Dropdown arrow (optional) */}
           <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* Pass navigation and potentially the dynamic project name */}
        <Sidebar projectName={projectName} navigation={navigation} />

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50"> {/* Changed background here */}
          {/* Breadcrumbs */}
          <div className="px-8 pt-6 pb-4 bg-white border-b border-gray-200"> {/* Added background and border */}
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2"> {/* Reduced space */}
                {getBreadcrumbs().map((crumb, index, arr) => (
                  <li key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-gray-400 mx-1" // Adjusted margin
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    )}
                    <Link
                      href={crumb.href}
                      className={`text-sm font-medium ${
                        index === arr.length - 1
                          ? 'text-gray-500 cursor-default' // Last item is not clickable
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      aria-current={index === arr.length - 1 ? 'page' : undefined}
                    >
                      {crumb.label}
                    </Link>
                  </li>
                ))}
                 {/* Optional: Ellipsis if breadcrumbs are too long or for actions */}
                 {getBreadcrumbs().length > 1 && (
                   <li className="flex items-center">
                     <svg className="h-5 w-5 flex-shrink-0 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"></path></svg>
                     <button className="text-sm font-medium text-gray-500 hover:text-gray-700">...</button>
                   </li>
                 )}
              </ol>
            </nav>
          </div>
          <div className="p-8">{children}</div> {/* Content padding */}
        </main>
      </div>
    </div>
  );
} 