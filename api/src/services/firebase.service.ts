// NOTIFICATIONS DISABLED - All Firebase push notification functionality disabled

import logger from '../config/logger.config';

class FirebaseService {
  private static instance: FirebaseService;

  constructor() {
    logger.info('🚫 FirebaseService: Push notifications are disabled');
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async sendNotificationToClinic(
    clinicId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  ): Promise<{ success: boolean; message: string; results?: any[] }> {
    logger.info(`� [DISABLED] Push notification for clinic ${clinicId}:`, {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      disabled: true
    });
    
    return {
      success: false,
      message: 'Push notifications are disabled',
      results: []
    };
  }

  public async sendAppointmentNotification(
    clinicId: string,
    appointmentData: {
      appointmentId: string;
      patientName: string;
      appointmentDate: string;
      appointmentTime: string;
      type: 'new_appointment' | 'appointment_reminder' | 'appointment_cancelled' | 'appointment_rescheduled';
    }
  ): Promise<{ success: boolean; message: string }> {
    logger.info(`🚫 [DISABLED] Appointment notification for clinic ${clinicId}:`, {
      patient: appointmentData.patientName,
      type: appointmentData.type,
      date: appointmentData.appointmentDate,
      time: appointmentData.appointmentTime,
      disabled: true
    });

    return {
      success: false,
      message: 'Push notifications are disabled'
    };
  }

  public isFirebaseConfigured(): boolean {
    return false; // Always return false when disabled
  }
}

export const firebaseService = FirebaseService.getInstance();
export default firebaseService;