import * as admin from 'firebase-admin';
import { PushToken } from '../models';
import logger from '../config/logger.config';

class FirebaseService {
  private static instance: FirebaseService;
  private firebaseApp: admin.app.App | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeFirebase();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private initializeFirebase(): void {
    try {
      // Check if Firebase is already initialized
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.apps[0];
        this.isInitialized = true;
        logger.info('Firebase already initialized');
        return;
      }

      // Check for service account key
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      const projectId = process.env.FIREBASE_PROJECT_ID || 'sample-540f6';

      if (!serviceAccountKey) {
        logger.warn('Firebase service account key not found. Push notifications will be logged only.');
        return;
      }

      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId
        });

        this.isInitialized = true;
        logger.info('Firebase Admin SDK initialized successfully');
      } catch (parseError) {
        logger.error('Invalid Firebase service account key format:', parseError);
      }
    } catch (error) {
      logger.error('Error initializing Firebase Admin SDK:', error);
    }
  }

  public async sendNotificationToClinic(
    clinicId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
    }
  ): Promise<{ success: boolean; message: string; results?: any[] }> {
    try {
      // Get all active tokens for the clinic
      const tokens = await PushToken.find({ 
        clinicId, 
        isActive: true 
      }).select('token');

      if (tokens.length === 0) {
        logger.warn(`No active push tokens found for clinic ${clinicId}`);
        return {
          success: false,
          message: 'No active push tokens found for clinic'
        };
      }

      const tokenStrings = tokens.map(t => t.token);

      // If Firebase is not initialized, just log the notification
      if (!this.isInitialized || !this.firebaseApp) {
        logger.info(`🔔 [MOCK] Push notification for clinic ${clinicId}:`, {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          tokens: tokenStrings.length
        });
        
        return {
          success: true,
          message: `Mock notification sent to ${tokenStrings.length} tokens`,
          results: tokenStrings.map(token => ({ token, success: true, mock: true }))
        };
      }

      // Create the notification payload
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        tokens: tokenStrings
      };

      // Send the notification
      const response = await admin.messaging().sendEachForMulticast(message);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((result: any, index: number) => {
          if (!result.success) {
            const token = tokenStrings[index];
            failedTokens.push(token);
            logger.warn(`Failed to send notification to token ${token.substring(0, 20)}...:`, result.error);
            
            // If the token is invalid, mark it as inactive
            if (result.error?.code === 'messaging/invalid-registration-token' ||
                result.error?.code === 'messaging/registration-token-not-registered') {
              PushToken.findOneAndUpdate(
                { token },
                { isActive: false }
              ).catch(err => logger.error('Error deactivating token:', err));
            }
          }
        });
      }

      logger.info(`✅ Push notification sent to clinic ${clinicId}: ${response.successCount}/${tokenStrings.length} successful`);

      return {
        success: response.successCount > 0,
        message: `Notification sent: ${response.successCount}/${tokenStrings.length} successful`,
        results: response.responses.map((result: any, index: number) => ({
          token: tokenStrings[index].substring(0, 20) + '...',
          success: result.success,
          error: result.error?.message
        }))
      };

    } catch (error) {
      logger.error('Error sending push notification:', error);
      return {
        success: false,
        message: `Failed to send push notification: ${error}`
      };
    }
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
    const notificationTitles = {
      'new_appointment': 'New Appointment Request',
      'appointment_reminder': 'Appointment Reminder',
      'appointment_cancelled': 'Appointment Cancelled',
      'appointment_rescheduled': 'Appointment Rescheduled'
    };

    const notificationBodies = {
      'new_appointment': `${appointmentData.patientName} has requested an appointment for ${appointmentData.appointmentDate} at ${appointmentData.appointmentTime}`,
      'appointment_reminder': `Reminder: Appointment with ${appointmentData.patientName} at ${appointmentData.appointmentTime}`,
      'appointment_cancelled': `${appointmentData.patientName} has cancelled their appointment`,
      'appointment_rescheduled': `${appointmentData.patientName} has rescheduled their appointment`
    };

    const result = await this.sendNotificationToClinic(clinicId, {
      title: notificationTitles[appointmentData.type],
      body: notificationBodies[appointmentData.type],
      data: {
        appointmentId: appointmentData.appointmentId,
        clinicId: clinicId,
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        type: appointmentData.type,
        url: `/clinic/appointments/${appointmentData.appointmentId}`,
        timestamp: new Date().toISOString()
      }
    });

    return result;
  }

  public isFirebaseConfigured(): boolean {
    return this.isInitialized && this.firebaseApp !== null;
  }
}

export const firebaseService = FirebaseService.getInstance();
export default firebaseService;