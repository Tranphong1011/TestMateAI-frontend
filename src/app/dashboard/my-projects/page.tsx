'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';
import { setSelectedProject } from '@/store/slices/projectSlice';
import { API_URL } from '@/utils/config';

interface Project {
  id: string;
  name: string;
  description: string;
  date: string;
  status: string;
  thumbnail: string;
  members: number;
  type: string;
}

interface ProjectResponse {
  projects: Project[];
  tool: string;
  cloud_id: string;
}

type Tab = 'recent' | 'jira' | 'collaboration';

const TABS: { id: Tab; label: string }[] = [
  { id: 'recent', label: 'Recent Projects' },
  { id: 'jira', label: 'Jira Projects' },
  { id: 'collaboration', label: 'Collaboration Projects' },
];

export default function MyProjects() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<Tab>('recent');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/jira/authorized-projects/jira?user_id=${user?.user_id}`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data: ProjectResponse = await res.json();
      setProjects(data.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleProjectClick = (project: Project) => {
    dispatch(setSelectedProject({ ...project, type: 'jira' }));
  };

  // ── Project card — always clickable, no Join/dim logic ──────────────────
  const ProjectCard = ({ project }: { project: Project }) => (
    <Link
      href={`/dashboard/qa-tickets?projectId=${project.id}`}
      onClick={() => handleProjectClick(project)}
      className="border rounded-lg overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-150 cursor-pointer block"
    >
      <Image
        src={project.thumbnail}
        alt={project.name}
        width={400}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-400">
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
    </Link>
  );

  // ── Content per tab ──────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeTab === 'collaboration') {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <p className="font-medium">No collaboration projects yet</p>
          <p className="text-sm mt-1">Invite teammates to start collaborating.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <ArrowPathIcon className="w-6 h-6 animate-spin mr-2" />
          Loading projects…
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={fetchProjects}
            className="text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
          <p className="font-medium">No projects found</p>
          <p className="text-sm mt-1">Connect Jira to see your projects here.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Projects Section */}
      <div className="bg-white rounded-lg p-6">
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
