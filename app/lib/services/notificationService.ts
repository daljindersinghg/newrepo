import { getMessagingToken } from '../firebase/config';

export interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface AppointmentNotification {
  id: string;
  clinicId: string;
  patientName: string;
  appointmentTime: string;
  appointmentDate: string;
  type: 'new_appointment' | 'appointment_reminder' | 'appointment_cancelled' | 'appointment_rescheduled';
  message: string;
}

class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkSupport(): void {
    this.isSupported = 
      'serviceWorker' in navigator && 
      'PushManager' in window && 
      'Notification' in window;
  }

  public isNotificationSupported(): boolean {
    return this.isSupported;
  }

  public async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    if (!this.isSupported) {
      return { granted: false, denied: true, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  public async initializeNotifications(clinicId: string): Promise<string | null> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      // Register service worker
      await this.registerServiceWorker();

      // Get FCM token
      this.fcmToken = await getMessagingToken();
      
      if (this.fcmToken) {
        // Store token on server associated with clinic
        await this.saveTokenToServer(this.fcmToken, clinicId);
        console.log('FCM token generated and saved:', this.fcmToken);
      }

      return this.fcmToken;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      throw error;
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
  }

  private async saveTokenToServer(token: string, clinicId: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          clinicId,
          platform: 'web',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save token to server');
      }

      console.log('Token saved to server successfully');
    } catch (error) {
      console.error('Error saving token to server:', error);
      // Don't throw here as the token is still valid locally
    }
  }

  public async showLocalNotification(notification: AppointmentNotification): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: notification.message,
      icon: '/NearMe .Ai (350 x 180 px).png',
      badge: '/logo.png',
      tag: `appointment-${notification.id}`,
      requireInteraction: true,
      data: {
        appointmentId: notification.id,
        clinicId: notification.clinicId,
        type: notification.type,
        url: `/clinic/appointments/${notification.id}`
      }
    };

    const title = this.getNotificationTitle(notification.type);
    
    try {
      new Notification(title, notificationOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private getNotificationTitle(type: AppointmentNotification['type']): string {
    switch (type) {
      case 'new_appointment':
        return 'New Appointment Booked';
      case 'appointment_reminder':
        return 'Appointment Reminder';
      case 'appointment_cancelled':
        return 'Appointment Cancelled';
      case 'appointment_rescheduled':
        return 'Appointment Rescheduled';
      default:
        return 'Appointment Notification';
    }
  }

  public async unsubscribe(clinicId: string): Promise<void> {
    try {
      if (this.fcmToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/token`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.fcmToken,
            clinicId,
          }),
        });
      }

      this.fcmToken = null;
      console.log('Unsubscribed from notifications');
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    }
  }

  public getFCMToken(): string | null {
    return this.fcmToken;
  }
}

export const notificationService = NotificationService.getInstance();