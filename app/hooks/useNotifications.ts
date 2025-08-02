import { useState, useEffect, useCallback } from 'react';
import { 
  notificationService, 
  NotificationPermissionStatus, 
  AppointmentNotification 
} from '@/lib/services/notificationService';
import { onMessageListener } from '@/lib/firebase/config';

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
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionStatus>({
    granted: false,
    denied: false,
    default: true
  });
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check support and permission on mount
  useEffect(() => {
    const checkSupportAndPermission = async () => {
      const supported = notificationService.isNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const permissionStatus = await notificationService.getPermissionStatus();
        setPermission(permissionStatus);
        
        // Get existing token if available
        const existingToken = notificationService.getFCMToken();
        setFcmToken(existingToken);
      }
    };

    checkSupportAndPermission();
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported || !permission.granted) return;

    const handleMessage = (payload: any) => {
      console.log('Foreground notification received:', payload);
      
      // Show notification if app is in foreground
      if (payload.notification) {
        const notification: AppointmentNotification = {
          id: payload.data?.appointmentId || 'unknown',
          clinicId: payload.data?.clinicId || 'unknown',
          patientName: payload.data?.patientName || 'Unknown Patient',
          appointmentTime: payload.data?.appointmentTime || '',
          appointmentDate: payload.data?.appointmentDate || '',
          type: (payload.data?.type as AppointmentNotification['type']) || 'new_appointment',
          message: payload.notification.body || 'New notification'
        };
        
        notificationService.showLocalNotification(notification);
      }
    };

    const unsubscribe = onMessageListener(handleMessage);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
        console.log('Unsubscribed from foreground message listener');
      }
    };
  }, [isSupported, permission.granted]);

  const initializeNotifications = useCallback(async (clinicId: string) => {
    if (!isSupported) {
      setError('Notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await notificationService.initializeNotifications(clinicId);
      setFcmToken(token);
      
      // Update permission status
      const newPermission = await notificationService.getPermissionStatus();
      setPermission(newPermission);
      
      console.log('Notifications initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize notifications';
      setError(errorMessage);
      console.error('Failed to initialize notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await notificationService.requestPermission();
      const newPermission = await notificationService.getPermissionStatus();
      setPermission(newPermission);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      console.error('Failed to request notification permission:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const showNotification = useCallback(async (notification: AppointmentNotification) => {
    try {
      await notificationService.showLocalNotification(notification);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show notification';
      setError(errorMessage);
      console.error('Failed to show notification:', err);
    }
  }, []);

  const unsubscribe = useCallback(async (clinicId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await notificationService.unsubscribe(clinicId);
      setFcmToken(null);
      console.log('Unsubscribed from notifications');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(errorMessage);
      console.error('Failed to unsubscribe from notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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