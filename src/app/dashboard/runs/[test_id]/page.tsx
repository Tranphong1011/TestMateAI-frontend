'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '@/utils/config';

interface StepLog {
  step_index: number;
  step_text: string;
  action_type: string;
  playwright_code: string;
  confidence: number;
  needs_ai: boolean;
  result: string | null;
  duration_ms: number | null;
  error: string | null;
  event: string;
  ai_resolved: boolean;
  ai_playwright_code: string | null;
}

interface RunDetail {
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
  step_logs: StepLog[];
}

function StepIcon({ result }: { result: string | null }) {
  if (result === 'passed') return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
  if (result === 'failed') return <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
  if (result === 'needs_ai') return <ExclamationCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />;
  if (result === 'unresolved') return <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />;
  return <ClockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />;
}

function stepRowColor(result: string | null) {
  if (result === 'passed') return 'border-green-100 bg-green-50';
  if (result === 'failed') return 'border-red-100 bg-red-50';
  if (result === 'needs_ai') return 'border-orange-100 bg-orange-50';
  if (result === 'unresolved') return 'border-red-100 bg-red-50';
  return 'border-gray-100 bg-white';
}

function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.9 ? 'bg-green-100 text-green-700' : value >= 0.8 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700';
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{pct}%</span>;
}

function EventBadge({ event }: { event: string }) {
  const map: Record<string, string> = {
    step_passed: 'bg-green-100 text-green-700',
    step_failed: 'bg-red-100 text-red-600',
    step_needs_ai: 'bg-orange-100 text-orange-600',
    step_unresolved: 'bg-red-100 text-red-600',
    fallback_resolved: 'bg-purple-100 text-purple-700',
    step_compiled: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-mono ${map[event] || 'bg-gray-100 text-gray-500'}`}>
      {event}
    </span>
  );
}

export default function RunDetailPage() {
  const params = useParams();
  const testId = params.test_id as string;

  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  useEffect(() => {
    const fetchRun = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/execute/runs/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setRun(await res.json());
      } catch (e: any) {
        setError(e.message || 'Failed to load run');
      } finally {
        setLoading(false);
      }
    };
    fetchRun();
  }, [testId]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading trace…</div>
  );
  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">{error}</div>
  );
  if (!run) return null;

  const durationSec = (run.total_duration_ms / 1000).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/runs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Run History
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{run.test_id}</h1>
            <p className="text-xs text-gray-400 mt-1">{new Date(run.created_at).toLocaleString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            run.status === 'passed' ? 'bg-green-100 text-green-700' :
            run.status === 'failed' ? 'bg-red-100 text-red-600' :
            'bg-orange-100 text-orange-600'
          }`}>
            {run.status.toUpperCase()}
          </span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{run.passed_steps}</p>
            <p className="text-xs text-gray-400">Passed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{run.failed_steps}</p>
            <p className="text-xs text-gray-400">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{run.needs_ai}</p>
            <p className="text-xs text-gray-400">Needs AI</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{Math.round(run.overall_confidence * 100)}%</p>
            <p className="text-xs text-gray-400">Confidence</p>
          </div>
        </div>

        {/* Phase 4 + 6 meta */}
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <span><span className="font-medium text-gray-700">{durationSec}s</span> total duration</span>
          <span><span className="font-medium text-gray-700">{run.total_steps}</span> steps total</span>
          {run.ai_call_count > 0 && (
            <>
              <span className="flex items-center gap-1 text-purple-600">
                <SparklesIcon className="w-4 h-4" />
                <span className="font-medium">{run.ai_call_count}</span> AI calls
              </span>
              <span className="text-purple-600">
                <span className="font-medium">${run.ai_cost_usd.toFixed(4)}</span> AI cost
              </span>
            </>
          )}
        </div>
      </div>

      {/* Step trace — Phase 4 Constraint 3: unified log */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Execution Trace — every step, deterministic &amp; AI-resolved
      </h2>

      <div className="space-y-2">
        {run.step_logs.map((step) => {
          const isExpanded = expandedStep === step.step_index;
          const hasDetails = step.error || step.ai_playwright_code || step.playwright_code;
          return (
            <div key={step.step_index} className={`rounded-xl border transition-all ${stepRowColor(step.result)}`}>
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => hasDetails && setExpandedStep(isExpanded ? null : step.step_index)}
              >
                <StepIcon result={step.result} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">#{step.step_index + 1}</span>
                    <p className="text-sm text-gray-800 font-medium">{step.step_text}</p>
                    {step.ai_resolved && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
                        <SparklesIcon className="w-3 h-3" /> AI Resolved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <EventBadge event={step.event} />
                    <span className="text-xs text-gray-400 font-mono">{step.action_type}</span>
                    {step.duration_ms !== null && (
                      <span className="text-xs text-gray-400 font-mono">{step.duration_ms}ms</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ConfidencePill value={step.confidence} />
                  {hasDetails && (
                    isExpanded
                      ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                      : <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-11 pb-3 space-y-2">
                  {step.playwright_code && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Playwright code (deterministic)</p>
                      <code className="block text-xs bg-gray-900 text-green-400 p-2 rounded font-mono whitespace-pre-wrap">
                        {step.playwright_code}
                      </code>
                    </div>
                  )}
                  {step.ai_playwright_code && (
                    <div>
                      <p className="text-xs text-purple-500 mb-1">AI-resolved Playwright code</p>
                      <code className="block text-xs bg-purple-900 text-purple-200 p-2 rounded font-mono whitespace-pre-wrap">
                        {step.ai_playwright_code}
                      </code>
                    </div>
                  )}
                  {step.error && (
                    <div>
                      <p className="text-xs text-red-400 mb-1">Error</p>
                      <p className="text-xs bg-red-50 text-red-600 p-2 rounded border border-red-100">{step.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
