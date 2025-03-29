'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectProject, fetchAvailableIntegrations } from '@/store/slices/jiraSlice';
import { AppDispatch, RootState } from '@/store/store';

export default function JiraProjectsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, isConnected } = useSelector((state: RootState) => state.jira);

  useEffect(() => {
    // Fetch available integrations when component mounts
    dispatch(fetchAvailableIntegrations());
  }, [dispatch]);

  useEffect(() => {
    // If not connected or no projects, redirect to dashboard
    if (!isConnected || !projects.length) {
      router.push('/dashboard');
    }
  }, [isConnected, projects, router]);

  const handleProjectSelect = async (project: any) => {
    try {
      await dispatch(selectProject(project.name)).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to select project:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Select a Jira Project</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose a project to connect with TestMate AI
          </p>
        </div>

        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleProjectSelect(project)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">Key: {project.key}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {project.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 