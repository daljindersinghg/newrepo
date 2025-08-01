import { Notification, IAppointment, Patient, Clinic } from '../models';
import logger from '../config/logger.config';
import { EmailService } from './email.service';

export class NotificationService {
  static async sendAppointmentRequest(appointment: IAppointment) {
    try {
      const patient = await Patient.findById(appointment.patient);
      const clinic = await Clinic.findById(appointment.clinic);
      
      if (!patient || !clinic) {
        throw new Error('Patient or clinic not found');
      }

      const notification = new Notification({
        recipient: clinic._id,
        recipientType: 'clinic',
        type: 'appointment_request',
        title: 'New Appointment Request',
        message: `${patient.name || patient.email} has requested an appointment for ${appointment.originalRequest.requestedDate.toDateString()} at ${appointment.originalRequest.requestedTime}`,
        relatedAppointment: appointment._id,
        actionRequired: true,
        actionType: 'respond_to_request',
        actionUrl: `/appointments/${appointment._id}`
      });

      await notification.save();
      
      // TODO: Send email notification
      // await this.sendEmail(clinic.email, notification.title, notification.message);
      
      logger.info(`Appointment request notification sent to clinic ${clinic._id}`);
      return notification;
    } catch (error) {
      logger.error('Error sending appointment request notification:', error);
      throw error;
    }
  }

  static async sendClinicResponse(appointment: IAppointment) {
    try {
      const patient = await Patient.findById(appointment.patient);
      const clinic = await Clinic.findById(appointment.clinic);
      
      if (!patient || !clinic) {
        throw new Error('Patient or clinic not found');
      }

      const latestResponse = appointment.clinicResponses[appointment.clinicResponses.length - 1];
      let title = '';
      let message = '';
      let actionRequired = false;
      let actionType = 'none';

      switch (latestResponse.responseType) {
        case 'confirmation':
          title = 'Appointment Confirmed';
          message = `Your appointment with ${clinic.name} has been confirmed for ${appointment.appointmentDate.toDateString()}`;
          break;
        case 'counter-offer':
          title = 'Alternative Time Suggested';
          message = `${clinic.name} has suggested an alternative time: ${latestResponse.proposedDate?.toDateString()} at ${latestResponse.proposedTime}`;
          actionRequired = true;
          actionType = 'confirm_appointment';
          break;
        case 'rejection':
          title = 'Appointment Request Declined';
          message = `Unfortunately, ${clinic.name} cannot accommodate your requested appointment time.`;
          break;
      }

      const notification = new Notification({
        recipient: patient._id,
        recipientType: 'patient',
        type: latestResponse.responseType === 'counter-offer' ? 'counter_offer' : 
              latestResponse.responseType === 'confirmation' ? 'confirmation' : 'rejection',
        title,
        message: `${message}. ${latestResponse.message}`,
        relatedAppointment: appointment._id,
        actionRequired,
        actionType,
        actionUrl: `/appointments/${appointment._id}`
      });

      await notification.save();
      
      // Send email notification based on response type
      try {
        switch (latestResponse.responseType) {
          case 'confirmation':
            await EmailService.sendAppointmentConfirmation(
              patient.email,
              patient.name || patient.email,
              clinic.name,
              appointment.appointmentDate,
              appointment.originalRequest.requestedTime,
              appointment.duration,
              appointment.type
            );
            break;
          case 'counter-offer':
            if (latestResponse.proposedDate && latestResponse.proposedTime) {
              await EmailService.sendAlternativeTime(
                patient.email,
                patient.name || patient.email,
                clinic.name,
                appointment.originalRequest.requestedDate,
                appointment.originalRequest.requestedTime,
                latestResponse.proposedDate,
                latestResponse.proposedTime,
                latestResponse.proposedDuration || appointment.duration,
                latestResponse.message
              );
            }
            break;
          case 'rejection':
            await EmailService.sendAppointmentDeclined(
              patient.email,
              patient.name || patient.email,
              clinic.name,
              appointment.originalRequest.requestedDate,
              appointment.originalRequest.requestedTime,
              latestResponse.message
            );
            break;
        }
      } catch (emailError) {
        logger.error('Error sending email notification:', emailError);
        // Don't throw - we don't want to fail the whole operation if email fails
      }
      
      logger.info(`Clinic response notification sent to patient ${patient._id}`);
      return notification;
    } catch (error) {
      logger.error('Error sending clinic response notification:', error);
      throw error;
    }
  }

  static async sendPatientCounter(appointment: IAppointment) {
    try {
      const patient = await Patient.findById(appointment.patient);
      const clinic = await Clinic.findById(appointment.clinic);
      
      if (!patient || !clinic) {
        throw new Error('Patient or clinic not found');
      }

      const notification = new Notification({
        recipient: clinic._id,
        recipientType: 'clinic',
        type: 'counter_offer',
        title: 'Patient Counter-Offer',
        message: `${patient.name || patient.email} has made a counter-offer for their appointment request`,
        relatedAppointment: appointment._id,
        actionRequired: true,
        actionType: 'respond_to_request',
        actionUrl: `/appointments/${appointment._id}`
      });

      await notification.save();
      
      // TODO: Send email notification
      // await this.sendEmail(clinic.email, notification.title, notification.message);
      
      logger.info(`Patient counter notification sent to clinic ${clinic._id}`);
      return notification;
    } catch (error) {
      logger.error('Error sending patient counter notification:', error);
      throw error;
    }
  }

  static async sendCancellation(appointment: IAppointment) {
    try {
      const patient = await Patient.findById(appointment.patient);
      const clinic = await Clinic.findById(appointment.clinic);
      
      if (!patient || !clinic) {
        throw new Error('Patient or clinic not found');
      }

      // Send to both patient and clinic
      const notifications = [
        new Notification({
          recipient: patient._id,
          recipientType: 'patient',
          type: 'cancellation',
          title: 'Appointment Cancelled',
          message: `Your appointment with ${clinic.name} has been cancelled`,
          relatedAppointment: appointment._id,
          actionRequired: false,
          actionType: 'none'
        }),
        new Notification({
          recipient: clinic._id,
          recipientType: 'clinic',
          type: 'cancellation',
          title: 'Appointment Cancelled',
          message: `The appointment with ${patient.name || patient.email} has been cancelled`,
          relatedAppointment: appointment._id,
          actionRequired: false,
          actionType: 'none'
        })
      ];

      await Promise.all(notifications.map(n => n.save()));
      
      // TODO: Send email notifications
      
      logger.info(`Cancellation notifications sent for appointment ${appointment._id}`);
      return notifications;
    } catch (error) {
      logger.error('Error sending cancellation notifications:', error);
      throw error;
    }
  }

  static async getNotifications(
    recipientId: string, 
    recipientType: 'patient' | 'clinic',
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {
        recipient: recipientId,
        recipientType
      };

      if (unreadOnly) {
        query.read = false;
      }

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .populate('relatedAppointment')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notification.countDocuments(query)
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, recipientId?: string) {
    try {
      const query: any = { _id: notificationId };
      if (recipientId) {
        query.recipient = recipientId;
      }

      const notification = await Notification.findOneAndUpdate(
        query,
        { read: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(recipientId: string, recipientType: 'patient' | 'clinic'): Promise<number> {
    try {
      const count = await Notification.countDocuments({
        recipient: recipientId,
        recipientType,
        read: false
      });

      return count;
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      throw error;
    }
  }

  static async markAllAsRead(recipientId: string, recipientType: 'patient' | 'clinic') {
    try {
      const result = await Notification.updateMany(
        {
          recipient: recipientId,
          recipientType,
          read: false
        },
        {
          read: true,
          readAt: new Date()
        }
      );

      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: string, recipientId?: string): Promise<boolean> {
    try {
      const query: any = { _id: notificationId };
      if (recipientId) {
        query.recipient = recipientId;
      }

      const result = await Notification.findOneAndDelete(query);
      return !!result;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  // TODO: Implement email service
  // private static async sendEmail(to: string, subject: string, message: string) {
  //   // Email implementation here
  // }
}