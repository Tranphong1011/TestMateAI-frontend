'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TicketDetailsModal from '@/components/TicketDetailsModal';

interface Ticket {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  commentsCount: number;
  attachmentsCount: number;
  assignedTo: {
    id: number;
    name: string;
    avatar: string;
    role?: string;
  }[];
  createdBy: {
    name: string;
    avatar: string;
  };
  timeline: string;
  attachments: {
    url: string;
    preview: string;
  }[];
}

const mockTickets: Ticket[] = Array(8).fill(null).map((_, index) => ({
  id: `ticket-${index + 1}`,
  title: 'Overall UX Process of full product for first version',
  description: 'Create overall ux process of full product include user personas, sitemap, information architecture, user flow and mindmap for our client to show research process and accurate results.',
  date: '22 Feb',
  tags: ['UX Design', 'UX Research'],
  commentsCount: 12,
  attachmentsCount: 4,
  createdBy: {
    name: 'Heiran Lan',
    avatar: '/avatar1.jpg'
  },
  assignedTo: [
    { id: 1, name: 'Kelan Ann', avatar: '/avatar1.jpg', role: 'UX Designer' },
    { id: 2, name: 'Molly nile', avatar: '/avatar2.jpg', role: 'UX Researcher' },
  ],
  timeline: 'Feb 22, 2023',
  attachments: [
    { url: '/attachment1.jpg', preview: '/attachment1.jpg' },
    { url: '/attachment2.jpg', preview: '/attachment2.jpg' },
  ],
}));

export default function QATickets() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar projectName="Project Name" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName="John"
          temperature={22}
          date="Friday, 14 March"
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">QA Ready Tickets</h1>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Testcases</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-gray-500 text-sm">{ticket.date}</span>
                        </div>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                      
                      <h3 className="text-lg font-medium mb-2 line-clamp-2">{ticket.title}</h3>
                      
                      <div className="flex items-center space-x-2 mb-3 flex-wrap">
                        {ticket.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm mt-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>{ticket.commentsCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>{ticket.attachmentsCount}</span>
                          </div>
                        </div>
                        
                        <div className="flex -space-x-2">
                          {ticket.assignedTo.map((user) => (
                            <div
                              key={user.id}
                              className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative bg-gray-200"
                            >
                              <img
                                src={user.avatar}
                                alt={`${user.name}'s avatar`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailsModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
} 