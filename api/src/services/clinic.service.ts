// api/src/services/clinic.service.ts (Fixed version)
import { Clinic, IClinic } from '../models';
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

      return clinic;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Create clinic manually (original method, enhanced)
   */
  static async createClinic(clinicData: Partial<IClinic>): Promise<IClinic> {
    try {
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
          const mergedData = {
            ...googleData,
            ...clinicData,
            name: clinicData.name || googleData.name,
            email: clinicData.email!,
            services: clinicData.services || googleData.services,
            acceptedInsurance: clinicData.acceptedInsurance || googleData.acceptedInsurance,
            hours: { ...googleData.hours, ...clinicData.hours },
            lastGoogleSync: new Date(),
            syncEnabled: true
          };
          clinicData = mergedData;
        }
      } else if (clinicData.location?.coordinates) {
        // ADD THIS: Generate static map thumbnail for manual clinic creation (no Google Place data)
        // const googlePlacesService = new GooglePlacesService();
        const [lng, lat] = clinicData.location.coordinates;
        clinicData.thumbnail = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      }

      const clinic = new Clinic(clinicData);
      await clinic.save();

      return clinic;
    } catch (error: any) {
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

      return updatedClinic;
    } catch (error: any) {
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

      return { success, failed, errors };
    } catch (error: any) {
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
      throw error;
    }
  }

  /**
   * Get all clinics with pagination (existing method)
   */
  static  async getClinics(page: number = 1, limit: number = 10, filters: ClinicFilters = {}) {
    try {

      console.log("-----251")
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
        return clinic;
      }

      return clinic;
    } catch (error: any) {
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
        return true;
      }
      
      return false;
    } catch (error: any) {
      throw error;
    }
  }
}