// api/src/services/appointment.service.ts (Fixed - Remove reminder fields)
import { Appointment, IAppointment, Clinic, Patient } from "../models";
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
   * Create a new appointment (request-based)
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

      // Create the appointment request
      const appointment = await Appointment.create([{
        ...appointmentData,
        status: 'requested',
        requestedDate: new Date(),
        requestedReason: appointmentData.reason || 'General consultation'
      }], { session });

      await session.commitTransaction();

      logger.info(`Appointment request created: ${appointment[0]._id} for patient ${appointmentData.patient}`);
      
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
   * Update appointment
   */
  static async updateAppointment(appointmentId: string, updateData: Partial<IAppointment>): Promise<IAppointment | null> {
    try {
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        updateData,
        { new: true, runValidators: true }
      );
      return updatedAppointment;
    } catch (error: any) {
      throw error;
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
      const validStatuses = ['requested', 'pending', 'counter-offered', 'confirmed', 'rejected', 'cancelled', 'completed'];
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
        status: { $in: ['confirmed', 'counter-offered'] }
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
}