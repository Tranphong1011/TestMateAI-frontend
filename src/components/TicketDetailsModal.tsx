import React from 'react';
import Image from 'next/image';
import { XMarkIcon, ShareIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    title: string;
    description: string;
    tags: string[];
    createdBy: {
      name: string;
      avatar: string;
    };
    assignedTo: {
      name: string;
      avatar: string;
      role?: string;
    }[];
    timeline: string;
    attachments: {
      url: string;
      preview: string;
    }[];
  };
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ isOpen, onClose, ticket }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-[500px] bg-white h-full transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
              R
            </div>
            <h2 className="text-xl font-semibold">Ticket Details</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <ShareIcon className="w-5 h-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Tags */}
          <div className="flex space-x-2 mb-4">
            {ticket.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-xl font-semibold mb-4">{ticket.title}</h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">{ticket.description}</p>

          {/* Created By & Assigned To */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created by</h3>
              <div className="flex items-center space-x-2">
                <Image
                  src={ticket.createdBy.avatar}
                  alt={ticket.createdBy.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm font-medium">{ticket.createdBy.name}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned to</h3>
              <div className="flex items-center space-x-3">
                {ticket.assignedTo.map((user, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      {user.role && (
                        <div className="text-xs text-gray-500">{user.role}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
            <p className="text-sm">{ticket.timeline}</p>
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Attachments</h3>
            <div className="grid grid-cols-2 gap-4">
              {ticket.attachments.map((attachment, index) => (
                <div key={index} className="rounded-lg overflow-hidden border">
                  <Image
                    src={attachment.preview}
                    alt="Attachment preview"
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Create Testcases
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal; 