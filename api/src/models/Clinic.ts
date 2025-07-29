// api/src/models/Clinic.ts
import mongoose, { Document, Schema } from 'mongoose';

interface LocationDetails {
  latitude: number;
  longitude: number;
  placeId: string;
  formattedAddress: string;
  email?:string
  thumbnail?: string;
  addressComponents: {
    streetNumber?: string;
    route?: string;
    locality?: string;
    administrativeAreaLevel1?: string;
    administrativeAreaLevel2?: string;
    country?: string;
    postalCode?: string;
  };
  viewport?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  businessInfo?: {
    businessStatus?: string;
    placeTypes?: string[];
    website?: string;
    phoneNumber?: string;
  };
}

export interface IClinic extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  services: string[];
  acceptedInsurance?: string[];
  thumbnail?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  
  // Enhanced location data for maps and search
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  
  // Detailed location information from Google Places
  locationDetails?: LocationDetails;
  
  // Searchable address components for filtering
  searchableAddress?: string[];
  
  // Additional metadata
  isVerified?: boolean;
  verificationDate?: Date;
  rating?: number;
  reviewCount?: number;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Clinic name is required'],
    trim: true,
    index: true // For text search
  },
  address: { 
    type: String, 
    required: [true, 'Address is required'],
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  thumbnail: { type: String },
  website: { 
    type: String,
    trim: true
  },
  services: {
    type: [String],
    required: [true, 'At least one service is required'],
    validate: {
      validator: function(services: string[]) {
        return services && services.length > 0;
      },
      message: 'At least one service must be selected'
    },
    index: true // For filtering by services
  },
  acceptedInsurance: {
    type: [String],
    default: []
  },
  hours: {
    monday: { type: String, default: 'Closed' },
    tuesday: { type: String, default: 'Closed' },
    wednesday: { type: String, default: 'Closed' },
    thursday: { type: String, default: 'Closed' },
    friday: { type: String, default: 'Closed' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },

  // GeoJSON Point for MongoDB geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coordinates: number[]) {
          return coordinates.length === 2 && 
                 coordinates[0] >= -180 && coordinates[0] <= 180 && // longitude
                 coordinates[1] >= -90 && coordinates[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format'
      }
    }
  },

  // Detailed location data from Google Places API
  locationDetails: {
    type: Object as () => LocationDetails,
    default: () => ({}),
  },

  // Array of searchable location terms for text search
  searchableAddress: {
    type: [String],
    index: true
  },

  // Verification and quality data
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationDate: { type: Date },
  rating: { 
    type: Number, 
    min: 0, 
    max: 5,
    default: 0
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },

  // Audit fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries

// Geospatial index for location-based searches (CRITICAL for map functionality)
ClinicSchema.index({ location: '2dsphere' });

// Compound indexes for common query patterns
ClinicSchema.index({ 
  'locationDetails.addressComponents.locality': 1, 
  'locationDetails.addressComponents.administrativeAreaLevel1': 1 
});

ClinicSchema.index({ 
  services: 1, 
  'locationDetails.addressComponents.locality': 1 
});

ClinicSchema.index({ 
  acceptedInsurance: 1, 
  'locationDetails.addressComponents.locality': 1 
});

// Text index for full-text search
ClinicSchema.index({
  name: 'text',
  'locationDetails.formattedAddress': 'text',
  services: 'text',
  searchableAddress: 'text'
});

// Unique constraint on email
ClinicSchema.index({ email: 1 }, { unique: true });

// Performance indexes
ClinicSchema.index({ isVerified: 1, rating: -1 }); // For verified clinics sorted by rating
ClinicSchema.index({ createdAt: -1 }); // For recent clinics

// Pre-save middleware
ClinicSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-populate searchableAddress from locationDetails
  //@ts-ignore
  if (this.locationDetails?.addressComponents) {
    //@ts-ignore
    const components = this.locationDetails.addressComponents;
    this.searchableAddress = [
      components.locality,
      components.administrativeAreaLevel1,
      components.administrativeAreaLevel2,
      components.postalCode,
      components.country
    ].filter(Boolean);
  }
  
  next();
});

// Static methods for geospatial queries

// Find clinics within a certain distance (in meters)
ClinicSchema.statics.findNearby = function(longitude: number, latitude: number, maxDistance: number = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isVerified: true
  });
};

// Find clinics within a bounding box
ClinicSchema.statics.findInBounds = function(
  swLng: number, swLat: number, 
  neLng: number, neLat: number
) {
  return this.find({
    location: {
      $geoWithin: {
        $box: [[swLng, swLat], [neLng, neLat]]
      }
    },
    isVerified: true
  });
};

// Find clinics by city/state
ClinicSchema.statics.findByLocation = function(city?: string, state?: string, country?: string) {
  const query: any = { isVerified: true };
  
  if (city) {
    query['locationDetails.addressComponents.locality'] = new RegExp(city, 'i');
  }
  if (state) {
    query['locationDetails.addressComponents.administrativeAreaLevel1'] = new RegExp(state, 'i');
  }
  if (country) {
    query['locationDetails.addressComponents.country'] = new RegExp(country, 'i');
  }
  
  return this.find(query);
};

// Instance methods

// Calculate distance to a point (returns distance in meters)
ClinicSchema.methods.distanceTo = function(longitude: number, latitude: number) {
  if (!this.location?.coordinates) return null;
  
  const [clinicLng, clinicLat] = this.location.coordinates;
  
  // Haversine formula
  const R = 6371000; // Earth's radius in meters
  const dLat = (latitude - clinicLat) * Math.PI / 180;
  const dLng = (longitude - clinicLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(clinicLat * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get formatted address components
ClinicSchema.methods.getFormattedLocation = function() {
  if (!this.locationDetails?.addressComponents) return this.address;
  
  const components = this.locationDetails.addressComponents;
  return {
    street: `${components.streetNumber || ''} ${components.route || ''}`.trim(),
    city: components.locality,
    state: components.administrativeAreaLevel1,
    country: components.country,
    zipCode: components.postalCode,
    full: this.locationDetails.formattedAddress || this.address
  };
};

export default mongoose.model<IClinic>('Clinic', ClinicSchema);