'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  HomeIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  BellIcon,
  DocumentTextIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  UserCircleIcon,
  KeyIcon,
  ArrowLeftEndOnRectangleIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { markAllRead, clearAll } from '@/store/slices/notificationSlice';

const navigation = [
  { name: 'My Projects',           href: '/dashboard/my-projects',           icon: HomeIcon },
  { name: 'Test Cases',            href: '/dashboard/testcase',               icon: DocumentTextIcon },
  { name: 'Run History',           href: '/dashboard/runs',                   icon: ClockIcon },
  { name: 'Compiler Rules',        href: '/dashboard/rules',                  icon: CpuChipIcon },
  { name: 'System Status',         href: '/dashboard/system',                 icon: SignalIcon },
  { name: 'Review & Management',   href: '/dashboard/review-and-management',  icon: BookOpenIcon },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const notifications = useSelector((state: RootState) => state.notification?.items ?? []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellOpen = () => {
    setBellOpen((v) => !v);
    setUserOpen(false);
    if (!bellOpen) dispatch(markAllRead());
  };

  const handleUserOpen = () => {
    setUserOpen((v) => !v);
    setBellOpen(false);
  };

  const handleSignOut = () => {
    dispatch(logout());
    router.push('/login');
  };

  const getBreadcrumbs = () => {
    if (!pathname) return [];
    const paths = pathname.split('/').filter((p) => p && p !== 'dashboard');
    const crumbs = [{ href: '/dashboard/my-projects', label: 'Dashboard' }];
    paths.forEach((path, index) => {
      const prevPath = index > 0 ? crumbs[index].href : '/dashboard';
      const href = `${prevPath}/${path}`;
      const label = path.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      if (label !== 'Dashboard') crumbs.push({ href, label });
    });
    if (crumbs.length === 1 && paths.length > 0) {
      const label = paths[0].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      crumbs.push({ href: `/dashboard/${paths[0]}`, label });
    }
    return crumbs;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-[#0A2533] text-white h-16 flex items-center justify-between px-6 shadow-md z-20 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 flex items-center justify-center mt-2">
            <Image src="/logo2.png" alt="Company Logo" width={55} height={55} priority />
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#1E4253] text-white placeholder-gray-400 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-[#2a5870]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* ── Bell notification ── */}
          <div ref={bellRef} className="relative">
            <button
              onClick={handleBellOpen}
              className="relative text-gray-300 hover:text-white focus:outline-none"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => dispatch(clearAll())}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <BellIcon className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-medium leading-snug">{n.message}</p>
                          {n.detail && <p className="text-xs text-gray-400 mt-0.5">{n.detail}</p>}
                          <p className="text-xs text-gray-300 mt-1">{timeAgo(n.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── User dropdown ── */}
          <div ref={userRef} className="relative flex items-center gap-1">
            <button
              onClick={handleUserOpen}
              className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white text-sm font-semibold focus:outline-none"
            >
              {userInitial}
            </button>
            <button onClick={handleUserOpen} className="focus:outline-none">
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${userOpen ? 'rotate-180' : ''}`}
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {userOpen && (
              <div className="absolute right-0 top-10 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                </div>

                <div className="py-1">
                  {/* My Profile */}
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <UserCircleIcon className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>

                  {/* API Keys (BYOL) */}
                  <Link
                    href="/dashboard/settings/api-keys"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <KeyIcon className="w-4 h-4 text-gray-400" />
                    AI API Keys
                    <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">BYOL</span>
                  </Link>

                  {/* Preferences */}
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                    Settings
                  </Link>

                  {/* Help */}
                  <Link
                    href="/dashboard/system"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400" />
                    System Status &amp; Help
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar projectName="Project Name" navigation={navigation} />
        <main className="flex-1 overflow-auto bg-gray-50">
          {/* Breadcrumbs */}
          <div className="px-8 pt-6 pb-4 bg-white border-b border-gray-200">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {getBreadcrumbs().map((crumb, index, arr) => (
                  <li key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <svg className="h-5 w-5 flex-shrink-0 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    )}
                    <Link
                      href={crumb.href}
                      className={`text-sm font-medium ${
                        index === arr.length - 1 ? 'text-gray-500 cursor-default' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      aria-current={index === arr.length - 1 ? 'page' : undefined}
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
    </div>
  );
}
