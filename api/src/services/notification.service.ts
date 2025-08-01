import { Notification, IAppointment, Patient, Clinic } from '../models';
import logger from '../config/logger.config';

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
      
      // TODO: Send email notification
      // await this.sendEmail(patient.email, notification.title, notification.message);
      
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

  static async getNotifications(recipientId: string, recipientType: 'patient' | 'clinic') {
    try {
      const notifications = await Notification.find({
        recipient: recipientId,
        recipientType
      })
      .populate('relatedAppointment')
      .sort({ createdAt: -1 })
      .limit(50);

      return notifications;
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // TODO: Implement email service
  // private static async sendEmail(to: string, subject: string, message: string) {
  //   // Email implementation here
  // }
}