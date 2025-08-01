// api/src/controllers/availability.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AvailabilityService } from '../services/availability.service';
import logger from '../config/logger.config';

export class AvailabilityController {
  
  /**
   * Get available time slots for a specific clinic and date
   * GET /api/v1/clinics/:clinicId/availability?date=YYYY-MM-DD&duration=30&buffer=15
   */
  static async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = req.params;
      const { 
        date, 
        duration = '30', 
        buffer = '15', 
        includeBooked = 'false',
        maxAdvanceDays = '90'
      } = req.query;

      // Validate required parameters
      if (!date) {
        res.status(400).json({
          success: false,
          message: 'Date parameter is required (format: YYYY-MM-DD)'
        });
        return;
      }

      // Validate date format
      const requestDate = new Date(date as string);
      if (isNaN(requestDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
        return;
      }

      // Validate numeric parameters
      const serviceDuration = parseInt(duration as string);
      const bufferTime = parseInt(buffer as string);
      const maxDays = parseInt(maxAdvanceDays as string);

      if (isNaN(serviceDuration) || serviceDuration < 15 || serviceDuration > 240) {
        res.status(400).json({
          success: false,
          message: 'Duration must be between 15 and 240 minutes'
        });
        return;
      }

      if (isNaN(bufferTime) || bufferTime < 0 || bufferTime > 60) {
        res.status(400).json({
          success: false,
          message: 'Buffer time must be between 0 and 60 minutes'
        });
        return;
      }

      const options = {
        serviceDuration,
        bufferTime,
        includeUnavailable: includeBooked === 'true',
        maxAdvanceDays: maxDays
      };

      const availability = await AvailabilityService.getAvailableSlots(
        clinicId,
        requestDate,
        options
      );

      res.json({
        success: true,
        data: availability
      });

    } catch (error: any) {
      logger.error('Error getting available slots:', error);
      
      if (error.message.includes('not found') || error.message.includes('Cannot check availability')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message.includes('Cannot book more than')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      next(error);
    }
  }

  /**
   * Get weekly availability for a clinic
   * GET /api/v1/clinics/:clinicId/availability/weekly?startDate=YYYY-MM-DD&days=7
   */
  static async getWeeklyAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = req.params;
      const { 
        startDate, 
        days = '7',
        duration = '30',
        buffer = '15'
      } = req.query;

      let searchStartDate = new Date();
      
      if (startDate) {
        searchStartDate = new Date(startDate as string);
        if (isNaN(searchStartDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'Invalid startDate format. Use YYYY-MM-DD'
          });
          return;
        }
      }

      const numberOfDays = parseInt(days as string);
      if (isNaN(numberOfDays) || numberOfDays < 1 || numberOfDays > 31) {
        res.status(400).json({
          success: false,
          message: 'Days must be between 1 and 31'
        });
        return;
      }

      const serviceDuration = parseInt(duration as string);
      const bufferTime = parseInt(buffer as string);

      const options = {
        serviceDuration,
        bufferTime,
        includeUnavailable: false
      };

      const weeklyAvailability = await AvailabilityService.getWeeklyAvailability(
        clinicId,
        searchStartDate,
        numberOfDays,
        options
      );

      res.json({
        success: true,
        data: {
          startDate: searchStartDate.toISOString().split('T')[0],
          days: numberOfDays,
          availability: weeklyAvailability
        }
      });

    } catch (error: any) {
      logger.error('Error getting weekly availability:', error);
      next(error);
    }
  }

  /**
   * Check if a specific time slot is available
   * GET /api/v1/clinics/:clinicId/slots/check?datetime=YYYY-MM-DDTHH:mm:ss&duration=30
   */
  static async checkSlotAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = req.params;
      const { datetime, duration = '30' } = req.query;

      if (!datetime) {
        res.status(400).json({
          success: false,
          message: 'Datetime parameter is required (format: YYYY-MM-DDTHH:mm:ss)'
        });
        return;
      }

      const appointmentDate = new Date(datetime as string);
      if (isNaN(appointmentDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid datetime format. Use YYYY-MM-DDTHH:mm:ss'
        });
        return;
      }

      const serviceDuration = parseInt(duration as string);
      if (isNaN(serviceDuration) || serviceDuration < 15 || serviceDuration > 240) {
        res.status(400).json({
          success: false,
          message: 'Duration must be between 15 and 240 minutes'
        });
        return;
      }

      const isAvailable = await AvailabilityService.isSlotAvailable(
        clinicId,
        appointmentDate,
        serviceDuration
      );

      res.json({
        success: true,
        data: {
          clinicId,
          datetime: appointmentDate.toISOString(),
          duration: serviceDuration,
          available: isAvailable
        }
      });

    } catch (error: any) {
      logger.error('Error checking slot availability:', error);
      next(error);
    }
  }

  /**
   * Reserve a time slot temporarily
   * POST /api/v1/clinics/:clinicId/slots/reserve
   */
  static async reserveSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = req.params;
      const { datetime, duration = 30, patientId, reservationMinutes = 10 } = req.body;

      // Validate required fields
      if (!datetime || !patientId) {
        res.status(400).json({
          success: false,
          message: 'Datetime and patientId are required'
        });
        return;
      }

      const appointmentDate = new Date(datetime);
      if (isNaN(appointmentDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid datetime format'
        });
        return;
      }

      if (typeof duration !== 'number' || duration < 15 || duration > 240) {
        res.status(400).json({
          success: false,
          message: 'Duration must be between 15 and 240 minutes'
        });
        return;
      }

      const reservation = await AvailabilityService.reserveSlot(
        clinicId,
        appointmentDate,
        duration,
        patientId,
        reservationMinutes
      );

      if (!reservation) {
        res.status(409).json({
          success: false,
          message: 'Time slot is not available'
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Time slot reserved successfully',
        data: reservation
      });

    } catch (error: any) {
      logger.error('Error reserving slot:', error);
      next(error);
    }
  }

  /**
   * Get next available appointment slot
   * GET /api/v1/clinics/:clinicId/slots/next-available?duration=30&fromDate=YYYY-MM-DD
   */
  static async getNextAvailableSlot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = req.params;
      const { duration = '30', fromDate } = req.query;

      const serviceDuration = parseInt(duration as string);
      if (isNaN(serviceDuration) || serviceDuration < 15 || serviceDuration > 240) {
        res.status(400).json({
          success: false,
          message: 'Duration must be between 15 and 240 minutes'
        });
        return;
      }

      let startFromDate: Date | undefined;
      if (fromDate) {
        startFromDate = new Date(fromDate as string);
        if (isNaN(startFromDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'Invalid fromDate format. Use YYYY-MM-DD'
          });
          return;
        }
      }

      const nextSlot = await AvailabilityService.getNextAvailableSlot(
        clinicId,
        serviceDuration,
        startFromDate
      );

      if (!nextSlot) {
        res.json({
          success: true,
          message: 'No available slots found in the next 30 days',
          data: null
        });
        return;
      }

      res.json({
        success: true,
        data: nextSlot
      });

    } catch (error: any) {
      logger.error('Error getting next available slot:', error);
      next(error);
    }
  }

  /**
   * Get clinic operating hours for multiple days
   * GET /api/v1/clinics/:clinicId/hours?startDate=YYYY-MM-DD&days=7
   */
  static async getClinicHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = req.params;
      const { startDate, days = '7' } = req.query;

      let searchStartDate = new Date();
      if (startDate) {
        searchStartDate = new Date(startDate as string);
        if (isNaN(searchStartDate.getTime())) {
          res.status(400).json({
            success: false,
            message: 'Invalid startDate format. Use YYYY-MM-DD'
          });
          return;
        }
      }

      const numberOfDays = parseInt(days as string);
      if (isNaN(numberOfDays) || numberOfDays < 1 || numberOfDays > 31) {
        res.status(400).json({
          success: false,
          message: 'Days must be between 1 and 31'
        });
        return;
      }

      // Get basic availability info (just to check hours, no time slots)
      const weeklyAvailability = await AvailabilityService.getWeeklyAvailability(
        clinicId,
        searchStartDate,
        numberOfDays,
        { serviceDuration: 30, includeUnavailable: false }
      );

      // Extract just the hours information
      const hoursInfo = weeklyAvailability.map(day => ({
        date: day.date,
        isOpen: day.isOpen,
        hours: day.clinicHours
      }));

      res.json({
        success: true,
        data: hoursInfo
      });

    } catch (error: any) {
      logger.error('Error getting clinic hours:', error);
      next(error);
    }
  }
}
