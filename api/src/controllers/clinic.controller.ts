import { Request, Response, NextFunction } from 'express';
import { ClinicService } from '../services/clinic.service';
import logger from '../config/logger.config';
import { IClinic } from '../models';

export class ClinicController {
  /**
   * Create a new clinic (Admin only)
   */
  static async createClinic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clinicData: Partial<IClinic> = req.body;
      
      // Validate required fields
      if (!clinicData.name || !clinicData.address || !clinicData.phone || !clinicData.email) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: name, address, phone, email'
        });
        return;
      }

      if (!clinicData.services || clinicData.services.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one service must be selected'
        });
        return;
      }
      
      const clinic = await ClinicService.createClinic(clinicData);
      
      res.status(201).json({
        success: true,
        message: 'Clinic created successfully',
        data: clinic
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      logger.error('Error creating clinic:', error);
      next(error);
    }
  }

  /**
   * Get clinic by ID
   */
  static async getClinic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const clinic = await ClinicService.getClinicById(id);
      if (!clinic) {
        res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
        return;
      }

      res.json({
        success: true,
        data: clinic
      });
    } catch (error) {
      logger.error('Error fetching clinic:', error);
      next(error);
    }
  }

  /**
   * Get all clinics with pagination
   */
  static async getClinics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const filters = { search };
      const result = await ClinicService.getClinics(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error fetching clinics:', error);
      next(error);
    }
  }

  /**
   * Update clinic
   */
  static async updateClinic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const clinic = await ClinicService.updateClinic(id, updateData);

      if (!clinic) {
        res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Clinic updated successfully',
        data: clinic
      });
    } catch (error) {
      logger.error('Error updating clinic:', error);
      next(error);
    }
  }

  /**
   * Delete clinic
   */
  static async deleteClinic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await ClinicService.deleteClinic(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Clinic deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting clinic:', error);
      next(error);
    }
  }
}