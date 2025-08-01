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
  active?: boolean;
  authStatus?: string; // 'pending', 'setup', or undefined for all
}

interface CreateClinicFromGoogleData {
  placeId: string;
  email?: string; // ✅ Make email optional
  acceptedInsurance?: string[];
}

export class ClinicService {
  private static googlePlacesService = new GooglePlacesService();

  /**
   * Create clinic with Google Places auto-population (Phase 1)
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

      // Check if clinic already exists by email (only if email provided)
      // if (email) {
      //   const existingEmailClinic = await Clinic.findOne({ email });
      //   if (existingEmailClinic) {
      //     throw new Error('Clinic with this email already exists');
      //   }
      // }

      // Merge Google data with manual data
      const clinicData = {
        ...googleData,
        ...(email && { email }), // Only add email if provided
        acceptedInsurance, // Override with provided insurance
        // Phase 1 defaults (no authentication)
        authSetup: false,
        isApproved: false,
        active: false,
        isEmailVerified: false,
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
      // Note: Phone number is intentionally excluded to preserve manual updates
      const updateData = {
        // Update hours (most important for syncing)
        hours: googleData.hours,
        // Update website if changed (but NOT phone number)
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

      if (filters.active !== undefined) {
        query.active = filters.active;
      } else {
        // Default to show only active clinics (unless filtering by auth status)
        if (!filters.authStatus) {
          query.active = true;
        }
      }

      // Handle authentication status filtering
      if (filters.authStatus === 'pending') {
        // Clinics without authentication setup
        query.authSetup = { $ne: true };
      } else if (filters.authStatus === 'setup') {
        // Clinics with authentication setup
        query.authSetup = true;
      }
      // If authStatus is undefined, return all clinics

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
   * Toggle clinic active status
   */
  static async toggleClinicActiveStatus(id: string): Promise<IClinic | null> {
    try {
      const clinic = await Clinic.findById(id);
      if (!clinic) {
        throw new Error('Clinic not found');
      }

      clinic.active = !clinic.active;
      await clinic.save();

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

  // ============ PHASE 2: ADMIN AUTHENTICATION SETUP ============

  /**
   * Admin sets up authentication for a clinic (Phase 2)
   */
  static async setupClinicAuthentication(
    clinicId: string, 
    authData: {
      email: string;
      password: string;
    }
  ): Promise<IClinic> {
    try {
      const clinic = await Clinic.findById(clinicId).select('+password');
      if (!clinic) {
        throw new Error('Clinic not found');
      }

      if (clinic.authSetup) {
        throw new Error('Clinic authentication is already set up');
      }

      // Check if email is already used by another clinic
      const existingEmailClinic = await Clinic.findOne({ 
        email: authData.email,
        _id: { $ne: clinicId } // Exclude current clinic
      });
      if (existingEmailClinic) {
        throw new Error('Email is already used by another clinic');
      }

      // Update clinic with authentication credentials
      // Note: Password will be automatically hashed by the model's pre-save middleware
      clinic.email = authData.email;
      clinic.password = authData.password;
      // Set basic authentication status
      clinic.authSetup = true;
      clinic.active = true;
      clinic.isEmailVerified = false; // Will need to verify email later
      clinic.approvedAt = new Date();

      await clinic.save();
      
      // Return clinic without password
      return await Clinic.findById(clinicId).select('-password');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update clinic authentication credentials (admin can change email/password)
   */
  static async updateClinicAuth(
    clinicId: string,
    authData: {
      email?: string;
      password?: string;
    }
  ): Promise<IClinic> {
    try {
      const clinic = await Clinic.findById(clinicId).select('+password');
      if (!clinic) {
        throw new Error('Clinic not found');
      }

      if (!clinic.authSetup) {
        throw new Error('Clinic authentication is not set up yet');
      }

      // Check email uniqueness if email is being updated
      if (authData.email && authData.email !== clinic.email) {
        const existingEmailClinic = await Clinic.findOne({ 
          email: authData.email,
          _id: { $ne: clinicId }
        });
        if (existingEmailClinic) {
          throw new Error('Email is already used by another clinic');
        }
        clinic.email = authData.email;
        clinic.isEmailVerified = false; // Reset verification if email changed
      }

      // Update password if provided
      if (authData.password) {
        // Note: Password will be automatically hashed by the model's pre-save middleware
        clinic.password = authData.password;
      }

      await clinic.save();
      
      // Return clinic without password
      return await Clinic.findById(clinicId).select('-password');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Clinic login
   */
  static async loginClinic(email: string, password: string) {
    const clinic = await Clinic.findOne({ email }).select("+password");

    console.log('🚀 ~ :473 ~ ClinicService ~ loginClinic ~ clinic::==', clinic)

    if (!clinic) throw new Error("clinic not found");
    
    if (!clinic.authSetup) {
      throw new Error("clinic authentication is not set up");
    }
    
    const isMatchedPassword = await clinic.comparePassword(password);

    console.log('🚀 ~ :483 ~ ClinicService ~ loginClinic ~ isMatchedPassword::==', isMatchedPassword)

    if (!isMatchedPassword) {
      throw new Error("wrong password");
    }
    
    // Update last login
    clinic.lastLogin = new Date();
    await clinic.save();
    
    // Generate JWT token (we'll need to add this method to the clinic model)
    const token = await clinic.getJWTToken();
    
    // Return both token and clinic data (without password)
    const clinicData = {
      id: clinic._id,
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      services: clinic.services,
      authSetup: clinic.authSetup,
      isApproved: clinic.isApproved,
      active: clinic.active,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt
    };
    
    return { token, clinic: clinicData };
  }
}