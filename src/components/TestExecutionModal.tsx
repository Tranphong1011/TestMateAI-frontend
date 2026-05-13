'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  XCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '@/utils/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RunSummary {
  total_steps: number;
  resolved: number;
  needs_ai: number;
  overall_confidence: number;
  status: string;
  script: string;
  // Phase 3
  passed_steps: number;
  failed_steps: number;
  total_duration_ms: number;
  // Phase 6
  ai_call_count: number;
  ai_cost_usd: number;
}

type StepStatus = 'pending' | 'running' | 'passed' | 'failed' | 'needs_ai' | 'unresolved' | 'ai_resolving';

interface StepState {
  index: number;
  text: string;
  action: string;
  confidence: number;
  playwright_code: string;
  status: StepStatus;
  needs_ai: boolean;
  // Phase 3
  duration_ms?: number;
  error?: string;
  screenshot_b64?: string;
  // Phase 5
  ai_resolved?: boolean;
  ai_playwright_code?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  testCase: { id: string; title: string; steps: string[] };
  targetUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.9 ? 'bg-green-100 text-green-700'
    : value >= 0.8 ? 'bg-blue-100 text-blue-700'
    : 'bg-orange-100 text-orange-700';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{pct}%</span>
  );
}

function DurationBadge({ ms }: { ms: number }) {
  return (
    <span className="text-xs text-gray-400 font-mono">{ms}ms</span>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'running' || status === 'ai_resolving') {
    const color = status === 'ai_resolving' ? 'border-purple-500' : 'border-blue-500';
    return <div className={`w-5 h-5 rounded-full border-2 ${color} border-t-transparent animate-spin flex-shrink-0`} />;
  }
  if (status === 'passed') return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
  if (status === 'failed') return <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
  if (status === 'needs_ai') return <ExclamationCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />;
  if (status === 'unresolved') return <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />;
  return <ClockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />;
}

function StatusLabel({ status, aiResolved }: { status: StepStatus; aiResolved?: boolean }) {
  if (status === 'passed' && aiResolved)
    return (
      <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
        <SparklesIcon className="w-3 h-3" /> AI Resolved
      </span>
    );
  if (status === 'passed')    return <span className="text-xs text-green-600 font-medium">Passed</span>;
  if (status === 'failed')    return <span className="text-xs text-red-500 font-medium">Failed</span>;
  if (status === 'needs_ai')  return <span className="text-xs text-orange-500 font-medium">Needs AI</span>;
  if (status === 'unresolved') return <span className="text-xs text-red-500 font-medium">Unresolved</span>;
  if (status === 'running')   return <span className="text-xs text-blue-500 font-medium">Running…</span>;
  if (status === 'ai_resolving') return <span className="text-xs text-purple-500 font-medium">AI Resolving…</span>;
  return <span className="text-xs text-gray-400">Pending</span>;
}

function stepBorderClass(status: StepStatus) {
  switch (status) {
    case 'running':      return 'border-blue-200 bg-blue-50';
    case 'ai_resolving': return 'border-purple-200 bg-purple-50';
    case 'passed':       return 'border-green-100 bg-green-50';
    case 'failed':       return 'border-red-100 bg-red-50';
    case 'needs_ai':     return 'border-orange-100 bg-orange-50';
    case 'unresolved':   return 'border-red-100 bg-red-50';
    default:             return 'border-gray-100 bg-white';
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TestExecutionModal({ isOpen, onClose, testCase, targetUrl }: Props) {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [script, setScript] = useState('');
  const [showScript, setShowScript] = useState(false);
  const [costCapReached, setCostCapReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSteps(
        testCase.steps.map((text, i) => ({
          index: i, text, action: '', confidence: 0,
          playwright_code: '', status: 'pending', needs_ai: false,
        }))
      );
      setSummary(null);
      setStarted(false);
      setRunning(false);
      setScript('');
      setShowScript(false);
      setCostCapReached(false);
    }
  }, [isOpen, testCase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  const handleRun = async () => {
    setRunning(true);
    setStarted(true);
    setSummary(null);
    setCostCapReached(false);

    try {
      const response = await fetch(`${API_URL}/execute/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testCase.id,
          steps: testCase.steps,
          target_url: targetUrl || 'https://example.com',
          intranet: false,
        }),
      });
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line.startsWith('data: ')) continue;
          try {
            handleEvent(JSON.parse(line.slice(6)));
          } catch { /* skip malformed */ }
        }
        buffer = lines[lines.length - 1];
      }
    } catch (err) {
      console.error('Run error:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleEvent = (evt: any) => {
    switch (evt.event) {
      case 'run_started':
        break;

      case 'step_running':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, action: evt.action_type, confidence: evt.confidence, playwright_code: evt.playwright_code, status: 'running' }
            : s
        ));
        break;

      // Phase 5: AI is being invoked
      case 'fallback_triggered':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index ? { ...s, status: 'ai_resolving' } : s
        ));
        break;

      case 'step_passed':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, status: 'passed', confidence: evt.confidence, playwright_code: evt.playwright_code,
                duration_ms: evt.duration_ms, needs_ai: false }
            : s
        ));
        break;

      // Phase 3: real failure from Docker
      case 'step_failed':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, status: 'failed', confidence: evt.confidence, playwright_code: evt.playwright_code,
                duration_ms: evt.duration_ms, error: evt.error, screenshot_b64: evt.screenshot_b64, needs_ai: false }
            : s
        ));
        break;

      case 'step_needs_ai':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, status: 'needs_ai', confidence: evt.confidence, playwright_code: evt.playwright_code,
                needs_ai: true, ai_resolved: evt.ai_resolved, ai_playwright_code: evt.ai_playwright_code }
            : s
        ));
        break;

      case 'step_unresolved':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, status: 'unresolved', confidence: 0, needs_ai: true }
            : s
        ));
        break;

      // Phase 5: AI resolved the step
      case 'fallback_resolved':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, ai_resolved: true, ai_playwright_code: evt.ai_playwright_code }
            : s
        ));
        break;

      // Phase 6: cost cap hit
      case 'ai_cost_cap_reached':
        setCostCapReached(true);
        break;

      case 'run_complete':
        setSummary({
          total_steps: evt.total_steps,
          resolved: evt.resolved,
          needs_ai: evt.needs_ai,
          overall_confidence: evt.overall_confidence,
          status: evt.status,
          script: evt.script,
          passed_steps: evt.passed_steps ?? 0,
          failed_steps: evt.failed_steps ?? 0,
          total_duration_ms: evt.total_duration_ms ?? 0,
          ai_call_count: evt.ai_call_count ?? 0,
          ai_cost_usd: evt.ai_cost_usd ?? 0,
        });
        setScript(evt.script || '');
        break;
    }
  };

  const handleClose = () => {
    readerRef.current?.cancel();
    onClose();
  };

  if (!isOpen) return null;

  const progress = started
    ? Math.round((steps.filter(s => s.status !== 'pending').length / steps.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Run Test</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-md">{testCase.title}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Target URL */}
        <div className="px-6 py-2.5 border-b bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Target:</span>
          <span className="text-blue-600 truncate">{targetUrl || 'https://example.com'}</span>
        </div>

        {/* Progress bar */}
        {started && (
          <div className="px-6 pt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progress}% complete</span>
              <span>{steps.filter(s => s.status !== 'pending').length} / {steps.length} steps</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cost cap warning */}
        {costCapReached && (
          <div className="mx-6 mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            AI call limit reached — remaining low-confidence steps will not be auto-resolved.
          </div>
        )}

        {/* Step list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {steps.map((step) => (
            <div key={step.index} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${stepBorderClass(step.status)}`}>
              <StepIcon status={step.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-mono">#{step.index + 1}</span>
                  <p className="text-sm text-gray-800">{step.text}</p>
                </div>
                {step.status !== 'pending' && step.playwright_code && (
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate">{step.playwright_code}</p>
                )}
                {/* AI resolved code */}
                {step.ai_resolved && step.ai_playwright_code && (
                  <p className="text-xs text-purple-600 font-mono mt-1 truncate">
                    <SparklesIcon className="w-3 h-3 inline mr-1" />
                    {step.ai_playwright_code}
                  </p>
                )}
                {/* Error message on failure */}
                {step.status === 'failed' && step.error && (
                  <p className="text-xs text-red-500 mt-1 line-clamp-2">{step.error}</p>
                )}
                {/* Screenshot thumbnail on failure */}
                {step.screenshot_b64 && (
                  <details className="mt-1">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View screenshot</summary>
                    <img
                      src={`data:image/png;base64,${step.screenshot_b64}`}
                      alt="failure screenshot"
                      className="mt-1 max-h-40 rounded border border-gray-200"
                    />
                  </details>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {step.duration_ms !== undefined && <DurationBadge ms={step.duration_ms} />}
                {step.status !== 'pending' && <ConfidenceBadge value={step.confidence} />}
                <StatusLabel status={step.status} aiResolved={step.ai_resolved} />
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Summary */}
        {summary && (
          <div className="px-6 py-4 border-t bg-gray-50">
            {/* Primary metrics */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{summary.passed_steps}</p>
                <p className="text-xs text-gray-500">Passed</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-500">{summary.failed_steps}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-500">{summary.needs_ai}</p>
                <p className="text-xs text-gray-500">Needs AI</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600">{Math.round(summary.overall_confidence * 100)}%</p>
                <p className="text-xs text-gray-500">Confidence</p>
              </div>
            </div>

            {/* Secondary metrics: timing + AI cost */}
            <div className="flex justify-center gap-6 text-xs text-gray-500 mb-3 pt-2 border-t border-gray-200">
              <span>
                <span className="font-medium text-gray-700">{(summary.total_duration_ms / 1000).toFixed(1)}s</span> total
              </span>
              {summary.ai_call_count > 0 && (
                <>
                  <span>
                    <span className="font-medium text-purple-600">{summary.ai_call_count}</span> AI calls
                  </span>
                  <span>
                    <span className="font-medium text-purple-600">${summary.ai_cost_usd.toFixed(4)}</span> AI cost
                  </span>
                </>
              )}
            </div>

            {summary.needs_ai > 0 && (
              <p className="text-xs text-orange-600 text-center mb-3">
                {summary.needs_ai} step{summary.needs_ai > 1 ? 's' : ''} require manual review or BYOL AI key
              </p>
            )}

            {script && (
              <button
                onClick={() => setShowScript(v => !v)}
                className="w-full text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {showScript ? 'Hide' : 'View'} generated Playwright script
              </button>
            )}

            {showScript && script && (
              <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-x-auto max-h-48 font-mono">
                {script}
              </pre>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <button onClick={handleClose} className="text-sm text-gray-600 hover:text-gray-800">
            Close
          </button>
          <button
            onClick={handleRun}
            disabled={running || !!summary}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              running || summary
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            {running ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Running…
              </>
            ) : summary ? (
              'Completed'
            ) : (
              '▶ Run Test'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
