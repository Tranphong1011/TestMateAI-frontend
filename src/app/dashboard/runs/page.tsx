'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '@/utils/config';

interface RunSummary {
  test_id: string;
  status: string;
  total_steps: number;
  resolved: number;
  needs_ai: number;
  overall_confidence: number;
  passed_steps: number;
  failed_steps: number;
  total_duration_ms: number;
  ai_call_count: number;
  ai_cost_usd: number;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'passed')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircleIcon className="w-3 h-3" />Passed</span>;
  if (status === 'failed')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600"><XCircleIcon className="w-3 h-3" />Failed</span>;
  if (status === 'partial')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600"><ExclamationCircleIcon className="w-3 h-3" />Partial</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"><ClockIcon className="w-3 h-3" />{status}</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRuns = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/execute/runs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRuns(data.reverse()); // newest first
    } catch (e: any) {
      setError(e.message || 'Failed to load runs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRuns(); }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Run History</h1>
          <p className="text-sm text-gray-500 mt-1">Phase 4 — Full execution audit trail</p>
        </div>
        <button
          onClick={fetchRuns}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Phase legend */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Runs', value: runs.length, color: 'text-gray-900' },
          { label: 'Passed', value: runs.filter(r => r.status === 'passed').length, color: 'text-green-600' },
          { label: 'Failed / Partial', value: runs.filter(r => r.status !== 'passed').length, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <ArrowPathIcon className="w-6 h-6 animate-spin mr-2" /> Loading…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 text-sm">{error}</div>
      ) : runs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ClockIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No runs yet</p>
          <p className="text-sm text-gray-400 mt-1">Run a test case to see execution history here.</p>
          <Link href="/dashboard/testcase" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Go to Test Cases →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Test ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Steps</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Confidence</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Duration</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">AI Calls</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run, idx) => (
                <tr key={run.test_id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{run.test_id}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-600 font-medium">{run.passed_steps}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-gray-500">{run.total_steps}</span>
                    {run.failed_steps > 0 && <span className="text-red-400 ml-1">({run.failed_steps} fail)</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-medium ${run.overall_confidence >= 0.9 ? 'text-green-600' : run.overall_confidence >= 0.8 ? 'text-blue-600' : 'text-orange-500'}`}>
                      {Math.round(run.overall_confidence * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">{formatDuration(run.total_duration_ms)}</td>
                  <td className="px-4 py-3 text-center">
                    {run.ai_call_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-purple-600 text-xs font-medium">
                        <SparklesIcon className="w-3 h-3" />{run.ai_call_count}
                        <span className="text-gray-400">(${run.ai_cost_usd.toFixed(4)})</span>
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(run.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/runs/${run.test_id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      View trace →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
