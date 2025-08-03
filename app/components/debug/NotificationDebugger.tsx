// NOTIFICATIONS DISABLED - Notification debugger disabled

'use client';

import { useState } from 'react';

export function NotificationDebugger({ clinicId }: { clinicId: string }) {
  const [logs] = useState<string[]>(['🚫 Notification debugging is disabled']);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          🚫 Debug Notifications (Disabled)
        </h2>
        <p className="text-gray-600">
          Notification debugging has been disabled. Clinic ID: {clinicId}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Browser Support:</span>
              <span className="text-red-600 font-medium">Disabled</span>
            </div>
            <div className="flex justify-between">
              <span>Permission:</span>
              <span className="text-red-600 font-medium">Denied</span>
            </div>
            <div className="flex justify-between">
              <span>FCM Token:</span>
              <span className="text-red-600 font-medium">None</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Actions</h3>
          <div className="space-y-2">
            <button 
              className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
              disabled
            >
              Test Initialization (Disabled)
            </button>
            <button 
              className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
              disabled
            >
              Request Permission (Disabled)
            </button>
            <button 
              className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
              disabled
            >
              Clear Logs (Disabled)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Debug Log</h3>
        <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="text-sm text-gray-700 mb-1">
              {new Date().toLocaleTimeString()}: {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
