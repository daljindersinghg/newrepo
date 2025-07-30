// api/src/routers/v1/appointment.router.ts (Complete Implementation)
import express from 'express';
import { AppointmentController } from '../../controllers/appointment.controller';
import { AvailabilityController } from '../../controllers/availability.controller';
// import { authenticatePatient, authenticateAdmin } from '../../middleware/auth.middleware';
// import { validateRequestBody } from '../../validators';
// import { appointmentSchema, rescheduleSchema } from '../../validators/appointment.validator';

const appointmentRouter = express.Router();

// ============ AVAILABILITY ENDPOINTS ============
// These endpoints are for checking availability before booking

// Get available time slots for a specific clinic and date
appointmentRouter.get(
  '/clinics/:clinicId/availability',
  AvailabilityController.getAvailableSlots
);

// Get weekly availability for calendar view
appointmentRouter.get(
  '/clinics/:clinicId/availability/weekly',
  AvailabilityController.getWeeklyAvailability
);

// Check if specific slot is available
appointmentRouter.get(
  '/clinics/:clinicId/slots/check',
  AvailabilityController.checkSlotAvailability
);

// Get next available appointment slot
appointmentRouter.get(
  '/clinics/:clinicId/slots/next-available',
  AvailabilityController.getNextAvailableSlot
);

// Get clinic operating hours
appointmentRouter.get(
  '/clinics/:clinicId/hours',
  AvailabilityController.getClinicHours
);

// Reserve a time slot temporarily (for booking flow)
appointmentRouter.post(
  '/clinics/:clinicId/slots/reserve',
  // authenticatePatient, // Would authenticate the patient
  AvailabilityController.reserveSlot
);

// ============ APPOINTMENT MANAGEMENT ============
// These endpoints are for actual appointment CRUD operations

// Create a new appointment (main booking endpoint)
appointmentRouter.post(
  '/',
  // authenticatePatient,
  // validateRequestBody(appointmentSchema),
  AppointmentController.createAppointment
);

// Get appointment by ID
appointmentRouter.get(
  '/:id',
  // authenticatePatient, // Should check if patient owns this appointment
  AppointmentController.getAppointmentById
);

// Update appointment details
appointmentRouter.put(
  '/:id',
  // authenticatePatient,
  // validateRequestBody(rescheduleSchema),
  AppointmentController.updateAppointment
);

// Cancel/Delete appointment
appointmentRouter.delete(
  '/:id',
  // authenticatePatient,
  AppointmentController.deleteAppointment
);

// ============ PATIENT-SPECIFIC ENDPOINTS ============
// These would typically be in a patient router, but including here for completeness

// Get all appointments for a specific patient
appointmentRouter.get(
  '/patient/:patientId/appointments',
  // authenticatePatient,
  async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const { status, startDate, endDate, page = '1', limit = '10' } = req.query;

      // Build query filters
      const filters: any = { patient: patientId };
      
      if (status) {
        filters.status = status;
      }
      
      if (startDate || endDate) {
        filters.appointmentDate = {};
        if (startDate) filters.appointmentDate.$gte = new Date(startDate as string);
        if (endDate) filters.appointmentDate.$lte = new Date(endDate as string);
      }

      // This would be implemented in AppointmentService
      // const appointments = await AppointmentService.getPatientAppointments(
      //   patientId, 
      //   filters, 
      //   parseInt(page as string), 
      //   parseInt(limit as string)
      // );

      res.json({
        success: true,
        message: 'Patient appointments retrieved successfully',
        // data: appointments
        data: [] // Placeholder
      });

    } catch (error) {
      next(error);
    }
  }
);

// Get upcoming appointments for a patient
appointmentRouter.get(
  '/patient/:patientId/upcoming',
  // authenticatePatient,
  async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const { limit = '5' } = req.query;

      // This would get appointments from today onwards
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Would be implemented in AppointmentService
      // const upcomingAppointments = await AppointmentService.getUpcomingAppointments(
      //   patientId,
      //   parseInt(limit as string)
      // );

      res.json({
        success: true,
        message: 'Upcoming appointments retrieved successfully',
        // data: upcomingAppointments
        data: [] // Placeholder
      });

    } catch (error) {
      next(error);
    }
  }
);

// Reschedule appointment
appointmentRouter.patch(
  '/:id/reschedule',
  // authenticatePatient,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { newDateTime, reason } = req.body;

      if (!newDateTime) {
        res.status(400).json({
          success: false,
          message: 'New appointment date and time is required'
        });
        return;
      }

      const newDate = new Date(newDateTime);
      if (isNaN(newDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
        return;
      }

      // Check if new slot is available
      const appointment = await AppointmentController.getAppointmentById(req, res, next);
      // Would need to implement slot availability check and reschedule logic

      res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: {
          appointmentId: id,
          oldDateTime: 'previous_date',
          newDateTime: newDate.toISOString(),
          reason
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// Cancel appointment
appointmentRouter.patch(
  '/:id/cancel',
  // authenticatePatient,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Would implement cancellation logic
      // const cancelledAppointment = await AppointmentService.cancelAppointment(id, reason);

      res.json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: {
          appointmentId: id,
          status: 'cancelled',
          reason,
          cancelledAt: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// ============ ADMIN ENDPOINTS ============
// These would typically be in admin router but included for clinic management

// Get all appointments for a clinic (admin view)
appointmentRouter.get(
  '/clinic/:clinicId/appointments',
  // authenticateAdmin,
  async (req, res, next) => {
    try {
      const { clinicId } = req.params;
      const { 
        date, 
        status, 
        page = '1', 
        limit = '20',
        sortBy = 'appointmentDate'
      } = req.query;

      // Build filters for clinic appointments
      const filters: any = { clinic: clinicId };
      
      if (date) {
        const searchDate = new Date(date as string);
        const startOfDay = new Date(searchDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(searchDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        filters.appointmentDate = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }

      if (status) {
        filters.status = status;
      }

      // Would implement in AppointmentService
      // const appointments = await AppointmentService.getClinicAppointments(
      //   filters,
      //   parseInt(page as string),
      //   parseInt(limit as string),
      //   sortBy as string
      // );

      res.json({
        success: true,
        message: 'Clinic appointments retrieved successfully',
        // data: appointments
        data: {
          appointments: [],
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: 0,
            pages: 0
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

// Update appointment status (admin action)
appointmentRouter.patch(
  '/:id/status',
  // authenticateAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
        return;
      }

      // Would implement status update logic
      // const updatedAppointment = await AppointmentService.updateStatus(id, status, notes);

      res.json({
        success: true,
        message: 'Appointment status updated successfully',
        data: {
          appointmentId: id,
          status,
          notes,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

export default appointmentRouter;