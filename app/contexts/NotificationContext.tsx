// NOTIFICATIONS DISABLED - Notification context disabled

'use client';

import React, { createContext, useContext, useCallback } from 'react';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  requestBrowserPermission: () => Promise<NotificationPermission>;
  settings: any;
  updateSettings: any;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  console.log('🚫 NotificationProvider: Notifications are disabled');

  const refreshNotifications = useCallback(async () => {
    console.log('🚫 Refresh notifications: Disabled');
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    console.log('🚫 Mark as read: Disabled', notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    console.log('🚫 Mark all as read: Disabled');
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    console.log('🚫 Delete notification: Disabled', notificationId);
  }, []);

  const requestBrowserPermission = useCallback(async (): Promise<NotificationPermission> => {
    console.log('🚫 Request browser permission: Disabled');
    return 'denied';
  }, []);

  const value: NotificationContextType = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestBrowserPermission,
    settings: {},
    updateSettings: () => {}
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
