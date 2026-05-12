'use client';

import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { API_URL } from '@/utils/config';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepEvent {
  event: string;
  step_index: number;
  step_text: string;
  action_type: string;
  confidence: number;
  playwright_code: string;
  result?: string;
  needs_ai?: boolean;
}

interface RunSummary {
  total_steps: number;
  resolved: number;
  needs_ai: number;
  overall_confidence: number;
  status: string;
  script: string;
}

type StepStatus = 'pending' | 'running' | 'passed' | 'needs_ai' | 'unresolved';

interface StepState {
  index: number;
  text: string;
  action: string;
  confidence: number;
  playwright_code: string;
  status: StepStatus;
  needs_ai: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  testCase: {
    id: string;
    title: string;
    steps: string[];
  };
  targetUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.9 ? 'bg-green-100 text-green-700'
              : value >= 0.8 ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'running') {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
    );
  }
  if (status === 'passed') {
    return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
  }
  if (status === 'needs_ai') {
    return <ExclamationCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />;
  }
  if (status === 'unresolved') {
    return <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />;
  }
  // pending
  return <ClockIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />;
}

function StatusLabel({ status }: { status: StepStatus }) {
  if (status === 'passed')    return <span className="text-xs text-green-600 font-medium">Automatable</span>;
  if (status === 'needs_ai')  return <span className="text-xs text-orange-500 font-medium">Needs AI</span>;
  if (status === 'unresolved') return <span className="text-xs text-red-500 font-medium">Unresolved</span>;
  if (status === 'running')   return <span className="text-xs text-blue-500 font-medium">Running…</span>;
  return <span className="text-xs text-gray-400">Pending</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TestExecutionModal({ isOpen, onClose, testCase, targetUrl }: Props) {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [script, setScript] = useState('');
  const [showScript, setShowScript] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Initialise step list from test case steps whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSteps(
        testCase.steps.map((text, i) => ({
          index: i,
          text,
          action: '',
          confidence: 0,
          playwright_code: '',
          status: 'pending',
          needs_ai: false,
        }))
      );
      setSummary(null);
      setStarted(false);
      setRunning(false);
      setScript('');
      setShowScript(false);
    }
  }, [isOpen, testCase]);

  // Auto-scroll to bottom as steps stream in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  const handleRun = async () => {
    setRunning(true);
    setStarted(true);
    setSummary(null);

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
            const evt = JSON.parse(line.slice(6));
            handleEvent(evt);
          } catch {/* skip malformed */}
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

      case 'step_passed':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, status: 'passed', confidence: evt.confidence, playwright_code: evt.playwright_code, needs_ai: false }
            : s
        ));
        break;

      case 'step_needs_ai':
        setSteps(prev => prev.map(s =>
          s.index === evt.step_index
            ? { ...s, status: 'needs_ai', confidence: evt.confidence, playwright_code: evt.playwright_code, needs_ai: true }
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

      case 'run_complete':
        setSummary({
          total_steps: evt.total_steps,
          resolved: evt.resolved,
          needs_ai: evt.needs_ai,
          overall_confidence: evt.overall_confidence,
          status: evt.status,
          script: evt.script,
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

  const passedCount  = steps.filter(s => s.status === 'passed').length;
  const aiCount      = steps.filter(s => s.status === 'needs_ai' || s.status === 'unresolved').length;
  const progress     = started ? Math.round((steps.filter(s => s.status !== 'pending').length / steps.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={handleClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Run Test</h2>
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-md">{testCase.title}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Target URL ─────────────────────────────────────────── */}
        <div className="px-6 py-3 border-b bg-gray-50 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Target:</span>
          <span className="text-blue-600 truncate">{targetUrl || 'https://example.com'}</span>
        </div>

        {/* ── Progress bar ───────────────────────────────────────── */}
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

        {/* ── Step list ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {steps.map((step) => (
            <div
              key={step.index}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${
                step.status === 'running'    ? 'border-blue-200 bg-blue-50' :
                step.status === 'passed'     ? 'border-green-100 bg-green-50' :
                step.status === 'needs_ai'   ? 'border-orange-100 bg-orange-50' :
                step.status === 'unresolved' ? 'border-red-100 bg-red-50' :
                'border-gray-100 bg-white'
              }`}
            >
              <StepIcon status={step.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 font-mono">#{step.index + 1}</span>
                  <p className="text-sm text-gray-800">{step.text}</p>
                </div>
                {step.status !== 'pending' && step.playwright_code && (
                  <p className="text-xs text-gray-400 font-mono mt-1 truncate">{step.playwright_code}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {step.status !== 'pending' && <ConfidenceBadge value={step.confidence} />}
                <StatusLabel status={step.status} />
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* ── Summary ────────────────────────────────────────────── */}
        {summary && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{summary.resolved}</p>
                <p className="text-xs text-gray-500">Automatable</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{summary.needs_ai}</p>
                <p className="text-xs text-gray-500">Need AI</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{Math.round(summary.overall_confidence * 100)}%</p>
                <p className="text-xs text-gray-500">Confidence</p>
              </div>
            </div>

            {summary.needs_ai > 0 && (
              <p className="text-xs text-orange-600 text-center mb-3">
                {summary.needs_ai} step{summary.needs_ai > 1 ? 's' : ''} require AI fallback (Phase 5)
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

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <button
            onClick={handleClose}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
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
