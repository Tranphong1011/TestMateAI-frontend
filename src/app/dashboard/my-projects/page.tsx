'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  date: string;
  status: string;
  thumbnail: string;
  members: number;
}

interface ProjectResponse {
  projects: Project[];
  tool: string;
  cloud_id: string;
}

export default function MyProjects() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userName = user?.name || 'Rahul Sahni';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current date and day
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[today.getDay()];
  const currentDate = today.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long' 
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://127.0.0.1:7000/api/v1/jira/authorized-projects/jira');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data: ProjectResponse = await response.json();
        console.log("data",data);
        setProjects(data.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Hi {userName}</h1>
          <p className="text-gray-500">{currentDay}, {currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span>22 °C</span>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-lg p-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          <button className="px-4 py-2 text-blue-600 border-b-2 border-blue-600">
            Recent Projects
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Jira Projects
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Collaboration Projects
          </button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              href={`/dashboard/qa-tickets?projectId=${project.id}`} 
              key={project.id}
              className="border rounded-lg overflow-hidden transition-transform hover:transform hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="cursor-pointer">
                <Image
                  src={project.thumbnail}
                  alt={project.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                        PR
                      </div>
                      <h3 className="font-semibold">{project.name}</h3>
                    </div>
                    <button
                      className={`px-3 py-1 rounded text-sm ${
                        project.status === 'Joined'
                          ? 'bg-gray-200'
                          : 'bg-blue-500 text-white'
                      }`}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking the button
                        // Add your join/leave logic here
                      }}
                    >
                      {project.status}
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{project.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{project.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{project.members}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 