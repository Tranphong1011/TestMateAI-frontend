'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon, ShareIcon, AdjustmentsHorizontalIcon, BeakerIcon, DocumentTextIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MemoryEntry {
  id: string;
  ticketId: string;
  testCaseType: string;
  generatedAt: string;
  contextSize: number;
  accuracy: number;
  status: 'active' | 'archived';
  summary: string;
}

interface KnowledgeMetrics {
  totalMemoryEntries: number;
  activeContextSize: number;
  averageAccuracy: number;
  lastTrained: string;
}

export default function LLMTuningPage() {
  const [activeTab, setActiveTab] = useState('knowledge-base');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  const [metrics] = useState<KnowledgeMetrics>({
    totalMemoryEntries: 156,
    activeContextSize: 25600,
    averageAccuracy: 92.5,
    lastTrained: '2024-04-01 14:30:00'
  });

  const [memoryEntries] = useState<MemoryEntry[]>([
    {
      id: '1',
      ticketId: 'TICK-001',
      testCaseType: 'Functional',
      generatedAt: '2024-04-01 10:00:00',
      contextSize: 1024,
      accuracy: 95,
      status: 'active',
      summary: 'Login functionality test cases with OAuth integration'
    },
    {
      id: '2',
      ticketId: 'TICK-002',
      testCaseType: 'Security',
      generatedAt: '2024-04-01 11:30:00',
      contextSize: 2048,
      accuracy: 88,
      status: 'active',
      summary: 'Data encryption and user permission validation'
    },
    {
      id: '3',
      ticketId: 'TICK-003',
      testCaseType: 'Performance',
      generatedAt: '2024-04-01 12:45:00',
      contextSize: 1536,
      accuracy: 90,
      status: 'archived',
      summary: 'Load testing scenarios for concurrent user access'
    }
  ]);

  const handleEntrySelect = (id: string) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'archived':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">LLM Knowledge Base Tuning</h1>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-blue-600">
              <BeakerIcon className="w-5 h-5" />
              <span>Run Training</span>
            </button>
            <button className="flex items-center space-x-2 text-blue-600">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>Adjust Parameters</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Memory Entries</p>
                <p className="font-semibold">{metrics.totalMemoryEntries}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">Ctx</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Context Size</p>
                <p className="font-semibold">{metrics.activeContextSize.toLocaleString()} tokens</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">%</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Accuracy</p>
                <p className="font-semibold">{metrics.averageAccuracy}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BeakerIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Trained</p>
                <p className="font-semibold">{new Date(metrics.lastTrained).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('knowledge-base')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'knowledge-base'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('training-history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'training-history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Training History
            </button>
            <button
              onClick={() => setActiveTab('parameters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'parameters'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Parameters
            </button>
          </nav>
        </div>

        {/* Memory Entries Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Memory Entries</h3>
              {selectedEntries.length > 0 && (
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                    <TrashIcon className="w-5 h-5" />
                    <span>Archive Selected</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEntries(memoryEntries.map(entry => entry.id));
                      } else {
                        setSelectedEntries([]);
                      }
                    }}
                    checked={selectedEntries.length === memoryEntries.length}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Context Size
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memoryEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={() => handleEntrySelect(entry.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.ticketId}</div>
                    <div className="text-sm text-gray-500">{entry.summary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{entry.testCaseType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.generatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.contextSize.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getAccuracyColor(entry.accuracy)}`}>
                      {entry.accuracy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 