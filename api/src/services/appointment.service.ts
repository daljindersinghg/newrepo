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

interface CreateAppointmentData {
  patient: string;
  clinic: string;
  appointmentDate: Date;
  duration?: number;
  type?: 'consultation' | 'cleaning' | 'procedure' | 'emergency' | 'follow-up';
  reason?: string;
  requestedTime?: string;
}

export class AppointmentService {
  
  /**
   * Create a new appointment (request-based)
   */
  static async createAppointment(appointmentData: CreateAppointmentData): Promise<IAppointment> {
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
        patient: appointmentData.patient,
        clinic: appointmentData.clinic,
        appointmentDate: appointmentData.appointmentDate,
        duration: appointmentData.duration || 30,
        type: appointmentData.type || 'consultation',
        status: 'pending',
        originalRequest: {
          requestedDate: appointmentData.appointmentDate,
          requestedTime: appointmentData.requestedTime || '09:00',
          duration: appointmentData.duration || 30,
          reason: appointmentData.reason || 'General consultation',
          requestedAt: new Date()
        }
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
   * Update appointment status
   */
  static async updateStatus(
    appointmentId: string,
    status: string,
    notes?: string,
    additionalData?: Partial<IAppointment>
  ): Promise<IAppointment> {
    try {
      const validStatuses = ['pending', 'counter-offered', 'confirmed', 'rejected', 'cancelled', 'completed'];
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

  // New workflow methods
  
  /**
   * Create appointment request (new workflow)
   */
  static async createAppointmentRequest(requestData: {
    patient: string;
    clinic: string;
    requestedDate: Date;
    requestedTime: string;
    duration: number;
    type: string;
    reason: string;
  }): Promise<IAppointment> {
    try {
      const appointment = new Appointment({
        patient: requestData.patient,
        clinic: requestData.clinic,
        appointmentDate: requestData.requestedDate,
        duration: requestData.duration,
        type: requestData.type,
        status: 'pending',
        originalRequest: {
          requestedDate: requestData.requestedDate,
          requestedTime: requestData.requestedTime,
          duration: requestData.duration,
          reason: requestData.reason,
          requestedAt: new Date()
        },
        clinicResponses: [],
        patientResponses: [],
        messages: []
      });

      await appointment.save();
      await appointment.populate(['patient', 'clinic']);
      
      logger.info(`Appointment request created: ${appointment._id}`);
      return appointment;
    } catch (error: any) {
      logger.error('Error creating appointment request:', error);
      throw error;
    }
  }

  /**
   * Clinic responds to appointment request
   */
  static async clinicResponse(
    appointmentId: string,
    responseData: {
      responseType: 'counter-offer' | 'confirmation' | 'rejection';
      proposedDate?: Date;
      proposedTime?: string;
      proposedDuration?: number;
      message: string;
      respondedBy: string;
    }
  ): Promise<IAppointment> {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Add clinic response
      appointment.clinicResponses.push({
        responseType: responseData.responseType,
        proposedDate: responseData.proposedDate,
        proposedTime: responseData.proposedTime,
        proposedDuration: responseData.proposedDuration,
        message: responseData.message,
        respondedAt: new Date(),
        respondedBy: responseData.respondedBy as any
      });

      // Update appointment status
      if (responseData.responseType === 'confirmation') {
        appointment.status = 'confirmed';
        appointment.confirmedDetails = {
          finalDate: appointment.appointmentDate,
          finalTime: appointment.originalRequest.requestedTime,
          finalDuration: appointment.duration,
          confirmedAt: new Date(),
          confirmedBy: 'clinic'
        };
      } else if (responseData.responseType === 'counter-offer') {
        appointment.status = 'counter-offered';
        // Update appointment details with proposed changes
        if (responseData.proposedDate) appointment.appointmentDate = responseData.proposedDate;
        if (responseData.proposedDuration) appointment.duration = responseData.proposedDuration;
      } else if (responseData.responseType === 'rejection') {
        appointment.status = 'rejected';
      }

      await appointment.save();
      await appointment.populate(['patient', 'clinic']);
      
      logger.info(`Clinic response added to appointment ${appointmentId}: ${responseData.responseType}`);
      return appointment;
    } catch (error: any) {
      logger.error('Error processing clinic response:', error);
      throw error;
    }
  }

  /**
   * Patient responds to clinic counter-offer
   */
  static async patientResponse(
    appointmentId: string,
    responseData: {
      responseType: 'accept' | 'reject' | 'counter';
      message?: string;
    }
  ): Promise<IAppointment> {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Add patient response
      appointment.patientResponses.push({
        responseType: responseData.responseType,
        message: responseData.message,
        respondedAt: new Date()
      });

      // Update appointment status
      if (responseData.responseType === 'accept') {
        appointment.status = 'confirmed';
        appointment.confirmedDetails = {
          finalDate: appointment.appointmentDate,
          finalTime: appointment.originalRequest.requestedTime,
          finalDuration: appointment.duration,
          confirmedAt: new Date(),
          confirmedBy: 'patient'
        };
      } else if (responseData.responseType === 'reject') {
        appointment.status = 'rejected';
      } else if (responseData.responseType === 'counter') {
        appointment.status = 'counter-offered';
      }

      await appointment.save();
      await appointment.populate(['patient', 'clinic']);
      
      logger.info(`Patient response added to appointment ${appointmentId}: ${responseData.responseType}`);
      return appointment;
    } catch (error: any) {
      logger.error('Error processing patient response:', error);
      throw error;
    }
  }

  /**
   * Get patient's appointment requests
   */
  static async getPatientRequests(patientId: string): Promise<IAppointment[]> {
    try {
      const appointments = await Appointment.find({
        patient: patientId,
        status: { $in: ['pending', 'counter-offered', 'confirmed'] }
      })
        .populate('clinic', 'name address phone email')
        .sort({ lastActivityAt: -1 })
        .lean();

      return appointments;
    } catch (error: any) {
      logger.error('Error fetching patient requests:', error);
      throw error;
    }
  }

  /**
   * Get clinic's appointment requests
   */
  static async getClinicRequests(clinicId: string): Promise<IAppointment[]> {
    try {
      const appointments = await Appointment.find({
        clinic: clinicId,
        status: { $in: ['pending', 'counter-offered', 'confirmed'] }
      })
        .populate('patient', 'name email phone')
        .sort({ lastActivityAt: -1 })
        .lean();

      return appointments;
    } catch (error: any) {
      logger.error('Error fetching clinic requests:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment (enhanced for new workflow)
   */
  static async cancelAppointment(appointmentId: string, reason?: string): Promise<IAppointment> {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      appointment.status = 'cancelled';
      if (reason) {
        appointment.notes = `${appointment.notes || ''}\nCancellation reason: ${reason}`.trim();
      }

      await appointment.save();
      await appointment.populate(['patient', 'clinic']);
      
      logger.info(`Appointment ${appointmentId} cancelled`);
      return appointment;
    } catch (error: any) {
      logger.error('Error cancelling appointment:', error);
      throw error;
    }
  }
}