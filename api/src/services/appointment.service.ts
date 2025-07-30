// api/src/services/appointment.service.ts (Enhanced Version)
import { Appointment, IAppointment, Clinic, Patient } from "../models";
import { AvailabilityService } from './availability.service';
import logger from '../config/logger.config';
import mongoose from 'mongoose';

interface AppointmentFilters {
  patient?: string;
  clinic?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  type?: string;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class AppointmentService {
  
  /**
   * Create a new appointment with availability validation
   */
  static async createAppointment(appointmentData: Partial<IAppointment>): Promise<IAppointment> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      // Validate required fields
      if (!appointmentData.patient || !appointmentData.clinic || !appointmentData.appointmentDate) {
        throw new Error('Patient, clinic, and appointment date are required');
      }

      // Validate patient exists
      const patient = await Patient.findById(appointmentData.patient).session(session);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Validate clinic exists and is active
      const clinic = await Clinic.findById(appointmentData.clinic).session(session);
      if (!clinic) {
        throw new Error('Clinic not found');
      }
      if (!clinic.active) {
        throw new Error('Clinic is not currently accepting appointments');
      }

      // Check if the requested time slot is available
      const appointmentDate = new Date(appointmentData.appointmentDate);
      const duration = appointmentData.duration || 30;
      
      const isAvailable = await AvailabilityService.isSlotAvailable(
        appointmentData.clinic as string,
        appointmentDate,
        duration
      );

      if (!isAvailable) {
        throw new Error('The requested time slot is not available');
      }

      // Check for duplicate appointments (same patient, same time)
      const existingAppointment = await Appointment.findOne({
        patient: appointmentData.patient,
        appointmentDate: {
          $gte: new Date(appointmentDate.getTime() - 15 * 60000), // 15 minutes before
          $lte: new Date(appointmentDate.getTime() + 15 * 60000)  // 15 minutes after
        },
        status: { $in: ['scheduled', 'confirmed'] }
      }).session(session);

      if (existingAppointment) {
        throw new Error('Patient already has an appointment around this time');
      }

      // Create the appointment
      const appointment = await Appointment.create([{
        ...appointmentData,
        status: 'scheduled',
        reminderSent: false
      }], { session });

      await session.commitTransaction();

      // Schedule reminder (would be implemented)
      // await this.scheduleReminder(appointment[0]);

      // Send confirmation (would be implemented)
      // await this.sendConfirmation(appointment[0]);

      logger.info(`Appointment created: ${appointment[0]._id} for patient ${appointmentData.patient}`);
      
      return appointment[0];

    } catch (error: any) {
      await session.abortTransaction();
      logger.error('Error creating appointment:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get appointment by ID with populated references
   */
  static async getAppointmentById(id: string): Promise<IAppointment | null> {
    try {
      const appointment = await Appointment.findById(id)
        .populate('patient', 'name email phone')
        .populate('clinic', 'name address phone email')
        .lean();

      return appointment;
    } catch (error: any) {
      logger.error('Error fetching appointment:', error);
      throw error;
    }
  }

  /**
   * Get appointments with filters and pagination
   */
  static async getAppointments(
    filters: AppointmentFilters = {},
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'appointmentDate'
  ): Promise<PaginationResult<IAppointment>> {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      // Build query from filters
      if (filters.patient) query.patient = filters.patient;
      if (filters.clinic) query.clinic = filters.clinic;
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;

      if (filters.startDate || filters.endDate) {
        query.appointmentDate = {};
        if (filters.startDate) query.appointmentDate.$gte = filters.startDate;
        if (filters.endDate) query.appointmentDate.$lte = filters.endDate;
      }

      const [appointments, total] = await Promise.all([
        Appointment.find(query)
          .populate('patient', 'name email phone')
          .populate('clinic', 'name address phone')
          .sort({ [sortBy]: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Appointment.countDocuments(query)
      ]);

      return {
        data: appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error: any) {
      logger.error('Error fetching appointments:', error);
      throw error;
    }
  }

  /**
   * Get patient's appointments
   */
  static async getPatientAppointments(
    patientId: string,
    filters: Partial<AppointmentFilters> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PaginationResult<IAppointment>> {
    return this.getAppointments(
      { ...filters, patient: patientId },
      page,
      limit,
      'appointmentDate'
    );
  }

  /**
   * Get clinic's appointments
   */
  static async getClinicAppointments(
    clinicId: string,
    filters: Partial<AppointmentFilters> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginationResult<IAppointment>> {
    return this.getAppointments(
      { ...filters, clinic: clinicId },
      page,
      limit,
      'appointmentDate'
    );
  }

  /**
   * Get upcoming appointments for a patient
   */
  static async getUpcomingAppointments(
    patientId: string,
    limit: number = 5
  ): Promise<IAppointment[]> {
    try {
      const now = new Date();

      const appointments = await Appointment.find({
        patient: patientId,
        appointmentDate: { $gte: now },
        status: { $in: ['scheduled', 'confirmed'] }
      })
        .populate('clinic', 'name address phone')
        .sort({ appointmentDate: 1 })
        .limit(limit)
        .lean();

      return appointments;

    } catch (error: any) {
      logger.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }

  /**
   * Reschedule an appointment
   */
  static async rescheduleAppointment(
    appointmentId: string,
    newDateTime: Date,
    reason: string,
    duration?: number
  ): Promise<IAppointment> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Get existing appointment
      const appointment = await Appointment.findById(appointmentId).session(session);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status === 'completed' || appointment.status === 'cancelled') {
        throw new Error('Cannot reschedule completed or cancelled appointments');
      }

      const newDuration = duration || appointment.duration;

      // Check if new slot is available
      const isAvailable = await AvailabilityService.isSlotAvailable(
        appointment.clinic.toString(),
        newDateTime,
        newDuration
      );

      if (!isAvailable) {
        throw new Error('The new time slot is not available');
      }

      // Store old date for logging
      const oldDate = appointment.appointmentDate;

      // Update appointment
      appointment.appointmentDate = newDateTime;
      appointment.duration = newDuration;
      appointment.notes = `${appointment.notes || ''}\nRescheduled: ${reason}`.trim();
      appointment.reminderSent = false; // Reset reminder flag

      await appointment.save({ session });

      await session.commitTransaction();

      // Send reschedule notification (would be implemented)
      // await this.sendRescheduleNotification(appointment, oldDate);

      // Schedule new reminder (would be implemented)
      // await this.scheduleReminder(appointment);

      logger.info(`Appointment ${appointmentId} rescheduled from ${oldDate} to ${newDateTime}`);

      return appointment;

    } catch (error: any) {
      await session.abortTransaction();
      logger.error('Error rescheduling appointment:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancel an appointment
   */
  static async cancelAppointment(
    appointmentId: string,
    reason: string,
    cancelledBy: 'patient' | 'clinic' | 'admin' = 'patient'
  ): Promise<IAppointment> {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status === 'completed') {
        throw new Error('Cannot cancel completed appointments');
      }

      if (appointment.status === 'cancelled') {
        throw new Error('Appointment is already cancelled');
      }

      // Update appointment status
      appointment.status = 'cancelled';
      appointment.notes = `${appointment.notes || ''}\nCancelled by ${cancelledBy}: ${reason}`.trim();

      await appointment.save();

      // Send cancellation notification (would be implemented)
      // await this.sendCancellationNotification(appointment, cancelledBy);

      logger.info(`Appointment ${appointmentId} cancelled by ${cancelledBy}: ${reason}`);

      return appointment;

    } catch (error: any) {
      logger.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  static async updateStatus(
    appointmentId: string,
    status: string,
    notes?: string,
    additionalData?: Partial<IAppointment>
  ): Promise<IAppointment> {
    try {
      const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Update status and notes
      appointment.status = status as any;
      if (notes) {
        appointment.notes = `${appointment.notes || ''}\nStatus update: ${notes}`.trim();
      }

      // Apply additional data if provided
      if (additionalData) {
        Object.assign(appointment, additionalData);
      }

      await appointment.save();

      // Send status update notification (would be implemented)
      // await this.sendStatusUpdateNotification(appointment);

      logger.info(`Appointment ${appointmentId} status updated to ${status}`);

      return appointment;

    } catch (error: any) {
      logger.error('Error updating appointment status:', error);
      throw error;
    }
  }

  /**
   * Delete an appointment (hard delete)
   */
  static async deleteAppointment(appointmentId: string): Promise<boolean> {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Only allow deletion of cancelled appointments or very recent ones
      const now = new Date();
      const appointmentTime = new Date(appointment.appointmentDate);
      const timeDiff = appointmentTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (appointment.status !== 'cancelled' && hoursDiff < 24) {
        throw new Error('Can only delete cancelled appointments or those more than 24 hours away');
      }

      await Appointment.findByIdAndDelete(appointmentId);

      logger.info(`Appointment ${appointmentId} deleted`);

      return true;

    } catch (error: any) {
      logger.error('Error deleting appointment:', error);
      throw error;
    }
  }

  /**
   * Get appointment statistics for a clinic
   */
  static async getClinicStatistics(
    clinicId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
    revenue: number;
    averageRating?: number;
  }> {
    try {
      const query: any = { clinic: clinicId };

      if (startDate || endDate) {
        query.appointmentDate = {};
        if (startDate) query.appointmentDate.$gte = startDate;
        if (endDate) query.appointmentDate.$lte = endDate;
      }

      const [stats, revenue] = await Promise.all([
        Appointment.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        Appointment.aggregate([
          { 
            $match: { 
              ...query, 
              status: 'completed',
              actualCost: { $exists: true, $ne: null }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$actualCost' }
            }
          }
        ])
      ]);

      // Process stats
      const statusCounts = {
        total: 0,
        scheduled: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0
      };

      stats.forEach(stat => {
        statusCounts.total += stat.count;
        switch (stat._id) {
          case 'scheduled':
            statusCounts.scheduled = stat.count;
            break;
          case 'confirmed':
            statusCounts.confirmed = stat.count;
            break;
          case 'completed':
            statusCounts.completed = stat.count;
            break;
          case 'cancelled':
            statusCounts.cancelled = stat.count;
            break;
          case 'no-show':
            statusCounts.noShow = stat.count;
            break;
        }
      });

      return {
        ...statusCounts,
        revenue: revenue[0]?.totalRevenue || 0
      };

    } catch (error: any) {
      logger.error('Error getting clinic statistics:', error);
      throw error;
    }
  }

  /**
   * Get appointments that need reminders
   */
  static async getAppointmentsNeedingReminders(
    hoursAhead: number = 24
  ): Promise<IAppointment[]> {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));

      const appointments = await Appointment.find({
        appointmentDate: {
          $gte: now,
          $lte: reminderTime
        },
        status: { $in: ['scheduled', 'confirmed'] },
        reminderSent: { $ne: true }
      })
        .populate('patient', 'name email phone')
        .populate('clinic', 'name address phone')
        .lean();

      return appointments;

    } catch (error: any) {
      logger.error('Error getting appointments needing reminders:', error);
      throw error;
    }
  }

  /**
   * Mark reminder as sent
   */
  static async markReminderSent(appointmentId: string): Promise<void> {
    try {
      await Appointment.findByIdAndUpdate(appointmentId, {
        reminderSent: true,
        reminderDate: new Date()
      });

      logger.info(`Reminder marked as sent for appointment ${appointmentId}`);

    } catch (error: any) {
      logger.error('Error marking reminder as sent:', error);
      throw error;
    }
  }

  /**
   * Get conflicting appointments (for double-booking prevention)
   */
  static async getConflictingAppointments(
    clinicId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<IAppointment[]> {
    try {
      const query: any = {
        clinic: clinicId,
        status: { $in: ['scheduled', 'confirmed'] },
        $or: [
          // Appointment starts during our time slot
          {
            appointmentDate: {
              $gte: startTime,
              $lt: endTime
            }
          },
          // Appointment ends during our time slot
          {
            $expr: {
              $and: [
                { $lte: ['$appointmentDate', startTime] },
                { 
                  $gt: [
                    { $add: ['$appointmentDate', { $multiply: ['$duration', 60000] }] },
                    startTime
                  ]
                }
              ]
            }
          }
        ]
      };

      if (excludeAppointmentId) {
        query._id = { $ne: excludeAppointmentId };
      }

      const conflicts = await Appointment.find(query)
        .populate('patient', 'name email')
        .lean();

      return conflicts;

    } catch (error: any) {
      logger.error('Error checking for conflicting appointments:', error);
      throw error;
    }
  }

  // ================ NOTIFICATION METHODS (Placeholder) ================
  // These would be implemented with actual email/SMS services

  // private static async sendConfirmation(appointment: IAppointment): Promise<void> {
  //   // Would integrate with email service (SendGrid, AWS SES, etc.)
  //   logger.info(`Sending confirmation for appointment ${appointment._id}`);
  // }

  // private static async sendRescheduleNotification(
  //   appointment: IAppointment, 
  //   oldDate: Date
  // ): Promise<void> {
  //   logger.info(`Sending reschedule notification for appointment ${appointment._id}`);
  // }

  // private static async sendCancellationNotification(
  //   appointment: IAppointment,
  //   cancelledBy: string
  // ): Promise<void> {
  //   logger.info(`Sending cancellation notification for appointment ${appointment._id}`);
  // }

  // private static async sendStatusUpdateNotification(appointment: IAppointment): Promise<void> {
  //   logger.info(`Sending status update notification for appointment ${appointment._id}`);
  // }

  // private static async scheduleReminder(appointment: IAppointment): Promise<void> {
  //   // Would integrate with job queue (Bull, Agenda, etc.)
  //   logger.info(`Scheduling reminder for appointment ${appointment._id}`);
  // }
}