'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotificationContext } from '@/providers/NotificationProvider';
import { Bell, BellOff, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface NotificationSettingsProps {
  clinicId: string;
  className?: string;
}

export function NotificationSettings({ clinicId, className = "" }: NotificationSettingsProps) {
  const {
    isEnabled,
    fcmToken,
    notifications,
    unreadCount,
    isLoading,
    error,
    enableNotifications,
    disableNotifications,
    markAllAsRead,
    clearNotifications
  } = useNotificationContext();

  const [isToggling, setIsToggling] = useState(false);

  const handleToggleNotifications = async () => {
    setIsToggling(true);
    try {
      if (isEnabled) {
        await disableNotifications(clinicId);
      } else {
        await enableNotifications(clinicId);
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleClearNotifications = () => {
    clearNotifications();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">Manage your appointment notification preferences</p>
          </div>
        </div>

        {/* Notification Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              {isEnabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications Enabled</p>
                    <p className="text-sm text-gray-500">You'll receive push notifications for new appointments</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications Disabled</p>
                    <p className="text-sm text-gray-500">Enable to receive appointment alerts</p>
                  </div>
                </>
              )}
            </div>
            
            <Button
              onClick={handleToggleNotifications}
              disabled={isLoading || isToggling}
              variant={isEnabled ? "outline" : "default"}
              className={isEnabled ? "border-red-300 text-red-600 hover:bg-red-50" : "bg-blue-600 text-white hover:bg-blue-700"}
            >
              {(isLoading || isToggling) ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {isEnabled ? 'Disabling...' : 'Enabling...'}
                </div>
              ) : (
                <>
                  {isEnabled ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Enable
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Statistics */}
        {isEnabled && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
              <p className="text-sm text-blue-800">Total Notifications</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              <p className="text-sm text-orange-800">Unread</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
              <p className="text-sm text-green-800">Read</p>
            </div>
          </div>
        )}

        {/* Notification Actions */}
        {isEnabled && notifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Notification Management</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={markAllAsRead}
                variant="outline"
                disabled={unreadCount === 0}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All as Read {unreadCount > 0 && `(${unreadCount})`}
              </Button>
              <Button
                onClick={handleClearNotifications}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear All Notifications
              </Button>
            </div>
          </div>
        )}

        {/* Notification Types */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              <span>New appointment bookings</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
              <span>Appointment cancellations</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
              <span>Appointment rescheduling</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
              <span>Appointment reminders</span>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        {isEnabled && fcmToken && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <details className="group">
              <summary className="flex items-center cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                <Settings className="h-4 w-4 mr-2" />
                Technical Details
                <svg className="w-4 h-4 ml-2 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-500 font-mono break-all">
                <p><strong>FCM Token:</strong></p>
                <p className="mt-1">{fcmToken}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for dashboard widgets
export function NotificationStatusWidget({ clinicId, className = "" }: NotificationSettingsProps) {
  const { isEnabled, unreadCount, isLoading } = useNotificationContext();

  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isEnabled ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {isEnabled ? (
              <Bell className="h-4 w-4 text-green-600" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              Push Notifications
            </p>
            <p className="text-xs text-gray-500">
              {isEnabled ? `${unreadCount} unread` : 'Disabled'}
            </p>
          </div>
        </div>
        
        <div className={`px-2 py-1 text-xs rounded-full ${
          isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {isLoading ? 'Loading...' : (isEnabled ? 'Active' : 'Inactive')}
        </div>
      </div>
    </div>
  );
}