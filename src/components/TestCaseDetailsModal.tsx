'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Step {
  text: string;
  completed: boolean;
}

interface TestCaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: {
    title: string;
    category: string;
    description: string;
    steps: Step[];
    expectedResult: string;
    status?: 'approved' | 'rejected' | 'pending';
  };
  onStatusChange?: (status: 'approved' | 'rejected') => void;
}

export default function TestCaseDetailsModal({ isOpen, onClose, testCase, onStatusChange }: TestCaseDetailsModalProps) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-0 transition-opacity" onClick={onClose} />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md transform transition-all duration-500 ease-in-out">
            <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${getCategoryColor(testCase.category)}`}>
                      {testCase.category}
                    </span>
                    <h2 className="text-xl font-semibold text-gray-900">{testCase.title}</h2>
                  </div>
                  <div className="flex h-7 items-center space-x-4">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 sm:px-6">
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{testCase.description}</p>
                </div>

                {/* Steps */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Steps ({testCase.steps.length})</h3>
                  <div className="space-y-4">
                    {testCase.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                          <div className={`h-2 w-2 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <p className="ml-4 text-sm text-gray-600">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Result */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Expected Result</h3>
                  <p className="text-sm text-gray-600">{testCase.expectedResult}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => onStatusChange?.('approved')}
                      className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                        testCase.status === 'approved'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-green-600 text-white hover:bg-green-500'
                      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600`}
                    >
                      {testCase.status === 'approved' ? 'Approved' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange?.('rejected')}
                      className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                        testCase.status === 'rejected'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-red-600 text-white hover:bg-red-500'
                      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600`}
                    >
                      {testCase.status === 'rejected' ? 'Rejected' : 'Reject'}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 