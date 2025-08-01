'use client';

import { useState, useEffect, useCallback } from 'react';

interface BrowserNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!supported) {
      console.warn('Browser notifications are not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [supported]);

  const showNotification = useCallback(async (options: BrowserNotificationOptions): Promise<Notification | null> => {
    if (!supported) {
      console.warn('Browser notifications are not supported');
      return null;
    }

    // Request permission if not already granted
    let currentPermission = permission;
    if (currentPermission === 'default') {
      currentPermission = await requestPermission();
    }

    if (currentPermission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/notification-icon.png',
        badge: options.badge || '/icons/notification-badge.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        // Note: actions are supported in service workers but not in main thread
      });

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [supported, permission, requestPermission]);

  const showAppointmentRequestNotification = useCallback((patientName: string, requestedDate: string, requestedTime: string) => {
    return showNotification({
      title: 'New Appointment Request',
      body: `${patientName} has requested an appointment for ${requestedDate} at ${requestedTime}`,
      icon: '/icons/appointment-icon.png',
      tag: 'appointment-request',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Request' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }, [showNotification]);

  const showCounterOfferNotification = useCallback((patientName: string) => {
    return showNotification({
      title: 'Patient Response',
      body: `${patientName} has responded to your counter-offer`,
      icon: '/icons/response-icon.png',
      tag: 'counter-offer-response',
      requireInteraction: true
    });
  }, [showNotification]);

  const showCancellationNotification = useCallback((patientName: string) => {
    return showNotification({
      title: 'Appointment Cancelled',
      body: `${patientName} has cancelled their appointment`,
      icon: '/icons/cancellation-icon.png',
      tag: 'appointment-cancelled'
    });
  }, [showNotification]);

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
    showAppointmentRequestNotification,
    showCounterOfferNotification,
    showCancellationNotification
  };
}

// Hook for managing notification settings
export function useNotificationSettings() {
  const [settings, setSettings] = useState({
    browserNotifications: true,
    emailNotifications: true,
    appointmentRequests: true,
    patientResponses: true,
    cancellations: true,
    reminders: true
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('clinicNotificationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<typeof settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('clinicNotificationSettings', JSON.stringify(updatedSettings));
  }, [settings]);

  return {
    settings,
    updateSettings
  };
}