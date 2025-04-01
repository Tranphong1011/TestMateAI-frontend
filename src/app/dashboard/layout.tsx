'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon, DocumentTextIcon, BookOpenIcon, PlusIcon } from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'My Projects', href: '/dashboard/my-projects', icon: HomeIcon },
  // { name: 'QA Tickets', href: '/dashboard/qa-tickets', icon: DocumentTextIcon },
  // { name: 'Jira Projects', href: '/dashboard/jira-projects', icon: BookOpenIcon },
  { name: 'Review and Management', href: '/dashboard/review-and-management', icon: BookOpenIcon },
  { name: 'LLM Tuning', href: '/dashboard/llm-tuning', icon: BookOpenIcon },
  // { name: 'Create Project', href: '/dashboard/create-project', icon: PlusIcon },
  
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectName] = useState('Project Name');
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      const label = path.charAt(0).toUpperCase() + path.slice(1);
      return { href, label };
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar projectName="Project Name" navigation={navigation} />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Breadcrumbs */}
        <div className="px-8 pt-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              {getBreadcrumbs().map((crumb, index) => (
                <li key={crumb.href} className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  )}
                  <Link
                    href={crumb.href}
                    className={`ml-3 text-sm font-medium ${
                      index === getBreadcrumbs().length - 1
                        ? 'text-gray-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
} 