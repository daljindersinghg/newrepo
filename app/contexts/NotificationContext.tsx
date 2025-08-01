'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationApi, Notification } from '@/lib/api/notifications';
import { useBrowserNotifications, useNotificationSettings } from '@/hooks/useBrowserNotifications';
import { useClinicAuth } from '@/hooks/useClinicAuth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  requestBrowserPermission: () => Promise<NotificationPermission>;
  settings: ReturnType<typeof useNotificationSettings>['settings'];
  updateSettings: ReturnType<typeof useNotificationSettings>['updateSettings'];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());

  const { clinic, isLoggedIn } = useClinicAuth();
  const browserNotifications = useBrowserNotifications();
  const notificationSettings = useNotificationSettings();

  // Fetch notifications
  const refreshNotifications = useCallback(async () => {
    if (!isLoggedIn || loading) return;

    try {
      setLoading(true);
      setError(null);

      const [notificationsResult, countResult] = await Promise.all([
        notificationApi.getNotifications(1, 20),
        notificationApi.getUnreadCount()
      ]);

      if (notificationsResult.success) {
        setNotifications(notificationsResult.data.notifications);
      }

      if (countResult.success) {
        setUnreadCount(countResult.unreadCount);
      }

      setLastCheckTime(new Date());
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, loading]);

  // Check for new notifications (for browser notifications)
  const checkForNewNotifications = useCallback(async () => {
    if (!isLoggedIn || !notificationSettings.settings.browserNotifications) return;

    try {
      const result = await notificationApi.getNotifications(1, 5, true); // Get latest 5 unread
      if (result.success) {
        const newNotifications = result.data.notifications.filter(
          notification => new Date(notification.createdAt) > lastCheckTime
        );

        // Show browser notifications for new notifications
        for (const notification of newNotifications) {
          if (shouldShowBrowserNotification(notification)) {
            showBrowserNotificationForType(notification);
          }
        }

        if (newNotifications.length > 0) {
          setLastCheckTime(new Date());
        }
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }, [isLoggedIn, lastCheckTime, notificationSettings.settings.browserNotifications]);

  // Determine if we should show browser notification based on settings
  const shouldShowBrowserNotification = (notification: Notification): boolean => {
    const { settings } = notificationSettings;
    
    switch (notification.type) {
      case 'appointment_request':
        return settings.appointmentRequests;
      case 'counter_offer':
        return settings.patientResponses;
      case 'cancellation':
        return settings.cancellations;
      default:
        return true;
    }
  };

  // Show appropriate browser notification based on type
  const showBrowserNotificationForType = (notification: Notification) => {
    switch (notification.type) {
      case 'appointment_request':
        // Parse patient name from message (this is a simplified approach)
        const patientMatch = notification.message.match(/^(.+?) has requested/);
        const patientName = patientMatch ? patientMatch[1] : 'A patient';
        const dateMatch = notification.message.match(/for (.+?) at (.+?)$/);
        const date = dateMatch ? dateMatch[1] : 'a requested date';
        const time = dateMatch ? dateMatch[2] : 'a requested time';
        
        browserNotifications.showAppointmentRequestNotification(patientName, date, time);
        break;
        
      case 'counter_offer':
        const counterPatientMatch = notification.message.match(/^(.+?) has made/);
        const counterPatientName = counterPatientMatch ? counterPatientMatch[1] : 'A patient';
        browserNotifications.showCounterOfferNotification(counterPatientName);
        break;
        
      case 'cancellation':
        const cancelPatientMatch = notification.message.match(/with (.+?) has been/);
        const cancelPatientName = cancelPatientMatch ? cancelPatientMatch[1] : 'A patient';
        browserNotifications.showCancellationNotification(cancelPatientName);
        break;
        
      default:
        browserNotifications.showNotification({
          title: notification.title,
          body: notification.message,
          tag: notification._id
        });
    }
  };

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Request browser notification permission
  const requestBrowserPermission = useCallback(async () => {
    return await browserNotifications.requestPermission();
  }, [browserNotifications]);

  // Set up polling for new notifications when logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    refreshNotifications();

    // Set up polling intervals
    const refreshInterval = setInterval(refreshNotifications, 60000); // Refresh every minute
    const newNotificationInterval = setInterval(checkForNewNotifications, 15000); // Check for new every 15s

    return () => {
      clearInterval(refreshInterval);
      clearInterval(newNotificationInterval);
    };
  }, [isLoggedIn, refreshNotifications, checkForNewNotifications]);

  // Request browser notification permission on first login
  useEffect(() => {
    if (isLoggedIn && notificationSettings.settings.browserNotifications && browserNotifications.permission === 'default') {
      requestBrowserPermission();
    }
  }, [isLoggedIn, notificationSettings.settings.browserNotifications, browserNotifications.permission, requestBrowserPermission]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestBrowserPermission,
    settings: notificationSettings.settings,
    updateSettings: notificationSettings.updateSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}