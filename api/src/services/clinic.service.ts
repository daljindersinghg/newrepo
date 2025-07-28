// apps/api/src/services/clinic.service.ts
import { Clinic, IClinic } from '../models';
import logger from '../config/logger.config';

interface ClinicFilters {
  search?: string;
}

export class ClinicService {
  /**
   * Create a new clinic
   */
  static async createClinic(clinicData: Partial<IClinic>): Promise<IClinic> {
    try {
      // Check if clinic already exists
      const existingClinic = await Clinic.findOne({ 
        email: clinicData.email 
      });
      
      if (existingClinic) {
        throw new Error('Clinic with this email already exists');
      }

      // Create new clinic - don't try to extract geo coordinates for now
      const clinicToCreate = {
        name: clinicData.name,
        address: clinicData.address,
        phone: clinicData.phone,
        email: clinicData.email,
        website: clinicData.website,
        services: clinicData.services || []
      };

      const clinic = new Clinic(clinicToCreate);
      await clinic.save();

      logger.info(`New clinic created: ${clinic._id}`);
      return clinic;
    } catch (error: any) {
      logger.error('Error creating clinic:', error);
      throw error;
    }
  }

  /**
   * Get clinic by ID
   */
  static async getClinicById(id: string): Promise<IClinic | null> {
    try {
      const clinic = await Clinic.findById(id);
      return clinic;
    } catch (error: any) {
      logger.error(`Error fetching clinic ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all clinics with filters and pagination
   */
  static async getClinics(page: number = 1, limit: number = 10, filters: ClinicFilters = {}) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = {};
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { address: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const [clinics, total] = await Promise.all([
        Clinic.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Clinic.countDocuments(query)
      ]);

      return {
        clinics,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      logger.error('Error fetching clinics:', error);
      throw error;
    }
  }

  /**
   * Update clinic
   */
  static async updateClinic(id: string, updateData: Partial<IClinic>): Promise<IClinic | null> {
    try {
      const clinic = await Clinic.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (clinic) {
        logger.info(`Clinic updated: ${id}`);
      }

      return clinic;
    } catch (error: any) {
      logger.error(`Error updating clinic ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete clinic
   */
  static async deleteClinic(id: string): Promise<boolean> {
    try {
      const clinic = await Clinic.findByIdAndDelete(id);
      
      if (clinic) {
        logger.info(`Clinic deleted: ${id}`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error(`Error deleting clinic ${id}:`, error);
      throw error;
    }
  }
}