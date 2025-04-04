'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectProject } from '@/store/slices/jiraSlice';
import { AppDispatch, RootState } from '@/store/store';
import Image from 'next/image';
import { CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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

export default function JiraProjectsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('recent');

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
        setProjects(data.projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectSelect = async (project: Project) => {
    try {
      // await dispatch(selectJiraProject(project)).unwrap();
      const userId = '90eea180-e5a5-4b82-b31a-e47e30b4579f'; // This should come from your auth state
      await dispatch(selectProject({ project: project.name, userId })).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to select project:', err);
    }
  };
  // const handleProjectSelect = async (project: string) => {
  //   try {
  //     const userId = '90eea180-e5a5-4b82-b31a-e47e30b4579f'; // This should come from your auth state
  //     await dispatch(selectProject({ project, userId })).unwrap();
  //     router.push('/dashboard');
  //   } catch (err) {
  //     console.error('Failed to select project:', err);
  //   }
  // };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-12 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, Rahul sahni</h1>
          <p className="text-gray-500">{currentDay}, {currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <span>22 °C</span>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white rounded-lg p-8">
        <div className="text-left mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            To get started, join a project
          </h2>
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <h3 className="text-lg font-semibold text-gray-700">Project List</h3>
            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
              {projects.length} Projects
            </span>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              <div className="relative h-32">
                <Image
                  src={project.thumbnail || '/project-preview-placeholder.jpg'}
                  alt={project.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                      {project?.name[0]}
                    </div>
                    <h3 className="font-medium text-sm">{project.name}</h3>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-2">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                      <span>{new Date(project.date).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="w-3.5 h-3.5 mr-1" />
                      <span>{project.members}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleProjectSelect(project)}
                    className="px-4 py-1.5 rounded-[4px] border text-sm hover:bg-gray-50 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}