import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/appointment.service";
import { NotificationService } from "../services/notification.service";
import logger from "../config/logger.config";

export class AppointmentController {
  static async createAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentData: any = req.body;
      const newAppointment =
        await AppointmentService.createAppointment(appointmentData);
      res.status(201).json(newAppointment);
    } catch (error) {
      logger.error("Error creating appointment:", error);
      next(error);
    }
  }

  static async getAppointmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      const appointment =
        await AppointmentService.getAppointmentById(appointmentId);
      res.status(200).json(appointment);
    } catch (error) {
      logger.error("Error fetching appointment:", error);
      next(error);
    }
  }

  static async updateAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      const updateData: any = req.body;
      const updatedAppointment = await AppointmentService.updateAppointment(
        appointmentId,
        updateData
      );
      res.status(200).json(updatedAppointment);
    } catch (error) {
      logger.error("Error updating appointment:", error);
      next(error);
    }
  }

  static async deleteAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      await AppointmentService.deleteAppointment(appointmentId);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting appointment:", error);
      next(error);
    }
  }

  // New workflow endpoints
  static async requestAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const patientId = req.params.patientId; // Get from URL parameter
      const { clinicId, requestedDate, requestedTime, duration, type, reason } = req.body;

      
      const appointmentRequest = await AppointmentService.createAppointmentRequest({
        patient: patientId,
        clinic: clinicId,
        requestedDate,
        requestedTime,
        duration,
        type,
        reason
      });

      // Send notification to clinic
      await NotificationService.sendAppointmentRequest(appointmentRequest);

      res.status(201).json({
        success: true,
        appointment: appointmentRequest,
        message: 'Appointment request sent successfully'
      });
    } catch (error) {
      logger.error("Error creating appointment request:", error);
      next(error);
    }
  }

  static async clinicResponse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      const { responseType, proposedDate, proposedTime, proposedDuration, message } = req.body;
      const clinicId = (req as any).clinicId; // From clinic auth middleware
      
      const updatedAppointment = await AppointmentService.clinicResponse(
        appointmentId,
        {
          responseType,
          proposedDate,
          proposedTime,
          proposedDuration,
          message,
          respondedBy: clinicId
        }
      );

      // Send notification to patient
      await NotificationService.sendClinicResponse(updatedAppointment);

      res.status(200).json({
        success: true,
        appointment: updatedAppointment,
        message: 'Response sent successfully'
      });
    } catch (error) {
      logger.error("Error processing clinic response:", error);
      next(error);
    }
  }

  static async patientResponse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      const { responseType, message } = req.body;
      
      const updatedAppointment = await AppointmentService.patientResponse(
        appointmentId,
        {
          responseType,
          message
        }
      );

      // Send notification to clinic if needed
      if (responseType === 'counter') {
        await NotificationService.sendPatientCounter(updatedAppointment);
      }

      res.status(200).json({
        success: true,
        appointment: updatedAppointment,
        message: 'Response sent successfully'
      });
    } catch (error) {
      logger.error("Error processing patient response:", error);
      next(error);
    }
  }

  static async getMyRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const patientId = req.params.patientId; // Get from URL parameter
      const appointments = await AppointmentService.getPatientRequests(patientId);
      
      res.status(200).json({
        success: true,
        appointments
      });
    } catch (error) {
      logger.error("Error fetching patient requests:", error);
      next(error);
    }
  }

  static async getClinicRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const clinicId = req.params.clinicId; // Get from URL parameter
      const appointments = await AppointmentService.getClinicRequests(clinicId);
      
      res.status(200).json({
        success: true,
        appointments
      });
    } catch (error) {
      logger.error("Error fetching clinic requests:", error);
      next(error);
    }
  }

  static async cancelAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      const { reason } = req.body;
      
      const cancelledAppointment = await AppointmentService.cancelAppointment(
        appointmentId,
        reason
      );

      // Send cancellation notification
      await NotificationService.sendCancellation(cancelledAppointment);

      res.status(200).json({
        success: true,
        appointment: cancelledAppointment,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      logger.error("Error cancelling appointment:", error);
      next(error);
    }
  }
}
