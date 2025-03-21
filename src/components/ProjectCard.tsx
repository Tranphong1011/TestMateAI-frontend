import React from 'react';
import Image from 'next/image';

interface ProjectCardProps {
  name: string;
  description: string;
  date: string;
  isJoined?: boolean;
  type: 'PR' | 'Live';
  thumbnailUrl: string;
  collaborators: Array<{
    avatarUrl: string;
    id: number;
  }>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  date,
  isJoined = false,
  type,
  thumbnailUrl,
  collaborators
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 w-full max-w-md">
      <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-sm text-white ${type === 'PR' ? 'bg-blue-500' : 'bg-green-500'}`}>
            {type}
          </span>
          <h3 className="font-semibold text-lg">{name}</h3>
        </div>
        <button
          className={`px-4 py-1 rounded-full text-sm ${
            isJoined
              ? 'bg-gray-100 text-gray-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isJoined ? 'Joined' : 'Join'}
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        
        <div className="flex -space-x-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="w-6 h-6 rounded-full border-2 border-white overflow-hidden relative"
            >
              <Image
                src={collaborator.avatarUrl}
                alt="Collaborator"
                layout="fill"
                objectFit="cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 