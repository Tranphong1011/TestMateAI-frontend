'use client';

import React, { useState, useEffect } from 'react';
import TicketDetailsModal from '@/components/TicketDetailsModal';
import { useRouter } from 'next/navigation';

interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  testcase_generated: boolean;
  project_id: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  commentsCount: number;
  attachmentsCount: number;
  assignedTo: {
    id: number;
    name: string;
    avatar: string;
    role?: string;
  }[];
  createdBy: {
    name: string;
    avatar: string;
  };
  timeline: string;
  attachments: {
    url: string;
    preview: string;
  }[];
}

export default function QATickets() {
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('https://localhost:7000/api/v1/jira/issues?user_id=90eea180-e5a5-4b82-b31a-e47e30b4579f', {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }

        const data = await response.json();
        setIssues(data.issues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleCreateTestcases = () => {
    if (selectedTicket) {
      const params = new URLSearchParams({
        title: selectedTicket.title,
        description: selectedTicket.description
      });
      router.push(`/dashboard/testcase?${params.toString()}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">QA Ready Tickets</h1>
          <button 
            onClick={handleCreateTestcases}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Testcases</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTicket({
                  id: issue.id,
                  title: issue.summary,
                  description: `Project: ${issue.project_id}\nStatus: ${issue.status}`,
                  date: new Date().toLocaleDateString(),
                  tags: [issue.status],
                  commentsCount: 0,
                  attachmentsCount: 0,
                  createdBy: {
                    name: 'System',
                    avatar: '/avatar1.jpg'
                  },
                  assignedTo: [],
                  timeline: new Date().toLocaleDateString(),
                  attachments: []
                })}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    checked={issue.testcase_generated}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-gray-500 text-sm">{issue.key}</span>
                      </div>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 line-clamp-2">{issue.summary}</h3>
                    
                    <div className="flex items-center space-x-2 mb-3 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded-md text-sm mt-1 ${
                          issue.status === 'In Progress' 
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {issue.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-sm mt-1">
                        {issue.project_id}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>{issue.testcase_generated ? 'Testcase Generated' : 'No Testcase'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onGenerateTestcases={handleCreateTestcases}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
} 