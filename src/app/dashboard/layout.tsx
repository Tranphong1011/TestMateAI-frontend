'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HomeIcon, DocumentTextIcon, BookOpenIcon, PlusIcon } from '@heroicons/react/24/outline';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectName] = useState('Project Name');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar projectName="Project Name" />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
} 