'use client';

import { useState } from 'react';

export function ClinicSettingsTab() {
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appointmentAlerts, setAppointmentAlerts] = useState(true);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setBrowserNotifications(true);
        new Notification('Notifications Enabled', {
          body: 'You will now receive browser notifications for new appointments.',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage how you receive notifications about appointments.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Browser Notifications</h4>
              <p className="text-sm text-gray-600">Get desktop notifications for new appointments</p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 ${
                browserNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  browserNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive email alerts for important updates</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 ${
                emailNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Appointment Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Appointment Alerts</h4>
              <p className="text-sm text-gray-600">Get notified about new appointment requests</p>
            </div>
            <button
              onClick={() => setAppointmentAlerts(!appointmentAlerts)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 ${
                appointmentAlerts ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  appointmentAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Browser Permission Status */}
          {typeof window !== 'undefined' && 'Notification' in window && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Browser Notifications: {
                  Notification.permission === 'granted' ? 'Enabled' : 
                  Notification.permission === 'denied' ? 'Blocked' : 'Not Enabled'
                }
              </p>
              {Notification.permission === 'denied' && (
                <p className="text-xs text-blue-700 mt-1">
                  To enable, please check your browser settings and allow notifications for this site.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-600">Additional settings coming soon...</p>
        </div>
      </div>
    </div>
  );
}