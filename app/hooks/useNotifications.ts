// NOTIFICATIONS DISABLED - All notification hooks disabled

import { useState, useEffect } from 'react';
import { 
  NotificationPermissionStatus, 
  AppointmentNotification 
} from '@/lib/services/notificationService';

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermissionStatus;
  fcmToken: string | null;
  isLoading: boolean;
  error: string | null;
  initializeNotifications: (clinicId: string) => Promise<void>;
  requestPermission: () => Promise<void>;
  showNotification: (notification: AppointmentNotification) => Promise<void>;
  unsubscribe: (clinicId: string) => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isSupported] = useState(false); // Always false when disabled
  const [permission] = useState<NotificationPermissionStatus>({
    granted: false,
    denied: true, // Always denied when disabled
    default: false
  });
  const [fcmToken] = useState<string | null>(null); // Always null when disabled
  const [isLoading] = useState(false); // Never loading when disabled
  const [error] = useState<string | null>(null); // No errors when disabled

  // Log that notifications are disabled on mount
  useEffect(() => {
    console.log('🚫 useNotifications: Notifications are disabled');
  }, []);

  const initializeNotifications = async (clinicId: string): Promise<void> => {
    console.log('🚫 Initialize notifications disabled for clinic:', clinicId);
    return;
  };

  const requestPermission = async (): Promise<void> => {
    console.log('🚫 Request permission disabled');
    return;
  };

  const showNotification = async (notification: AppointmentNotification): Promise<void> => {
    console.log('🚫 Show notification disabled:', notification);
    return;
  };

  const unsubscribe = async (clinicId: string): Promise<void> => {
    console.log('🚫 Unsubscribe disabled for clinic:', clinicId);
    return;
  };

  return {
    isSupported,
    permission,
    fcmToken,
    isLoading,
    error,
    initializeNotifications,
    requestPermission,
    showNotification,
    unsubscribe
  };
};
