// api/src/services/clinic.service.ts (Fixed version)
import { Clinic, IClinic } from '../models';
import logger from '../config/logger.config';
import { GooglePlacesService } from './googlePlaces.service';

interface ClinicFilters {
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  services?: string[];
  insurance?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  verified?: boolean;
}

interface CreateClinicFromGoogleData {
  placeId: string;
  email: string;
  acceptedInsurance?: string[];
}

export class ClinicService {
  private static googlePlacesService = new GooglePlacesService();

  /**
   * Create clinic with Google Places auto-population
   */
  static async createClinicFromGooglePlace(
    { placeId, email, acceptedInsurance = [] }: CreateClinicFromGoogleData
  ): Promise<IClinic> {
    try {
      // Get auto-populated data from Google Places
      const googleData = await this.googlePlacesService.getClinicData(placeId);
      if (!googleData) {
        throw new Error('Could not fetch clinic data from Google Places');
      }

      // Check if clinic already exists by placeId
      const existingClinic = await Clinic.findOne({ 
        'locationDetails.placeId': placeId 
      });
      
      if (existingClinic) {
        throw new Error('Clinic with this Google Place ID already exists');
      }

      // Check if clinic already exists by email
      //@ts-ignore
      const existingEmailClinic = await Clinic.findOne({ email });
      if (existingEmailClinic) {
        throw new Error('Clinic with this email already exists');
      }

      // Merge Google data with manual data
      const clinicData = {
        ...googleData,
        email, // Override with provided email
        acceptedInsurance, // Override with provided insurance
        // Set verification date if auto-verified
        verificationDate: googleData.isVerified ? new Date() : undefined,
        // Add sync tracking
        lastGoogleSync: new Date(),
        syncEnabled: true
      };

      const clinic = new Clinic(clinicData);
      await clinic.save();

      logger.info(`Clinic created from Google Places: ${clinic._id} - ${clinic.name}`);
      return clinic;
    } catch (error: any) {
      logger.error('Error creating clinic from Google Places:', error);
      throw error;
    }
  }

  /**
   * Create clinic manually (original method, enhanced)
   */
  static async createClinic(clinicData: Partial<IClinic>): Promise<IClinic> {
    try {
      // Check if clinic already exists by email
      const existingClinic = await Clinic.findOne({ 
        email: clinicData.email 
      });
      
      if (existingClinic) {
        throw new Error('Clinic with this email already exists');
      }

      // If location details with placeId are provided, enhance with Google data
      if (clinicData.locationDetails?.placeId) {
        const googleData = await this.googlePlacesService.getClinicData(clinicData.locationDetails.placeId);
        if (googleData) {
          // Merge manual data with Google data, giving priority to manual data
          const mergedData = {
            ...googleData,
            ...clinicData,
            // Keep manual data priority for these fields
            name: clinicData.name || googleData.name,
            email: clinicData.email!, // Email is required
            services: clinicData.services || googleData.services,
            acceptedInsurance: clinicData.acceptedInsurance || googleData.acceptedInsurance,
            hours: { ...googleData.hours, ...clinicData.hours },
            // Add sync tracking if Google Place ID exists
            lastGoogleSync: new Date(),
            syncEnabled: true
          };
          clinicData = mergedData;
        }
      }

      const clinic = new Clinic(clinicData);
      await clinic.save();

      logger.info(`Clinic created: ${clinic._id} - ${clinic.name}`);
      return clinic;
    } catch (error: any) {
      logger.error('Error creating clinic:', error);
      throw error;
    }
  }

  /**
   * Sync clinic data with Google Places
   */
  static async syncClinicWithGooglePlaces(clinicId: string): Promise<IClinic | null> {
    try {
      const clinic = await Clinic.findById(clinicId);
      if (!clinic || !clinic.locationDetails?.placeId) {
        throw new Error('Clinic not found or has no Google Place ID');
      }

      const googleData = await this.googlePlacesService.getClinicData(clinic.locationDetails.placeId);
      if (!googleData) {
        throw new Error('Could not fetch updated data from Google Places');
      }

      // Update only specific fields that should be synced
      const updateData = {
        // Update hours (most important for syncing)
        hours: googleData.hours,
        // Update contact info if changed
        phone: googleData.phone || clinic.phone,
        website: googleData.website || clinic.website,
        // Update photos
        photos: googleData.photos,
        // Update rating and review count
        rating: googleData.rating,
        reviewCount: googleData.reviewCount,
        // Update business status
        'locationDetails.businessInfo.businessStatus': googleData.locationDetails.businessInfo?.businessStatus,
        // Update last sync timestamp
        lastGoogleSync: new Date()
      };

      const updatedClinic = await Clinic.findByIdAndUpdate(
        clinicId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      logger.info(`Clinic synced with Google Places: ${clinicId}`);
      return updatedClinic;
    } catch (error: any) {
      logger.error(`Error syncing clinic ${clinicId} with Google Places:`, error);
      throw error;
    }
  }

  /**
   * Bulk sync all clinics with Google Places data
   */
  static async bulkSyncClinics(): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const clinics = await Clinic.find({
        'locationDetails.placeId': { $exists: true, $ne: null }
      });

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const clinic of clinics) {
        try {
   await this.syncClinicWithGooglePlaces(clinic._id as string);
          success++;
          
          // Add delay to respect Google API rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          failed++;
          errors.push(`${clinic.name}: ${error.message}`);
        }
      }

      logger.info(`Bulk sync completed: ${success} success, ${failed} failed`);
      return { success, failed, errors };
    } catch (error: any) {
      logger.error('Error in bulk sync:', error);
      throw error;
    }
  }

  /**
   * Search Google Places for potential clinics
   */
  static async searchGooglePlacesForClinics(query: string, location?: { lat: number; lng: number }) {
    try {
      const results = await this.googlePlacesService.searchPlaces(query, location);
      
      // Filter for likely dental practices
      const dentalResults = results.filter((place: any) => {
        const name = place.name.toLowerCase();
        const isDental = name.includes('dental') || 
                        name.includes('dentist') || 
                        name.includes('orthodontic') ||
                        name.includes('oral');
        return isDental;
      });

      return dentalResults;
    } catch (error: any) {
      logger.error('Error searching Google Places for clinics:', error);
      throw error;
    }
  }

  /**
   * Get clinic by ID (existing method)
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
   * Get all clinics with pagination (existing method)
   */
  static async getClinics(page: number = 1, limit: number = 10, filters: ClinicFilters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      // Build query based on filters
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.verified !== undefined) {
        query.isVerified = filters.verified;
      }

      if (filters.services && filters.services.length > 0) {
        query.services = { $in: filters.services };
      }

      const [clinics, total] = await Promise.all([
        Clinic.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ rating: -1, reviewCount: -1 })
          .lean(),
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
      logger.error('Error searching clinics:', error);
      throw error;
    }
  }

  /**
   * Update clinic (existing method)
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
   * Delete clinic (existing method)
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