'use client';

import { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationSettings() {
  const { settings, updateSettings, requestBrowserPermission } = useNotifications();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key: keyof typeof settings) => {
    setSaving(true);
    
    // If enabling browser notifications, request permission first
    if (key === 'browserNotifications' && !settings[key]) {
      const permission = await requestBrowserPermission();
      if (permission !== 'granted') {
        setSaving(false);
        alert('Browser notification permission is required to enable notifications.');
        return;
      }
    }
    
    updateSettings({ [key]: !settings[key] });
    setSaving(false);
  };

  const settingsConfig = [
    {
      key: 'browserNotifications' as const,
      title: 'Browser Notifications',
      description: 'Show desktop notifications when you receive new appointment requests or responses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-15 0V9.825a1 1 0 011-1h2.175" />
        </svg>
      )
    },
    {
      key: 'emailNotifications' as const,
      title: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      key: 'appointmentRequests' as const,
      title: 'New Appointment Requests',
      description: 'Get notified when patients request new appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
        </svg>
      )
    },
    {
      key: 'patientResponses' as const,
      title: 'Patient Responses',
      description: 'Get notified when patients respond to your counter-offers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      key: 'cancellations' as const,
      title: 'Appointment Cancellations',
      description: 'Get notified when appointments are cancelled',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    {
      key: 'reminders' as const,
      title: 'Appointment Reminders',
      description: 'Get reminders about upcoming confirmed appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage how you receive notifications about appointment requests and updates.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {settingsConfig.map((setting) => (
          <div key={setting.key} className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="text-gray-400 mt-1">
                {setting.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {setting.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {setting.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleToggle(setting.key)}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                ${settings[setting.key] ? 'bg-green-600' : 'bg-gray-200'}
                ${saving ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="sr-only">Toggle {setting.title}</span>
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                  transition duration-200 ease-in-out
                  ${settings[setting.key] ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        ))}

        {/* Browser Notification Status */}
        {typeof window !== 'undefined' && 'Notification' in window && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Browser Notifications: {Notification.permission === 'granted' ? 'Enabled' : 
                                        Notification.permission === 'denied' ? 'Blocked' : 'Not Enabled'}
                </p>
                {Notification.permission === 'denied' && (
                  <p className="text-xs text-blue-700 mt-1">
                    To enable browser notifications, please check your browser settings and allow notifications for this site.
                  </p>
                )}
                {Notification.permission === 'default' && (
                  <p className="text-xs text-blue-700 mt-1">
                    Click the Browser Notifications toggle above to enable desktop notifications.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test Notification Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={async () => {
              if (settings.browserNotifications) {
                const permission = await requestBrowserPermission();
                if (permission === 'granted') {
                  new Notification('Test Notification', {
                    body: 'Browser notifications are working correctly!',
                    icon: '/icons/notification-icon.png'
                  });
                }
              } else {
                alert('Please enable browser notifications first.');
              }
            }}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Test Browser Notification
          </button>
        </div>
      </div>
    </div>
  );
}