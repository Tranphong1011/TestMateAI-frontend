'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import TestCaseDetailsModal from '@/components/TestCaseDetailsModal';
import TestExecutionModal from '@/components/TestExecutionModal';
import { useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/slices/notificationSlice';
import { API_URL } from '@/utils/config';
import ExcelJS from 'exceljs';

interface TestCase {
  id: string;
  category: string;
  testcase: string;
  description: string;
  steps: string[];
  expected_result: string;
  status?: 'approved' | 'rejected' | 'pending';
}

interface TestCaseCollection {
  ticket_id: string;
  ticket_key: string;
  testcases: TestCase[];
}

// Parse project key from ticket_key e.g. "PROJ-123" → "PROJ"
function getProjectKey(ticketKey: string): string {
  if (!ticketKey) return 'Unknown';
  const parts = ticketKey.split('-');
  return parts.length > 1 ? parts.slice(0, -1).join('-') : ticketKey;
}

const CATEGORY_COLOR: Record<string, string> = {
  functional: 'text-blue-600 bg-blue-50',
  negative:   'text-orange-600 bg-orange-50',
  security:   'text-purple-600 bg-purple-50',
  usability:  'text-teal-600 bg-teal-50',
};

// ── History mode (no URL params, or ticketId/ticketKey param) ───────────────

function HistoryPage({
  initialTicketId,
  onRun,
}: {
  initialTicketId?: string;
  onRun: (tc: TestCase) => void;
}) {
  const [collections, setCollections] = useState<TestCaseCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // expandedTicket: which ticket row is open (ticket_id)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(initialTicketId ?? null);
  // expandedProject: which project group is open
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<TestCase | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/test_cases/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: TestCaseCollection[] = Array.isArray(data) ? data : (data.test_cases ?? []);
        const sorted = list.reverse();
        setCollections(sorted);

        // Auto-expand project and ticket if initialTicketId provided
        if (initialTicketId) {
          const target = sorted.find((c) => c.ticket_id === initialTicketId);
          if (target) {
            const pKey = getProjectKey(target.ticket_key);
            setExpandedProjects(new Set([pKey]));
          }
        } else {
          // Auto-expand all projects by default
          const allKeys = new Set(sorted.map((c) => getProjectKey(c.ticket_key)));
          setExpandedProjects(allKeys);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [initialTicketId]);

  const toggleProject = (key: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalTestCases = collections.reduce((sum, c) => sum + c.testcases.length, 0);

  // Group collections by project key
  const grouped = collections.reduce<Record<string, TestCaseCollection[]>>((acc, col) => {
    const pk = getProjectKey(col.ticket_key);
    if (!acc[pk]) acc[pk] = [];
    acc[pk].push(col);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3" />
      Loading history…
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 text-sm">{error}</div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Case History</h1>
          <p className="text-sm text-gray-500 mt-1">All previously generated test cases — grouped by project</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-gray-900">{Object.keys(grouped).length}</p>
          <p className="text-xs text-gray-500 mt-1">Projects</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-600">{collections.length}</p>
          <p className="text-xs text-blue-500 mt-1">Tickets</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{totalTestCases}</p>
          <p className="text-xs text-green-500 mt-1">Total Test Cases</p>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <DocumentTextIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No test cases yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Navigate to <strong>My Projects</strong>, open a Jira ticket, then generate test cases.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([projectKey, cols]) => {
            const projectOpen = expandedProjects.has(projectKey);
            const projectTotal = cols.reduce((s, c) => s + c.testcases.length, 0);
            return (
              <div key={projectKey} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Project header */}
                <div
                  className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50 border-b border-gray-100"
                  onClick={() => toggleProject(projectKey)}
                >
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-800 text-sm">{projectKey}</span>
                    <span className="text-xs text-gray-400">{cols.length} ticket{cols.length !== 1 ? 's' : ''} · {projectTotal} test case{projectTotal !== 1 ? 's' : ''}</span>
                  </div>
                  {projectOpen
                    ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                </div>

                {/* Tickets under project */}
                {projectOpen && (
                  <div className="divide-y divide-gray-50">
                    {cols.map((col) => {
                      const ticketOpen = expandedTicket === col.ticket_id;
                      return (
                        <div key={col.ticket_id}>
                          {/* Ticket row */}
                          <div
                            className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors pl-10"
                            onClick={() => setExpandedTicket(ticketOpen ? null : col.ticket_id)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {col.ticket_key || col.ticket_id}
                              </span>
                              <span className="text-xs text-gray-400">
                                {col.testcases.length} test case{col.testcases.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {ticketOpen
                              ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                              : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                          </div>

                          {/* Test cases table */}
                          {ticketOpen && (
                            <div className="border-t border-gray-100">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-5 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test Case</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Steps</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected Result</th>
                                    <th className="px-4 py-2" />
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {col.testcases.map((tc) => (
                                    <tr
                                      key={tc.id}
                                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                                      onClick={() => setSelected(tc)}
                                    >
                                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{tc.id}</td>
                                      <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800 text-sm">{tc.testcase}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{tc.description}</p>
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLOR[(tc.category || '').toLowerCase()] || 'text-gray-600 bg-gray-50'}`}>
                                          {tc.category}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-500">{tc.steps?.length ?? 0} steps</td>
                                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                                        <span className="line-clamp-2">{tc.expected_result}</span>
                                      </td>
                                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          onClick={() => onRun(tc)}
                                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                          <PlayIcon className="w-3.5 h-3.5" />
                                          Run
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <TestCaseDetailsModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          testCase={{
            title: selected.testcase,
            category: selected.category,
            description: selected.description,
            steps: selected.steps,
            expectedResult: selected.expected_result,
            status: selected.status,
          }}
          onStatusChange={() => {}}
        />
      )}
    </div>
  );
}

// ── Generation mode (URL params present) ─────────────────────────────────────

export default function TestcasePage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [expandedTableId, setExpandedTableId] = useState<string | null>('table1');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [runningTestCase, setRunningTestCase] = useState<TestCase | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [canDownload, setCanDownload] = useState(false);
  const [stats, setStats] = useState({ totalTestCases: 0, verifiedTestCases: 0, pendingTestCases: 0, rejectedTestCases: 0 });

  const ticketTitle       = searchParams?.get('title')       ?? '';
  const ticketDescription = searchParams?.get('description') ?? '';
  const ticketKey         = searchParams?.get('key')         ?? '';
  // When navigated from qa-tickets "View Existing"
  const ticketId          = searchParams?.get('ticketId')    ?? '';

  // ── History mode: no title param (direct nav or view-existing nav) ─────────
  if (!ticketTitle) {
    return (
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <HistoryPage
          initialTicketId={ticketId || undefined}
          onRun={(tc) => setRunningTestCase(tc)}
        />
        {runningTestCase && (
          <TestExecutionModal
            isOpen={!!runningTestCase}
            onClose={() => setRunningTestCase(null)}
            testCase={{ id: runningTestCase.id, title: runningTestCase.testcase, steps: runningTestCase.steps }}
            targetUrl={targetUrl}
          />
        )}
      </div>
    );
  }

  // ── Generation mode ────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    const generateTestCases = async () => {
      if (!ticketTitle || !ticketDescription || !mounted) return;

      setLoading(true);
      setTestCases([]);
      setShowTable(false);
      setCanDownload(false);

      try {
        const response = await fetch(`${API_URL}/test_cases/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: searchParams?.get('id') ?? '',
            key: ticketKey,
            title: ticketTitle,
            desc: ticketDescription,
            issue_type: searchParams?.get('issue_type') ?? 'Task',
            priority: searchParams?.get('priority') ?? 'Medium',
            status: searchParams?.get('status') ?? 'To Do',
          }),
        });

        if (!mounted) return;
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let count = 0;

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (line.startsWith('data: ')) {
                try {
                  const tc = JSON.parse(line.slice(5).trim());
                  if (mounted) {
                    if (tc?.error === 'Invalid JSON received') {
                      setShowTable(false);
                      setLoading(false);
                      setCanDownload(false);
                      continue;
                    }
                    addTestCase(tc);
                    count++;
                    setShowTable(true);
                  }
                } catch { /* skip bad json */ }
              }
            }
            buffer = lines[lines.length - 1];
          }
        } finally {
          reader.releaseLock();
          if (mounted) {
            setLoading(false);
            // Fire notification
            if (count > 0) {
              dispatch(addNotification({
                message: `Generated ${count} test case${count !== 1 ? 's' : ''} for ${ticketKey || ticketTitle}`,
                detail: `Ticket: ${ticketKey || ticketTitle} · ${count} test case${count !== 1 ? 's' : ''} ready`,
              }));
            }
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Error generating test cases:', error);
          setLoading(false);
          setCanDownload(false);
        }
      }
    };

    generateTestCases();
    return () => { mounted = false; };
  }, [ticketTitle, searchParams]);

  useEffect(() => {
    if (!loading && testCases.length > 0) setCanDownload(true);
    else if (!loading && testCases.length === 0) setCanDownload(false);
  }, [loading, testCases.length]);

  const getCategoryColor = (category: string | undefined | null) => {
    const safeCategory = (category || 'functional').toLowerCase();
    return CATEGORY_COLOR[safeCategory] || CATEGORY_COLOR.functional;
  };

  const handleStatusChange = (status: 'approved' | 'rejected') => {
    if (!selectedTestCase) return;
    const updated = testCases.map((tc) =>
      tc.id === selectedTestCase.id ? { ...tc, status } : tc
    );
    setTestCases(updated);
    updateStats(updated);
    setSelectedTestCase({ ...selectedTestCase, status });
  };

  const updateStats = (tcs: TestCase[]) => {
    setStats({
      totalTestCases: tcs.length,
      verifiedTestCases: tcs.filter((tc) => tc.status === 'approved').length,
      pendingTestCases: tcs.filter((tc) => tc.status === 'pending').length,
      rejectedTestCases: tcs.filter((tc) => tc.status === 'rejected').length,
    });
  };

  const addTestCase = (tc: Omit<TestCase, 'status'>) => {
    setTestCases((prev) => {
      const next = [...prev, { ...tc, status: 'pending' as const }];
      updateStats(next);
      return next;
    });
  };

  const handleDownload = async () => {
    if (testCases.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Test Cases');
    ws.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Test Case Title', key: 'testcase', width: 35 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Steps', key: 'steps', width: 60 },
      { header: 'Expected Result', key: 'expected_result', width: 50 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    testCases.forEach((tc) => {
      const row = ws.addRow({ ...tc, steps: tc.steps?.join('\n') ?? '' });
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });
    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ADD8E6' } };
      cell.font = { bold: true };
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    headerRow.height = 20;
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `Test_Report_${ticketTitle.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Test Cases for: {ticketTitle}</h1>
          <div className="flex items-center space-x-3">
            {canDownload && (
              <input
                type="text"
                placeholder="Target URL (e.g. https://yourapp.com)"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                !canDownload ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={handleDownload}
              disabled={!canDownload}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.totalTestCases, bg: 'bg-blue-100', text: 'text-blue-600' },
            { label: 'Verified', value: stats.verifiedTestCases, bg: 'bg-green-100', text: 'text-green-600' },
            { label: 'Pending', value: stats.pendingTestCases, bg: 'bg-yellow-100', text: 'text-yellow-600' },
            { label: 'Rejected', value: stats.rejectedTestCases, bg: 'bg-red-100', text: 'text-red-600' },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                  <span className={`${text} font-semibold`}>{value}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label} Test Cases</p>
                  <p className="font-semibold">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && !showTable ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
            <p className="text-gray-600">Generating test cases...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm mb-4">
            <div
              className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedTableId(expandedTableId === 'table1' ? null : 'table1')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Generated Test Cases</h2>
                  <p className="text-sm text-gray-500">Test cases generated based on ticket requirements</p>
                </div>
                <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedTableId === 'table1' ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {expandedTableId === 'table1' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['ID', 'Test Case', 'Category', 'Status', 'Steps Count', 'Expected Result', 'Run'].map((h) => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testCases.map((tc) => (
                      <tr
                        key={tc.id}
                        onClick={() => setSelectedTestCase(tc)}
                        className={`cursor-pointer transition-colors ${
                          selectedTestCase?.id === tc.id ? 'bg-blue-100 hover:bg-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tc.id}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{tc.testcase}</div>
                          <div className="text-sm text-gray-500">{tc.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-md text-xs ${getCategoryColor(tc.category)}`}>{tc.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tc.status === 'approved' ? 'bg-green-100 text-green-700' :
                            tc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                              tc.status === 'approved' ? 'bg-green-500' :
                              tc.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            {tc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{tc.steps?.length} steps</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-md line-clamp-2">{tc.expected_result}</div>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setRunningTestCase(tc)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <PlayIcon className="w-3.5 h-3.5" />
                            Run
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTestCase && (
        <TestCaseDetailsModal
          isOpen={!!selectedTestCase}
          onClose={() => setSelectedTestCase(null)}
          testCase={{
            title: selectedTestCase.testcase,
            category: selectedTestCase.category,
            description: selectedTestCase.description,
            steps: selectedTestCase.steps,
            expectedResult: selectedTestCase.expected_result,
            status: selectedTestCase.status,
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {runningTestCase && (
        <TestExecutionModal
          isOpen={!!runningTestCase}
          onClose={() => setRunningTestCase(null)}
          testCase={{ id: runningTestCase.id, title: runningTestCase.testcase, steps: runningTestCase.steps }}
          targetUrl={targetUrl}
        />
      )}
    </div>
  );
}
