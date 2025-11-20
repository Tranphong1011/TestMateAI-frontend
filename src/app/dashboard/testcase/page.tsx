'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import TestCaseDetailsModal from '@/components/TestCaseDetailsModal';
import { useSearchParams } from 'next/navigation';
import { API_URL } from '@/utils/config';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs'; // You need to update your import

interface TestCase {
  id: string;
  category: string;
  testcase: string;
  description: string;
  steps: string[];
  expected_result: string;
  status?: 'approved' | 'rejected' | 'pending';
}

export default function TestcasePage() {
  const searchParams = useSearchParams();
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [expandedTableId, setExpandedTableId] = useState<string | null>('table1');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [stats, setStats] = useState({
    totalTestCases: 0,
    verifiedTestCases: 0,
    pendingTestCases: 0,
    rejectedTestCases: 0
  });

  // Removed tableRef since we are using the testCases state array

  // Get ticket data from URL params with null checks
  const ticketTitle = searchParams?.get('title') ?? '';
  const ticketDescription = searchParams?.get('description') ?? '';

  useEffect(() => {
    let mounted = true;
    
    const generateTestCases = async () => {
      if (!ticketTitle || !ticketDescription || !mounted) return;
      
      setLoading(true);
      setTestCases([]);
      setShowTable(false);

      try {
        const response = await fetch(API_URL+'/test_cases/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: searchParams?.get('id') ?? '',
            key: searchParams?.get('key') ?? '',
            title: ticketTitle,
            desc: ticketDescription,
            issue_type: searchParams?.get('issue_type') ?? 'Task',
            priority: searchParams?.get('priority') ?? 'Medium',
            status: searchParams?.get('status') ?? 'To Do'
          })
        });

        if (!mounted) return;
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            for (let i = 0; i < lines.length - 1; i++) {
              const line = lines[i].trim();
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(5).trim();
                  const testCase = JSON.parse(jsonStr);
                  if (mounted) {

                    // console.log("testCase", testCase);
                    if(testCase?.error=="Invalid JSON received"){
                      console.log("Getting error testcase and skipping it.");
                      
                      setShowTable(false);
                      setLoading(false);
                      continue;
                    }
                    addTestCase(testCase);
                    setShowTable(true);
                    setLoading(false);
                  }
                } catch (e) {
                  console.error('Error parsing test case:', e);
                }
              }
            }
            buffer = lines[lines.length - 1];
          }
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        if (mounted) {
          console.error('Error generating test cases:', error);
          setLoading(false);
        }
      }
    };

    generateTestCases();

    return () => {
      mounted = false;
    };
  }, [ticketTitle, searchParams]);

  const getCategoryColor = (category: string | undefined | null) => {
    const defaultCategory = 'functional';
    const safeCategory = (category || defaultCategory).toLowerCase();
    
    const categoryColors = {
      functional: 'text-blue-600 bg-blue-50',
      negative: 'text-orange-600 bg-orange-50',
      security: 'text-purple-600 bg-purple-50',
      usability: 'text-teal-600 bg-teal-50'
    };

    return categoryColors[safeCategory as keyof typeof categoryColors] || categoryColors[defaultCategory];
  };

  const handleRowClick = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
  };

  const handleStatusChange = (status: 'approved' | 'rejected') => {
    if (!selectedTestCase) return;
    
    const updatedTestCases = testCases.map(testCase => 
      testCase.id === selectedTestCase.id 
        ? { ...testCase, status } 
        : testCase
    );
    
    setTestCases(updatedTestCases);
    updateStats(updatedTestCases);
    setSelectedTestCase({ ...selectedTestCase, status });
  };

  const handleTableToggle = (tableId: string) => {
    setExpandedTableId(expandedTableId === tableId ? null : tableId);
  };

  const updateStats = (testCases: TestCase[]) => {
    const newStats = {
      totalTestCases: testCases.length,
      verifiedTestCases: testCases.filter(tc => tc.status === 'approved').length,
      pendingTestCases: testCases.filter(tc => tc.status === 'pending').length,
      rejectedTestCases: testCases.filter(tc => tc.status === 'rejected').length
    };
    setStats(newStats);
  };

  const addTestCase = (testCase: Omit<TestCase, 'status'>) => {
    setTestCases(prev => {
      const newTestCases = [...prev, { ...testCase, status: 'pending' as const }];
      updateStats(newTestCases);
      return newTestCases;
    });
  };

  /**
   * Helper function to escape strings for CSV format.
   * Ensures commas and quotes within data cells are handled correctly.
   */
  const escapeCsv = (data: string | number | undefined | string[] | null): string => {
    if (data === null || data === undefined) return '';

    // Handle array (steps) by joining with a semicolon and escaping the result
    let strData: string;
    if (Array.isArray(data)) {
      strData = data.join('; ');
    } else {
      strData = String(data);
    }

    // Escape double quotes within the string by doubling them, then wrap the whole string in double quotes
    if (strData.includes(',') || strData.includes('"') || strData.includes('\n')) {
      return `"${strData.replace(/"/g, '""')}"`;
    }
    return strData;
  };


  /**
   * Function to download the test cases as a CSV file (which opens well in Excel).
   * It uses the `testCases` state array directly.
   */

  /**
   * Function to download the test cases as a proper XLSX file using the SheetJS library.
   * Includes custom formatting for headers (Sky Blue & Bold), borders, and column widths.
   */
  const handleDownloadExceljsReport = async () => {
    if (testCases.length === 0) {
        alert('No test cases to download.');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Test Report Generator';
    workbook.lastModifiedBy = 'System';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet('Test Cases');

    // --- 1. Define Column Headers and Widths ---
    // ExcelJS uses a 'header' property for headers and 'width' for column definitions.
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Test Case Title', key: 'testcase', width: 35 },
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Steps', key: 'steps', width: 60 },
        { header: 'Expected Result', key: 'expected_result', width: 50 },
        { header: 'Status', key: 'status', width: 12 },
    ];

    // --- 2. Map Data and Add Rows (Setting Default Cell Style) ---
    const dataRows = testCases.map(tc => {
        // Prepare steps data for the cell
        const stepsText = tc.steps ? tc.steps.join('\n') : '';

        // Add the row data
        const row = worksheet.addRow({
            id: tc.id,
            category: tc.category,
            testcase: tc.testcase,
            description: tc.description,
            steps: stepsText,
            expected_result: tc.expected_result,
            status: tc.status,
        });

        // Apply General Cell Style (Borders and Wrap Text) to all data cells
        row.eachCell({ includeEmpty: false }, (cell) => {
            cell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
        return row;
    });

    // --- 3. Apply Header Style (Sky Blue Background & Bold) ---
    const headerRow = worksheet.getRow(1);
    const skyBlue = 'ADD8E6'; // Light Blue
    
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: skyBlue },
        };
        cell.font = {
            bold: true,
            color: { argb: '000000' } // Black text
        };
        cell.alignment = {
            wrapText: true,
            vertical: 'middle',
            horizontal: 'center',
        };
        // Add borders to the header
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });
    
    // Set header row height for multi-line headers if needed
    headerRow.height = 20;

    // --- 4. Write to Buffer and Trigger Download ---
    try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const fileName = `Test_Report_${ticketTitle.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (e) {
        console.error('ExcelJS Download failed:', e);
        alert('Error generating XLSX file with ExcelJS.');
    }
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
            {/* Table no longer needs a ref */}
            <table className="w-full"> 
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps Count</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Result</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testCases.map((testCase) => (
                  <tr 
                    key={testCase.id}
                    onClick={() => handleRowClick(testCase)}
                    className={`cursor-pointer transition-colors duration-150 ${
                      selectedTestCase?.id === testCase.id 
                        ? 'bg-blue-100 hover:bg-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{testCase.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{testCase.testcase}</div>
                      <div className="text-sm text-gray-500">{testCase.description}</div>
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
                        {testCase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-md line-clamp-2">{testCase.steps?.length} steps</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-md line-clamp-2">{testCase.expected_result}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Test Cases for: {ticketTitle}</h1>
          <div className="flex items-center space-x-4">
            <button 
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              onClick={handleDownloadExceljsReport}
              disabled={loading || testCases.length === 0}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Download Report</span>
            </button>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">{stats.verifiedTestCases}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified Test Cases</p>
                <p className="font-semibold">{stats.verifiedTestCases}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">{stats.pendingTestCases}</span>
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

        {loading && !showTable ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Generating test cases...</p>
          </div>
        ) : (
          <TableSection
            id="table1"
            title="Generated Test Cases"
            description="Test cases generated based on ticket requirements"
            isExpanded={expandedTableId === 'table1'}
          />
        )}
      </div>

      {selectedTestCase && (
        <TestCaseDetailsModal
          isOpen={!!selectedTestCase}
          onClose={() => setSelectedTestCase(null)}
          testCase={{
            title: selectedTestCase.testcase,
            category: selectedTestCase.category,
            description: selectedTestCase.description,
            steps: selectedTestCase.steps,
            expectedResult: selectedTestCase.expected_result,
            status: selectedTestCase.status
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}