'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { AppointmentNotification } from '@/lib/services/notificationService';

interface NotificationContextType {
  isEnabled: boolean;
  fcmToken: string | null;
  notifications: AppointmentNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  enableNotifications: (clinicId: string) => Promise<void>;
  disableNotifications: (clinicId: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: AppointmentNotification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  clinicId: string;
}

export function NotificationProvider({ children, clinicId }: NotificationProviderProps) {
  const {
    isSupported,
    permission,
    fcmToken,
    isLoading,
    error,
    initializeNotifications,
    unsubscribe
  } = useNotifications();

  const [notifications, setNotifications] = useState<AppointmentNotification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const isEnabled = permission.granted && fcmToken !== null;
  const unreadCount = notifications.filter(n => !readNotifications.has(n.id)).length;

  // Load saved notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`notifications_${clinicId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotifications(parsed);
        } catch (error) {
          console.error('Error loading saved notifications:', error);
        }
      }

      const savedRead = localStorage.getItem(`read_notifications_${clinicId}`);
      if (savedRead) {
        try {
          const parsed = JSON.parse(savedRead);
          setReadNotifications(new Set(parsed));
        } catch (error) {
          console.error('Error loading read notifications:', error);
        }
      }
    }
  }, [clinicId]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`notifications_${clinicId}`, JSON.stringify(notifications));
    }
  }, [notifications, clinicId]);

  // Save read notifications to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`read_notifications_${clinicId}`, JSON.stringify([...readNotifications]));
    }
  }, [readNotifications, clinicId]);

  const enableNotifications = async (clinicId: string) => {
    try {
      await initializeNotifications(clinicId);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      throw error;
    }
  };

  const disableNotifications = async (clinicId: string) => {
    try {
      await unsubscribe(clinicId);
      setNotifications([]);
      setReadNotifications(new Set());
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      throw error;
    }
  };

  const addNotification = (notification: AppointmentNotification) => {
    setNotifications(prev => {
      // Check if notification already exists
      const exists = prev.some(n => n.id === notification.id);
      if (exists) {
        return prev;
      }
      
      // Add new notification at the beginning and limit to 50
      const updated = [notification, ...prev].slice(0, 50);
      return updated;
    });
  };

  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...prev, notificationId]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setReadNotifications(new Set());
  };

  const value: NotificationContextType = {
    isEnabled,
    fcmToken,
    notifications,
    unreadCount,
    isLoading,
    error,
    enableNotifications,
    disableNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

// HOC for components that need notification context
export function withNotifications<P extends object>(
  Component: React.ComponentType<P>,
  clinicId: string
) {
  return function WithNotificationsComponent(props: P) {
    return (
      <NotificationProvider clinicId={clinicId}>
        <Component {...props} />
      </NotificationProvider>
    );
  };
}