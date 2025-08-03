// NOTIFICATIONS DISABLED - All notification functionality commented out

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
    console.log('🚫 NotificationService: Notifications are disabled');
    this.isSupported = false;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public isNotificationSupported(): boolean {
    console.log('🚫 Notification support check: Disabled');
    return false;
  }

  public async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    console.log('🚫 Permission status: Disabled');
    return { granted: false, denied: true, default: false };
  }

  public async requestPermission(): Promise<NotificationPermission> {
    console.log('🚫 Permission request: Disabled');
    return 'denied';
  }

  public async initializeNotifications(clinicId: string): Promise<string | null> {
    console.log('🚫 Initialize notifications: Disabled for clinic', clinicId);
    return null;
  }

  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    console.log('🚫 Service worker registration: Disabled');
    return null;
  }

  public async saveTokenToServer(token: string, clinicId: string): Promise<boolean> {
    console.log('🚫 Save token to server: Disabled', { token: token.substring(0, 20) + '...', clinicId });
    return false;
  }

  public async showLocalNotification(notification: AppointmentNotification): Promise<void> {
    console.log('🚫 Local notification: Disabled', notification);
    return;
  }

  public async unsubscribe(clinicId: string): Promise<void> {
    console.log('🚫 Unsubscribe: Disabled for clinic', clinicId);
    return;
  }

  public getFCMToken(): string | null {
    console.log('🚫 FCM token: Disabled');
    return null;
  }
}

export const notificationService = NotificationService.getInstance();