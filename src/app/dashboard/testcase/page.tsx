'use client';

import React, { useState } from 'react';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import TestCaseDetailsModal from '@/components/TestCaseDetailsModal';

interface TestCase {
  title: string;
  category: string;
  steps: number;
  expectedResult: string;
  description?: string;
  detailedSteps?: { text: string; completed: boolean; }[];
  status?: 'approved' | 'rejected' | 'pending';
}

export default function TestcasePage() {
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [expandedTableId, setExpandedTableId] = useState<string | null>('table1');
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      title: 'Verify User Login with Valid Credentials',
      category: 'Functional',
      steps: 10,
      status: 'approved',
      expectedResult: 'The user should be successfully logged in and redirected to the dashboard/homepage.',
      description: 'Create overall ux process of full product include user personas, sitemap, information architecture, user flow and mindmap for our client to show research process and accurate results.',
      detailedSteps: [
        { text: 'Open the application login page', completed: true },
        { text: 'Enter a valid registered email or mobile number in the username field', completed: true },
        { text: 'Enter the correct password in the password field', completed: true },
        { text: 'Click on the Login button', completed: true },
        { text: 'Observe the system response', completed: true }
      ]
    },
    {
      title: 'Verify Error Message for Incorrect Password',
      category: 'Negative',
      steps: 10,
      status: 'rejected',
      expectedResult: 'The system should display a clear error message like "Incorrect password. Please try again." and prevent login.'
    },
    {
      title: 'Verify Login with Unregistered Email/Mobile Number',
      category: 'Negative',
      steps: 10,
      status: 'pending',
      expectedResult: 'The system should display an error message like "No account found with this email/mobile number. Please sign up." and prevent login.'
    },
    {
      title: 'Verify Password Masking on Login Page',
      category: 'Security',
      steps: 10,
      status: 'pending',
      expectedResult: 'Password characters should be hidden while typing. An option to toggle visibility may be available.'
    },
    {
      title: 'Verify Login Session Persistence After Refresh',
      category: 'Usability',
      steps: 10,
      status: 'approved',
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

  const handleRowClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
  };

  const handleStatusChange = (status: 'approved' | 'rejected') => {
    if (!selectedTestCase) return;
    
    const updatedTestCases = testCases.map(testCase => 
      testCase.title === selectedTestCase.title 
        ? { ...testCase, status } 
        : testCase
    );
    
    setTestCases(updatedTestCases);
    setSelectedTestCase({ ...selectedTestCase, status });
  };

  const handleTableToggle = (tableId: string) => {
    setExpandedTableId(expandedTableId === tableId ? null : tableId);
  };

  const TableSection = ({ 
    id, 
    title, 
    description, 
    isExpanded 
  }: { 
    id: string; 
    title: string; 
    description: string; 
    isExpanded: boolean;
  }) => (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <div 
        className="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors duration-150"
        onClick={() => handleTableToggle(id)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isExpanded && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Steps</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCases.map((testCase, index) => (
                  <tr 
                    key={index}
                    onClick={() => handleRowClick(testCase)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      selectedTestCase?.title === testCase.title 
                        ? 'bg-blue-100 hover:bg-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3 rounded border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={`text-sm ${
                          selectedTestCase?.title === testCase.title 
                            ? 'text-blue-900 font-medium' 
                            : 'text-gray-900'
                        }`}>{testCase.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-xs ${getCategoryColor(testCase.category)}`}>
                        {testCase.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        testCase.status === 'approved' 
                          ? 'bg-green-100 text-green-700' 
                          : testCase.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          testCase.status === 'approved' 
                            ? 'bg-green-500' 
                            : testCase.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}></span>
                        {testCase.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {testCase.steps}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-md line-clamp-2">{testCase.expectedResult}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
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
        </>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8">
      <div className="max-w-8xl mx-auto">
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

        <TableSection
          id="table1"
          title="Functional Test Cases"
          description="Test cases for core functionality validation"
          isExpanded={expandedTableId === 'table1'}
        />

        <TableSection
          id="table2"
          title="Security Test Cases"
          description="Test cases for security validation and verification"
          isExpanded={expandedTableId === 'table2'}
        />

        <TableSection
          id="table3"
          title="Performance Test Cases"
          description="Test cases for performance and load testing"
          isExpanded={expandedTableId === 'table3'}
        />
      </div>

      {selectedTestCase && (
        <TestCaseDetailsModal
          isOpen={!!selectedTestCase}
          onClose={() => setSelectedTestCase(null)}
          testCase={{
            ...selectedTestCase,
            description: selectedTestCase.description || '',
            steps: selectedTestCase.detailedSteps || []
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
} 