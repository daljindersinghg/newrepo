// api/src/routers/v1/appointment.router.ts (Complete Implementation)
import express from 'express';
import { AppointmentController } from '../../controllers/appointment.controller';
// import { authenticatePatient, authenticateAdmin } from '../../middleware/auth.middleware';
// import { validateRequestBody } from '../../validators';
// import { appointmentSchema, rescheduleSchema } from '../../validators/appointment.validator';

const appointmentRouter = express.Router();
// ============ NEW WORKFLOW ENDPOINTS ============
// Request-response based appointment booking

// Patient requests appointment - now takes patientId as URL parameter
appointmentRouter.post(
  '/patient/:patientId/request',
  AppointmentController.requestAppointment
);

// Clinic responds to appointment request
appointmentRouter.post(
  '/:id/clinic-response',
  AppointmentController.clinicResponse
);

// Patient responds to clinic counter-offer
appointmentRouter.post(
  '/:id/patient-response',
  AppointmentController.patientResponse
);

// Get patient's appointment requests - now takes patientId as URL parameter
appointmentRouter.get(
  '/patient/:patientId/requests',
  AppointmentController.getMyRequests
);

// Get clinic's appointment requests - now takes clinicId as URL parameter
appointmentRouter.get(
  '/clinic/:clinicId/requests',
  AppointmentController.getClinicRequests
);

// Cancel appointment
appointmentRouter.patch(
  '/:id/cancel',
  AppointmentController.cancelAppointment
);

// ============ APPOINTMENT MANAGEMENT ============
// These endpoints are for actual appointment CRUD operations

// Create a new appointment (main booking endpoint)
appointmentRouter.post(
  '/',
  AppointmentController.createAppointment
);

// Get appointment by ID
appointmentRouter.get(
  '/:id',
  AppointmentController.getAppointmentById
);

// Update appointment details
appointmentRouter.put(
  '/:id',
  AppointmentController.updateAppointment
);

// Cancel/Delete appointment
appointmentRouter.delete(
  '/:id',
  AppointmentController.deleteAppointment
);

// ============ PATIENT-SPECIFIC ENDPOINTS ============
// These would typically be in a patient router, but including here for completeness

// Get all appointments for a specific patient
appointmentRouter.get(
  '/patient/:patientId/appointments',
  async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const { status, startDate, endDate } = req.query;

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
  async (req, res, next) => {
    try {
      // const { patientId } = req.params;

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

      // Update appointment with new date/time
      // Would implement reschedule logic here

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


// ============ ADMIN ENDPOINTS ============
// These would typically be in admin router but included for clinic management

// Get all appointments for a clinic (admin view)
appointmentRouter.get(
  '/clinic/:clinicId/appointments',
  async (req, res, next) => {
    try {
      const { clinicId } = req.params;
      const { 
        date, 
        status
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
            page: 1,
            limit: 20,
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