// NOTIFICATIONS DISABLED - Simple notification dropdown disabled

'use client';

import { useState } from 'react';

interface SimpleNotification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'response' | 'cancellation';
  time: string;
  read: boolean;
}

export function SimpleNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<SimpleNotification[]>([]);

  const unreadCount = 0; // Always 0 when disabled

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        disabled
      >
        <svg 
          className="w-6 h-6 opacity-50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
          {/* Disabled indicator */}
          <line x1="18" y1="6" x2="6" y2="18" stroke="red" strokeWidth="2"/>
        </svg>
        
        {/* Badge for unread notifications (hidden when disabled) */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications (Disabled)
              </h3>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">🚫</div>
              <p className="text-lg font-medium">Notifications Disabled</p>
              <p className="text-sm mt-2">
                Notification system has been disabled by administrator
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
