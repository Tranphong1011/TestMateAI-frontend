'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

interface TestCase {
  title: string;
  category: string;
  steps: number;
  expectedResult: string;
}

export default function TestcasePage() {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      title: 'Verify User Login with Valid Credentials',
      category: 'Functional',
      steps: 10,
      expectedResult: 'The user should be successfully logged in and redirected to the dashboard/homepage.'
    },
    {
      title: 'Verify Error Message for Incorrect Password',
      category: 'Negative',
      steps: 10,
      expectedResult: 'The system should display a clear error message like "Incorrect password. Please try again." and prevent login.'
    },
    {
      title: 'Verify Login with Unregistered Email/Mobile Number',
      category: 'Negative',
      steps: 10,
      expectedResult: 'The system should display an error message like "No account found with this email/mobile number. Please sign up." and prevent login.'
    },
    {
      title: 'Verify Password Masking on Login Page',
      category: 'Security',
      steps: 10,
      expectedResult: 'Password characters should be hidden while typing. An option to toggle visibility may be available.'
    },
    {
      title: 'Verify Login Session Persistence After Refresh',
      category: 'Usability',
      steps: 10,
      expectedResult: 'If the user was already logged in, refreshing the page should not log them out, and they should remain on the same page or be redirected to the homepage.'
    }
  ]);

  const stats = {
    totalTestCases: 15,
    verifiedTestCases: 100,
    pendingTestCases: 100,
    rejectedTestCases: 100
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'functional':
        return 'text-blue-600 bg-blue-50';
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
    <div className="flex-1 overflow-y-auto p-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Testcase</h1>
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

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{stats.totalTestCases}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Test Case</p>
                <p className="font-semibold">{stats.totalTestCases}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">{stats.verifiedTestCases}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified Test Cases</p>
                <p className="font-semibold">{stats.verifiedTestCases}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">{stats.pendingTestCases}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Test Cases</p>
                <p className="font-semibold">{stats.pendingTestCases}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold">{stats.rejectedTestCases}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected Test Cases</p>
                <p className="font-semibold">{stats.rejectedTestCases}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Test Cases</h2>
            <p className="text-sm text-gray-500">Description text</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Steps</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCases.map((testCase, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-3 rounded border-gray-300" />
                        <span className="text-sm text-gray-900">{testCase.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-xs ${getCategoryColor(testCase.category)}`}>
                        {testCase.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.steps}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-md line-clamp-2">{testCase.expectedResult}</div>
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
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between">
              <button className="text-gray-600 hover:text-gray-900">← Previous</button>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded">1</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded">2</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded">3</button>
                <span>...</span>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded">8</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded">9</button>
                <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded">10</button>
              </div>
              <button className="text-gray-600 hover:text-gray-900">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 