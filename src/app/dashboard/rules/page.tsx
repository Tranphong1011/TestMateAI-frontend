'use client';

import React, { useEffect, useState } from 'react';
import {
  SparklesIcon,
  ArrowPathIcon,
  CpuChipIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '@/utils/config';

interface CompilerRule {
  pattern: string;
  action_type: string;
  playwright_template: string;
  confidence: number;
  hit_count: number;
  source: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  navigate:       'bg-blue-100 text-blue-700',
  click:          'bg-green-100 text-green-700',
  fill:           'bg-teal-100 text-teal-700',
  assert_text:    'bg-purple-100 text-purple-700',
  assert_visible: 'bg-indigo-100 text-indigo-700',
  wait:           'bg-yellow-100 text-yellow-700',
  select:         'bg-orange-100 text-orange-700',
  unresolved:     'bg-red-100 text-red-500',
};

export default function RulesPage() {
  const [rules, setRules] = useState<CompilerRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchRules = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${API_URL}/execute/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRules(await res.json());
    } catch (e: any) {
      setError(e.message || 'Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const filtered = filter === 'all' ? rules : rules.filter(r => r.source === filter);
  const aiRules = rules.filter(r => r.source === 'ai').length;
  const manualRules = rules.filter(r => r.source === 'manual').length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compiler Learning Rules</h1>
          <p className="text-sm text-gray-500 mt-1">
            Phase 6 — AI resolutions saved as deterministic rules. Next time the same step appears, no AI call is needed.
          </p>
        </div>
        <button onClick={fetchRules} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-gray-900">{rules.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Rules</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-1">
            <SparklesIcon className="w-6 h-6" />{aiRules}
          </p>
          <p className="text-xs text-purple-500 mt-1">Learned from AI</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-600">{manualRules}</p>
          <p className="text-xs text-blue-500 mt-1">Manual rules</p>
        </div>
      </div>

      {/* How it works callout */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4 mb-6 flex gap-3">
        <CpuChipIcon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">How learning works: </span>
          When AI resolves a step it can't handle deterministically, the mapping is saved here.
          Next time the <span className="font-mono bg-white px-1 rounded text-xs">pattern</span> appears in any test run, it's matched without an AI call — saving cost and time.
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'ai', 'manual'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'ai' ? '✦ AI-learned' : '✎ Manual'}
          </button>
        ))}
      </div>

      {/* Rules list */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <BookOpenIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No rules yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Use <strong>AI Resolve</strong> on a failing step and it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rule, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {/* Pattern — the NL input */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {rule.source === 'ai' && (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">
                        <SparklesIcon className="w-3 h-3" /> AI-learned
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTION_COLORS[rule.action_type] || 'bg-gray-100 text-gray-500'}`}>
                      {rule.action_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {rule.hit_count} hit{rule.hit_count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* NL pattern */}
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    &ldquo;{rule.pattern}&rdquo;
                  </p>

                  {/* Arrow → Playwright code */}
                  <div className="flex items-start gap-2">
                    <span className="text-gray-300 text-sm mt-0.5">→</span>
                    <code className="text-xs font-mono text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 flex-1">
                      {rule.playwright_template}
                    </code>
                  </div>
                </div>

                {/* Right meta */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold ${rule.confidence >= 0.9 ? 'text-green-600' : rule.confidence >= 0.8 ? 'text-blue-600' : 'text-orange-500'}`}>
                    {Math.round(rule.confidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">confidence</div>
                  <div className="text-xs text-gray-300 mt-1">
                    {new Date(rule.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
