'use client';

import React, { useState, useEffect } from 'react';
import TicketDetailsModal from '@/components/TicketDetailsModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { API_URL } from '@/utils/config';

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
  key: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  commentsCount: number;
  attachmentsCount: number;
  assignedTo: { id: number; name: string; avatar: string; role?: string }[];
  createdBy: { name: string; avatar: string };
  timeline: string;
  attachments: { url: string; preview: string }[];
}

// ── Choice modal when ticket already has test cases ─────────────────────────
function TestcaseChoiceModal({
  ticket,
  onClose,
  onGenerateNew,
  onViewExisting,
}: {
  ticket: JiraIssue;
  onClose: () => void;
  onGenerateNew: () => void;
  onViewExisting: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Test Cases Already Exist
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{ticket.key}</span>
          {' '}already has generated test cases. What would you like to do?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onViewExisting}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Existing Test Cases
          </button>
          <button
            onClick={onGenerateNew}
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Generate New (overwrite)
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QATickets() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [choiceIssue, setChoiceIssue] = useState<JiraIssue | null>(null);
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const projectId = searchParams?.get('projectId') ?? '';

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const user_id = user?.user_id;
        const url = projectId
          ? `${API_URL}/jira/issues?user_id=${user_id}&project_id=${projectId}`
          : `${API_URL}/jira/issues?user_id=${user_id}`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Failed to fetch issues');
        const data = await response.json();
        setIssues(data.issues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [projectId, user?.user_id]);

  // Navigate to generate test cases for a ticket
  const navigateToGenerate = (ticket: Ticket | JiraIssue) => {
    const params = new URLSearchParams({
      title: 'title' in ticket ? ticket.title : ticket.summary,
      description: 'description' in ticket
        ? ticket.description
        : `Project: ${ticket.project_id}\nStatus: ${'status' in ticket ? ticket.status : ''}`,
      id: ticket.id,
      key: ticket.key,
    });
    router.push(`/dashboard/testcase?${params.toString()}`);
  };

  // Navigate to view existing test cases (history, pre-expanded)
  const navigateToView = (issue: JiraIssue) => {
    router.push(`/dashboard/testcase?ticketId=${issue.id}&ticketKey=${issue.key}`);
  };

  // Handle card click
  const handleIssueClick = (issue: JiraIssue) => {
    if (issue.testcase_generated) {
      setChoiceIssue(issue);
    } else {
      setSelectedTicket(issueToTicket(issue));
    }
  };

  const issueToTicket = (issue: JiraIssue): Ticket => ({
    id: issue.id,
    key: issue.key,
    title: issue.summary,
    description: `Project: ${issue.project_id}\nStatus: ${issue.status}`,
    date: new Date().toLocaleDateString(),
    tags: [issue.status],
    commentsCount: 0,
    attachmentsCount: 0,
    createdBy: { name: 'System', avatar: '/avatar1.jpg' },
    assignedTo: [],
    timeline: new Date().toLocaleDateString(),
    attachments: [],
  });

  const handleCreateTestcases = () => {
    if (selectedTicket) navigateToGenerate(selectedTicket);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">QA Ready Tickets</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleIssueClick(issue)}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                    checked={issue.testcase_generated}
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-gray-500 text-sm">{issue.key}</span>
                      </div>
                      {issue.testcase_generated && (
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                          Has Test Cases
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-medium mb-2 line-clamp-2">{issue.summary}</h3>

                    <div className="flex items-center space-x-2 mb-3 flex-wrap">
                      <span className={`px-2 py-1 rounded-md text-sm mt-1 ${
                        issue.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {issue.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-sm mt-1">
                        {issue.project_id}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>{issue.testcase_generated ? 'Test Cases Generated' : 'No Test Cases'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Choice modal for tickets that already have test cases */}
      {choiceIssue && (
        <TestcaseChoiceModal
          ticket={choiceIssue}
          onClose={() => setChoiceIssue(null)}
          onGenerateNew={() => { setChoiceIssue(null); navigateToGenerate(choiceIssue); }}
          onViewExisting={() => { setChoiceIssue(null); navigateToView(choiceIssue); }}
        />
      )}

      {/* Standard ticket details modal for tickets without test cases */}
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
