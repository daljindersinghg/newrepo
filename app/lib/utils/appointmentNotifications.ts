import { AppointmentNotification } from '@/lib/services/notificationService';

// Types for appointment data
export interface AppointmentData {
  id: string;
  patientName: string;
  patientEmail: string;
  clinicId: string;
  dentistName: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

// Utility functions to create notifications for different appointment events
export class AppointmentNotificationManager {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Send notification when a new appointment is booked
   */
  static async sendNewAppointmentNotification(appointmentData: AppointmentData): Promise<void> {
    const notification: AppointmentNotification = {
      id: `new_${appointmentData.id}`,
      clinicId: appointmentData.clinicId,
      patientName: appointmentData.patientName,
      appointmentTime: appointmentData.appointmentTime,
      appointmentDate: appointmentData.appointmentDate,
      type: 'new_appointment',
      message: `New appointment request from ${appointmentData.patientName} for ${appointmentData.service} on ${appointmentData.appointmentDate} at ${appointmentData.appointmentTime}`
    };

    await this.sendPushNotification(notification, {
      title: '🦷 New Appointment Request',
      body: `${appointmentData.patientName} has requested an appointment for ${appointmentData.service}`,
      data: {
        appointmentId: appointmentData.id,
        clinicId: appointmentData.clinicId,
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        service: appointmentData.service,
        type: 'new_appointment',
        url: `/clinic/appointments/${appointmentData.id}`
      }
    });
  }

  /**
   * Send notification when an appointment is cancelled
   */
  static async sendCancellationNotification(appointmentData: AppointmentData): Promise<void> {
    const notification: AppointmentNotification = {
      id: `cancel_${appointmentData.id}`,
      clinicId: appointmentData.clinicId,
      patientName: appointmentData.patientName,
      appointmentTime: appointmentData.appointmentTime,
      appointmentDate: appointmentData.appointmentDate,
      type: 'appointment_cancelled',
      message: `${appointmentData.patientName} cancelled their appointment for ${appointmentData.service} on ${appointmentData.appointmentDate}`
    };

    await this.sendPushNotification(notification, {
      title: '❌ Appointment Cancelled',
      body: `${appointmentData.patientName} cancelled their ${appointmentData.service} appointment`,
      data: {
        appointmentId: appointmentData.id,
        clinicId: appointmentData.clinicId,
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        service: appointmentData.service,
        type: 'appointment_cancelled',
        url: `/clinic/appointments/${appointmentData.id}`
      }
    });
  }

  /**
   * Send notification when an appointment is rescheduled
   */
  static async sendRescheduleNotification(
    appointmentData: AppointmentData, 
    oldDate: string, 
    oldTime: string
  ): Promise<void> {
    const notification: AppointmentNotification = {
      id: `reschedule_${appointmentData.id}`,
      clinicId: appointmentData.clinicId,
      patientName: appointmentData.patientName,
      appointmentTime: appointmentData.appointmentTime,
      appointmentDate: appointmentData.appointmentDate,
      type: 'appointment_rescheduled',
      message: `${appointmentData.patientName} rescheduled their appointment from ${oldDate} ${oldTime} to ${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`
    };

    await this.sendPushNotification(notification, {
      title: '📅 Appointment Rescheduled',
      body: `${appointmentData.patientName} moved their appointment to ${appointmentData.appointmentDate}`,
      data: {
        appointmentId: appointmentData.id,
        clinicId: appointmentData.clinicId,
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        service: appointmentData.service,
        type: 'appointment_rescheduled',
        oldDate,
        oldTime,
        url: `/clinic/appointments/${appointmentData.id}`
      }
    });
  }

  /**
   * Send notification when clinic makes a counter-offer
   */
  static async sendCounterOfferNotification(appointmentData: AppointmentData, counterOffer: {
    proposedDate?: string;
    proposedTime?: string;
    message?: string;
  }): Promise<void> {
    const notification: AppointmentNotification = {
      id: `counter_${appointmentData.id}`,
      clinicId: appointmentData.clinicId,
      patientName: appointmentData.patientName,
      appointmentTime: counterOffer.proposedTime || appointmentData.appointmentTime,
      appointmentDate: counterOffer.proposedDate || appointmentData.appointmentDate,
      type: 'appointment_rescheduled', // Using existing type as it's similar
      message: `Alternative time suggested for ${appointmentData.patientName}: ${counterOffer.proposedDate || appointmentData.appointmentDate} at ${counterOffer.proposedTime || appointmentData.appointmentTime}`
    };

    await this.sendPushNotification(notification, {
      title: '💬 Alternative Time Suggested',
      body: `New time option available for ${appointmentData.service} appointment`,
      data: {
        appointmentId: appointmentData.id,
        clinicId: appointmentData.clinicId,
        patientName: appointmentData.patientName,
        appointmentDate: counterOffer.proposedDate || appointmentData.appointmentDate,
        appointmentTime: counterOffer.proposedTime || appointmentData.appointmentTime,
        service: appointmentData.service,
        type: 'counter_offer',
        message: counterOffer.message,
        url: `/clinic/appointments/${appointmentData.id}`
      }
    });
  }

  /**
   * Send reminder notification for upcoming appointments
   */
  static async sendReminderNotification(appointmentData: AppointmentData): Promise<void> {
    const notification: AppointmentNotification = {
      id: `reminder_${appointmentData.id}`,
      clinicId: appointmentData.clinicId,
      patientName: appointmentData.patientName,
      appointmentTime: appointmentData.appointmentTime,
      appointmentDate: appointmentData.appointmentDate,
      type: 'appointment_reminder',
      message: `Reminder: ${appointmentData.patientName} has an appointment tomorrow at ${appointmentData.appointmentTime} for ${appointmentData.service}`
    };

    await this.sendPushNotification(notification, {
      title: '⏰ Appointment Reminder',
      body: `${appointmentData.patientName} has an appointment tomorrow at ${appointmentData.appointmentTime}`,
      data: {
        appointmentId: appointmentData.id,
        clinicId: appointmentData.clinicId,
        patientName: appointmentData.patientName,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        service: appointmentData.service,
        type: 'appointment_reminder',
        url: `/clinic/appointments/${appointmentData.id}`
      }
    });
  }

  /**
   * Send push notification via Firebase Admin SDK (server-side)
   */
  private static async sendPushNotification(
    notification: AppointmentNotification, 
    payload: any
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicId: notification.clinicId,
          notification: payload,
          appointmentData: notification
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Don't throw here to prevent breaking the main flow
    }
  }

  /**
   * Utility function to format appointment time for display
   */
  static formatAppointmentTime(date: string, time: string): string {
    try {
      const appointmentDate = new Date(`${date}T${time}`);
      return appointmentDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return `${date} at ${time}`;
    }
  }

  /**
   * Check if notifications should be sent (business hours, etc.)
   */
  static shouldSendNotification(): boolean {
    const now = new Date();
    const hour = now.getHours();
    
    // Only send notifications during business hours (8 AM - 8 PM)
    return hour >= 8 && hour <= 20;
  }

  /**
   * Schedule a reminder notification for tomorrow
   */
  static async scheduleReminderNotification(appointmentData: AppointmentData): Promise<void> {
    // This would typically be handled by a background job or cron service
    // For now, we'll just make an API call to schedule it
    try {
      await fetch(`${this.baseUrl}/api/notifications/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentData.id,
          clinicId: appointmentData.clinicId,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          type: 'reminder'
        }),
      });
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
    }
  }
}

// Example usage functions for integration
export const appointmentNotifications = {
  // Call this when a new appointment is created
  onAppointmentCreated: async (appointmentData: AppointmentData) => {
    if (AppointmentNotificationManager.shouldSendNotification()) {
      await AppointmentNotificationManager.sendNewAppointmentNotification(appointmentData);
      await AppointmentNotificationManager.scheduleReminderNotification(appointmentData);
    }
  },

  // Call this when an appointment is cancelled
  onAppointmentCancelled: async (appointmentData: AppointmentData) => {
    if (AppointmentNotificationManager.shouldSendNotification()) {
      await AppointmentNotificationManager.sendCancellationNotification(appointmentData);
    }
  },

  // Call this when an appointment is rescheduled
  onAppointmentRescheduled: async (
    appointmentData: AppointmentData,
    oldDate: string,
    oldTime: string
  ) => {
    if (AppointmentNotificationManager.shouldSendNotification()) {
      await AppointmentNotificationManager.sendRescheduleNotification(appointmentData, oldDate, oldTime);
    }
  },

  // Call this when clinic makes a counter-offer
  onCounterOffer: async (
    appointmentData: AppointmentData,
    counterOffer: { proposedDate?: string; proposedTime?: string; message?: string }
  ) => {
    if (AppointmentNotificationManager.shouldSendNotification()) {
      await AppointmentNotificationManager.sendCounterOfferNotification(appointmentData, counterOffer);
    }
  },

  // Call this for reminder notifications (typically from a cron job)
  sendDailyReminders: async (upcomingAppointments: AppointmentData[]) => {
    for (const appointment of upcomingAppointments) {
      await AppointmentNotificationManager.sendReminderNotification(appointment);
    }
  }
};