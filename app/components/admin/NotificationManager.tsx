'use client';

import { useState, useEffect } from 'react';

interface NotificationManagerProps {
  onNotificationPermissionChange?: (granted: boolean) => void;
}

export function NotificationManager({ onNotificationPermissionChange }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      alert('Browser notifications are not supported in your browser.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      onNotificationPermissionChange?.(result === 'granted');
      
      if (result === 'granted') {
        // Show a test notification
        new Notification('Notifications Enabled', {
          body: 'You will now receive notifications for new bookings and updates.',
          icon: '/icons/appointment-notification.png',
          tag: 'permission-granted'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const showTestNotification = () => {
    if (permission !== 'granted') {
      alert('Please enable notifications first.');
      return;
    }

    new Notification('Test Notification', {
      body: 'This is a test notification to verify everything is working correctly.',
      icon: '/icons/appointment-notification.png',
      badge: '/icons/badge.png',
      tag: 'test-notification',
      requireInteraction: true
    });
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Browser notifications not supported
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Your browser doesn't support notifications. You won't receive real-time alerts for new bookings.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Browser Notifications</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">Notification Status</div>
            <div className="text-sm text-gray-500">
              {permission === 'granted' && 'Notifications are enabled'}
              {permission === 'denied' && 'Notifications are blocked'}
              {permission === 'default' && 'Notifications permission not requested'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              permission === 'granted' 
                ? 'bg-green-100 text-green-800' 
                : permission === 'denied'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not Set'}
            </span>
          </div>
        </div>

        {permission !== 'granted' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Enable notifications for real-time updates
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Get notified immediately when patients book appointments, respond to requests, or when appointment statuses change.</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={requestPermission}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {permission === 'granted' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Notifications enabled
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>You'll receive browser notifications for:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>New appointment bookings</li>
                    <li>Patient responses to clinic offers</li>
                    <li>Appointment status changes</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={showTestNotification}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Test Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {permission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Notifications blocked
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Notifications have been blocked for this site. To enable them:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Click the notification icon in your browser's address bar</li>
                    <li>Select "Allow notifications"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}