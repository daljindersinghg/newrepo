// api/src/services/clinic.service.ts
import { Clinic, IClinic } from '../models';
import logger from '../config/logger.config';

interface ClinicFilters {
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  services?: string[];
  insurance?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters
  verified?: boolean;
}

interface LocationBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export class ClinicService {
  /**
   * Create a new clinic with enhanced location data
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

      // Validate location data if provided
      if (clinicData.locationDetails) {
        const { latitude, longitude } = clinicData.locationDetails;
        
        // Ensure location GeoJSON is properly formatted
        clinicData.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
      }

      const clinic = new Clinic(clinicData);
      await clinic.save();

      logger.info(`New clinic created: ${clinic._id} at ${clinic.locationDetails?.formattedAddress}`);
      return clinic;
    } catch (error: any) {
      logger.error('Error creating clinic:', error);
      throw error;
    }
  }

  /**
   * Get clinic by ID with location data
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
   * Find clinics near a specific location
   */
  static async findClinicsNearby(
    latitude: number, 
    longitude: number, 
    radiusInMeters: number = 10000,
    filters: Omit<ClinicFilters, 'latitude' | 'longitude' | 'radius'> = {}
  ) {
    try {
      // Build base query for location
      const query: any = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusInMeters
          }
        }
      };

      // Add additional filters
      if (filters.verified !== undefined) {
        query.isVerified = filters.verified;
      }

      if (filters.services && filters.services.length > 0) {
        query.services = { $in: filters.services };
      }

      if (filters.insurance && filters.insurance.length > 0) {
        query.acceptedInsurance = { $in: filters.insurance };
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const clinics = await Clinic.find(query)
        .sort({ rating: -1, reviewCount: -1 })
        .lean();

      // Add distance calculation to each clinic
      const clinicsWithDistance = clinics.map(clinic => {
        const distance = this.calculateDistance(
          latitude, longitude,
          clinic.location?.coordinates[1] || 0,
          clinic.location?.coordinates[0] || 0
        );
        
        return {
          ...clinic,
          distance: Math.round(distance), // Distance in meters
          distanceText: this.formatDistance(distance)
        };
      });

      logger.info(`Found ${clinicsWithDistance.length} clinics within ${radiusInMeters}m of [${latitude}, ${longitude}]`);
      
      return clinicsWithDistance;
    } catch (error: any) {
      logger.error('Error finding nearby clinics:', error);
      throw error;
    }
  }

  /**
   * Find clinics within a bounding box (for map view)
   */
  static async findClinicsInBounds(bounds: LocationBounds, filters: ClinicFilters = {}) {
    try {
      const query: any = {
        location: {
          $geoWithin: {
            $box: [
              [bounds.swLng, bounds.swLat], // Southwest corner
              [bounds.neLng, bounds.neLat]  // Northeast corner
            ]
          }
        }
      };

      // Add filters
      if (filters.verified !== undefined) {
        query.isVerified = filters.verified;
      }

      if (filters.services && filters.services.length > 0) {
        query.services = { $in: filters.services };
      }

      if (filters.insurance && filters.insurance.length > 0) {
        query.acceptedInsurance = { $in: filters.insurance };
      }

      const clinics = await Clinic.find(query)
        .sort({ rating: -1 })
        .lean();

      logger.info(`Found ${clinics.length} clinics in bounds`);
      return clinics;
    } catch (error: any) {
      logger.error('Error finding clinics in bounds:', error);
      throw error;
    }
  }

  /**
   * Search clinics with advanced filtering
   */
  static async searchClinics(page: number = 1, limit: number = 10, filters: ClinicFilters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      // Location-based search
      if (filters.latitude && filters.longitude) {
        const radiusInMeters = filters.radius || 50000; // Default 50km
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [filters.longitude, filters.latitude]
            },
            $maxDistance: radiusInMeters
          }
        };
      }

      // City/State search
      if (filters.city) {
        query['locationDetails.addressComponents.locality'] = new RegExp(filters.city, 'i');
      }
      
      if (filters.state) {
        query['locationDetails.addressComponents.administrativeAreaLevel1'] = new RegExp(filters.state, 'i');
      }

      if (filters.country) {
        query['locationDetails.addressComponents.country'] = new RegExp(filters.country, 'i');
      }

      // Text search
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Service filters
      if (filters.services && filters.services.length > 0) {
        query.services = { $in: filters.services };
      }

      // Insurance filters
      if (filters.insurance && filters.insurance.length > 0) {
        query.acceptedInsurance = { $in: filters.insurance };
      }

      // Verification filter
      if (filters.verified !== undefined) {
        query.isVerified = filters.verified;
      }

      // Execute query
      const [clinics, total] = await Promise.all([
        Clinic.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ 
            ...(filters.latitude && filters.longitude ? {} : { rating: -1, reviewCount: -1 })
          })
          .lean(),
        Clinic.countDocuments(query)
      ]);

      // Add distance if location provided
      let clinicsWithDistance = clinics;
      if (filters.latitude && filters.longitude) {
        clinicsWithDistance = clinics.map(clinic => {
          const distance = this.calculateDistance(
            filters.latitude!, filters.longitude!,
            clinic.location?.coordinates[1] || 0,
            clinic.location?.coordinates[0] || 0
          );
          
          return {
            ...clinic,
            distance: Math.round(distance),
            distanceText: this.formatDistance(distance)
          };
        });
      }

      return {
        clinics: clinicsWithDistance,
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
   * Get all clinics with pagination (existing method enhanced)
   */
  static async getClinics(page: number = 1, limit: number = 10, filters: ClinicFilters = {}) {
    return this.searchClinics(page, limit, filters);
  }

  /**
   * Update clinic
   */
  static async updateClinic(id: string, updateData: Partial<IClinic>): Promise<IClinic | null> {
    try {
      // If location details are being updated, ensure GeoJSON is updated too
      if (updateData.locationDetails) {
        const { latitude, longitude } = updateData.locationDetails;
        updateData.location = {
          type: 'Point',
          coordinates: [longitude, latitude]
        };
      }

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

  /**
   * Get clinics by city for quick filters
   */
  static async getClinicsByCity(city: string, state?: string) {
    try {
      const query: any = {
        'locationDetails.addressComponents.locality': new RegExp(city, 'i'),
        isVerified: true
      };

      if (state) {
        query['locationDetails.addressComponents.administrativeAreaLevel1'] = new RegExp(state, 'i');
      }

      const clinics = await Clinic.find(query)
        .sort({ rating: -1 })
        .lean();

      return clinics;
    } catch (error: any) {
      logger.error(`Error finding clinics in ${city}:`, error);
      throw error;
    }
  }

  /**
   * Get popular cities with clinic counts
   */
  static async getPopularCities(limit: number = 20) {
    try {
      const pipeline = [
        { $match: { isVerified: true } },
        {
          $group: {
            _id: {
              city: '$locationDetails.addressComponents.locality',
              state: '$locationDetails.addressComponents.administrativeAreaLevel1'
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        { $match: { '_id.city': { $ne: null } } },
        { $sort: { count: -1 as 1 | -1 } }, // Explicitly cast -1 to the expected type
        { $limit: limit }
      ];

      const cities = await Clinic.aggregate(pipeline);
      return cities.map(city => ({
        city: city._id.city,
        state: city._id.state,
        clinicCount: city.count,
        averageRating: Math.round(city.avgRating * 10) / 10
      }));
    } catch (error: any) {
      logger.error('Error getting popular cities:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Format distance for display
   */
  private static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)}km`;
    } else {
      return `${Math.round(meters / 1000)}km`;
    }
  }

  /**
   * Get clinic statistics for admin dashboard
   */
  static async getClinicStats() {
    try {
      const [
        totalClinics,
        verifiedClinics,
        clinicsByState,
        recentClinics,
        topRatedClinics
      ] = await Promise.all([
        Clinic.countDocuments({}),
        Clinic.countDocuments({ isVerified: true }),
        Clinic.aggregate([
          { $match: { isVerified: true } },
          {
            $group: {
              _id: '$locationDetails.addressComponents.administrativeAreaLevel1',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Clinic.countDocuments({ 
          createdAt: { 
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          } 
        }),
        Clinic.find({ isVerified: true, rating: { $gte: 4.5 } })
          .sort({ rating: -1, reviewCount: -1 })
          .limit(5)
          .lean()
      ]);

      return {
        totalClinics,
        verifiedClinics,
        verificationRate: Math.round((verifiedClinics / totalClinics) * 100),
        clinicsByState: clinicsByState.map(item => ({
          state: item._id || 'Unknown',
          count: item.count
        })),
        recentClinics,
        topRatedClinics
      };
    } catch (error: any) {
      logger.error('Error getting clinic statistics:', error);
      throw error;
    }
  }
}