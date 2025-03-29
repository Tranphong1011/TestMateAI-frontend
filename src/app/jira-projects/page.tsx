'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { selectProject, getJiraProjects } from '@/store/slices/jiraSlice';
import { AppDispatch, RootState } from '@/store/store';
import { FaJira } from 'react-icons/fa';

export default function JiraProjectsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error, isConnected } = useSelector((state: RootState) => state.jira);

  useEffect(() => {
    // Fetch Jira projects when component mounts
    const userId = '90eea180-e5a5-4b82-b31a-e47e30b4579f'; // This should come from your auth state
    dispatch(getJiraProjects(userId));
  }, [dispatch]);

//   useEffect(() => {
//     // If not connected or no projects, redirect to dashboard
//     if (!isConnected || !projects.length) {
//       router.push('/dashboard');
//     }
//   }, [isConnected, projects, router]);

  const handleProjectSelect = async (project: string) => {
    try {
      const userId = '90eea180-e5a5-4b82-b31a-e47e30b4579f'; // This should come from your auth state
      await dispatch(selectProject({ project, userId })).unwrap();
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
          <div className="flex items-center justify-center mb-4">
            <FaJira className="w-8 h-8 text-blue-500 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900">Select a Jira Project</h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Choose a project to connect with TestMate AI
          </p>
        </div>

        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {projects.map((project, index) => (
            <div
              key={index}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              onClick={() => handleProjectSelect(project)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaJira className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{project}</h3>
                    <p className="text-sm text-gray-500">Click to select this project</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 