// NOTIFICATIONS DISABLED - All browser notification functionality disabled

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
  const [permission] = useState<NotificationPermission>('denied'); // Always denied when disabled
  const [supported] = useState(false); // Never supported when disabled

  useEffect(() => {
    console.log('🚫 useBrowserNotifications: Browser notifications are disabled');
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    console.log('🚫 Request browser notification permission: Disabled');
    return 'denied';
  }, []);

  const showNotification = useCallback(async (options: BrowserNotificationOptions): Promise<Notification | null> => {
    console.log('🚫 Show browser notification: Disabled', options);
    return null;
  }, []);

  const closeNotification = useCallback((tag?: string): void => {
    console.log('🚫 Close browser notification: Disabled', tag);
  }, []);

  const showAppointmentNotification = useCallback(async (
    patientName: string,
    appointmentTime: string,
    appointmentDate: string
  ): Promise<Notification | null> => {
    console.log('🚫 Show appointment notification: Disabled', { patientName, appointmentTime, appointmentDate });
    return null;
  }, []);

  return {
    permission,
    supported,
    requestPermission,
    showNotification,
    closeNotification,
    showAppointmentNotification,
  };
}
