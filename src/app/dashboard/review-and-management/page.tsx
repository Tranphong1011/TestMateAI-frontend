'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

interface TestCase {
  title: string;
  category: string[];
  noOfTestCase: number;
}

export default function ReviewAndManagementPage() {
  const [activeTab, setActiveTab] = useState('recents');
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      title: 'Overall UX Process of full product for first version',
      category: ['UX Design', 'UX Research'],
      noOfTestCase: 10
    },
    {
      title: 'Overall UX Process of full product for first version',
      category: ['Negative'],
      noOfTestCase: 10
    },
    {
      title: 'Overall UX Process of full product for first version',
      category: ['Negative'],
      noOfTestCase: 10
    },
    {
      title: 'Overall UX Process of full product for first version',
      category: ['Security'],
      noOfTestCase: 10
    },
    {
      title: 'Overall UX Process of full product for first version',
      category: ['Usability'],
      noOfTestCase: 10
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ux design':
        return 'text-blue-600 bg-blue-50';
      case 'ux research':
        return 'text-indigo-600 bg-indigo-50';
      case 'negative':
        return 'text-orange-600 bg-orange-50';
      case 'security':
        return 'text-purple-600 bg-purple-50';
      case 'usability':
        return 'text-teal-600 bg-teal-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Review and management</h1>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-blue-600">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download Report</span>
            </button>
            <button className="flex items-center space-x-2 text-blue-600">
              <ShareIcon className="w-5 h-5" />
              <span>Share Report</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recents
            </button>
            <button
              onClick={() => setActiveTab('tab2')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tab2'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tab 2
            </button>
            <button
              onClick={() => setActiveTab('tab3')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tab3'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tab 3
            </button>
          </nav>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. of test case
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testCases.map((testCase, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-3"
                      />
                      <div className="text-sm text-gray-900">{testCase.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {testCase.category.map((cat, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getCategoryColor(cat)}`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {testCase.noOfTestCase}
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
  )
} 