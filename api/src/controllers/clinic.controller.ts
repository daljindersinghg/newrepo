// api/src/controllers/clinic.controller.ts (Enhanced)
import { Request, Response, NextFunction } from 'express';
import { ClinicService } from '../services/clinic.service';
import logger from '../config/logger.config';
import { IClinic } from '../models';


export class ClinicController {
  /**
   * Create clinic from Google Place ID (NEW - minimal input required)
   */
  static async createClinicFromGooglePlace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { placeId, email, acceptedInsurance } = req.body;
      
      if (!placeId) {
        res.status(400).json({
          success: false,
          message: 'Google Place ID is required'
        });
        return;
      }

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
        return;
      }

      // Create clinic with minimal manual input
   const clinic = await ClinicService.createClinicFromGooglePlace({
        placeId,
        email,
        acceptedInsurance: acceptedInsurance || []
      });
      
      res.status(201).json({
        success: true,
        message: 'Clinic created successfully from Google Places',
        data: clinic
      });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      logger.error('Error creating clinic from Google Places:', error);
      next(error);
    }
  }


  /**
   * Search Google Places for clinics (NEW)
   */
  static async searchGooglePlaces(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, lat, lng } = req.query;
      
      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const location = lat && lng ? { 
        lat: parseFloat(lat as string), 
        lng: parseFloat(lng as string) 
      } : undefined;

      const results = await ClinicService.searchGooglePlacesForClinics(
        query as string, 
        location
      );
      
      res.json({
        success: true,
        data: results
      });
    } catch (error: any) {
      logger.error('Error searching Google Places:', error);
      next(error);
    }
  }

  /**
   * Sync clinic with Google Places (NEW)
   */
  static async syncClinicWithGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const clinic = await ClinicService.syncClinicWithGooglePlaces(id);
      
      if (!clinic) {
        res.status(404).json({
          success: false,
          message: 'Clinic not found or cannot be synced'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Clinic synced successfully with Google Places',
        data: clinic
      });
    } catch (error: any) {
      logger.error('Error syncing clinic with Google Places:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bulk sync all clinics (NEW)
   */
  static async bulkSyncClinics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ClinicService.bulkSyncClinics();
      
      res.json({
        success: true,
        message: 'Bulk sync completed',
        data: result
      });
    } catch (error: any) {
      logger.error('Error in bulk sync:', error);
      next(error);
    }
  }

  /**
   * Create a new clinic (EXISTING - enhanced)
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
      
      // Use enhanced creation method that can leverage Google Places data
      const clinic = await ClinicService.createClinic(clinicData);
      
      res.status(201).json({
        success: true,
        message: 'Clinic created successfully',
        data: clinic
      });
    } catch (error) {
      // if (error instanceof Error && error.message.includes('already exists')) {
      //   res.status(400).json({
      //     success: false,
      //     message: error.message
      //   });
      //   return;
      // }
      

      next(error);
    }
  }

  // ... keep all your existing methods (getClinic, getClinics, updateClinic, deleteClinic)

  /**
   * Get clinic by ID (EXISTING)
   */
  static async getClinic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      console.log(id)
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


 static async getClinics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
  
  
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const active = req.query.active ? req.query.active === 'true' : undefined;

      const filters = { search, active };
      const result = await ClinicService.getClinics(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.log(Error)

      next(error);
    }
  }

  /**
   * Update clinic (EXISTING)
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
   * Delete clinic (EXISTING)
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

  /**
   * Toggle clinic active status
   */
  static async toggleClinicActiveStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const clinic = await ClinicService.toggleClinicActiveStatus(id);

      if (!clinic) {
        res.status(404).json({
          success: false,
          message: 'Clinic not found'
        });
        return;
      }

      res.json({
        success: true,
        message: `Clinic ${clinic.active ? 'activated' : 'deactivated'} successfully`,
        data: clinic
      });
    } catch (error) {
      logger.error('Error toggling clinic active status:', error);
      next(error);
    }
  }
}