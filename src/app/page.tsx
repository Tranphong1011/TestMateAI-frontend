import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProjectCard from '@/components/ProjectCard';

const mockProjects = [
  {
    id: 1,
    name: 'Project Name',
    description: 'This is a description for Project.',
    date: '20 Feb 23',
    type: 'PR',
    isJoined: false,
    thumbnailUrl: '/project-thumbnail-1.jpg',
    collaborators: [
      { id: 1, avatarUrl: '/avatar1.jpg' },
      { id: 2, avatarUrl: '/avatar2.jpg' },
    ],
  },
  {
    id: 2,
    name: 'Project Name',
    description: 'This is a description for Project.',
    date: '20 Feb 23',
    type: 'PR',
    isJoined: true,
    thumbnailUrl: '/project-thumbnail-2.jpg',
    collaborators: [
      { id: 1, avatarUrl: '/avatar1.jpg' },
      { id: 2, avatarUrl: '/avatar2.jpg' },
    ],
  },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar projectName="Project Name" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName="John"
          temperature={22}
          date="Friday, 14 March"
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">My Projects</h2>
              
              <div className="flex space-x-6 mb-6 border-b border-gray-200">
                <button className="text-gray-600 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-900">
                  Recent Projects
                </button>
                <button className="text-gray-600 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-900">
                  Jira Projects
                </button>
                <button className="text-gray-600 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-900">
                  Collaboration Projects
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    name={project.name}
                    description={project.description}
                    date={project.date}
                    type={project.type as 'PR'}
                    isJoined={project.isJoined}
                    thumbnailUrl={project.thumbnailUrl}
                    collaborators={project.collaborators}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 