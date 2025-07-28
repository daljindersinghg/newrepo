// api/src/controllers/doctor.controller.ts
import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor.service';
import logger from '../config/logger.config';
import { IDoctor } from '../models';

export class DoctorController {
  /**
   * Create a new doctor (Admin only)
   */
  static async createDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doctorData: Partial<IDoctor> = req.body;
      
      // Validate required fields
      if (!doctorData.name || !doctorData.email || !doctorData.phone || !doctorData.password) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, email, phone, password'
        });
        return;
      }

      if (!doctorData.clinic) {
        res.status(400).json({
          success: false,
          message: 'Clinic selection is required'
        });
        return;
      }

      if (!doctorData.specialties || doctorData.specialties.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one specialty must be selected'
        });
        return;
      }
      
      const doctor = await DoctorService.createDoctor(doctorData);

      // Remove password from response
      const doctorResponse = doctor.toObject();
      delete doctorResponse.password;
      
      res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: doctorResponse
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      logger.error('Error creating doctor:', error);
      next(error);
    }
  }

  /**
   * Get doctor by ID
   */
  static async getDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const doctor = await DoctorService.getDoctorById(id);
      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      res.json({
        success: true,
        data: doctor
      });
    } catch (error) {
      logger.error('Error fetching doctor:', error);
      next(error);
    }
  }

  /**
   * Get all doctors with pagination
   */
  static async getDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const clinic = req.query.clinic as string;

      const filters = { search, status, clinic };
      const result = await DoctorService.getDoctors(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error fetching doctors:', error);
      next(error);
    }
  }

  /**
   * Get doctors by clinic ID
   */
  static async getDoctorsByClinic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await DoctorService.getDoctorsByClinic(clinicId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error fetching doctors by clinic:', error);
      next(error);
    }
  }

  /**
   * Update doctor
   */
  static async updateDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const doctor = await DoctorService.updateDoctor(id, updateData);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Doctor updated successfully',
        data: doctor
      });
    } catch (error) {
      logger.error('Error updating doctor:', error);
      next(error);
    }
  }

  /**
   * Delete doctor
   */
  static async deleteDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await DoctorService.deleteDoctor(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Doctor deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting doctor:', error);
      next(error);
    }
  }

  /**
   * Update doctor status
   */
  static async updateDoctorStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'pending', 'suspended'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, pending, or suspended'
        });
        return;
      }

      const doctor = await DoctorService.updateDoctorStatus(id, status);

      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Doctor status updated successfully',
        data: doctor
      });
    } catch (error) {
      logger.error('Error updating doctor status:', error);
      next(error);
    }
  }

  /**
   * Get available doctors for booking (public endpoint)
   */
  static async getAvailableDoctors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lat, lng, radius, specialty, date, insurance } = req.query;

      const filters: any = {};
      
      if (lat && lng) {
        filters.location = {
          lat: parseFloat(lat as string),
          lng: parseFloat(lng as string),
          radius: radius ? parseInt(radius as string) : 10000 // 10km default
        };
      }

      if (specialty) {
        filters.specialty = specialty as string;
      }

      if (date) {
        filters.date = new Date(date as string);
      }

      if (insurance) {
        filters.insuranceAccepted = Array.isArray(insurance) ? insurance : [insurance];
      }

      const doctors = await DoctorService.getAvailableDoctors(filters);

      res.json({
        success: true,
        data: {
          doctors,
          total: doctors.length
        }
      });
    } catch (error) {
      logger.error('Error fetching available doctors:', error);
      next(error);
    }
  }
}