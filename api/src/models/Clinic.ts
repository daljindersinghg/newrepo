// api/src/models/Clinic.ts (Updated for Phase 1)
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  
  // Authentication fields (NEW)
  password?: string; // Make optional since it's added later
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  
  // Active status for clinic
  active?: boolean;
  
  // Auth setup tracking (NEW)
  authSetup?: boolean;
  
  // Admin approval fields (NEW)
  isApproved?: boolean;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId; // ref: Admin
  
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
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
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
    required: false, // ✅ Make optional for Phase 1 (Google Places creation)
    unique: true,
    sparse: true, // ✅ Allow unique constraint with null values
    lowercase: true,
    trim: true
  },
  
  // Authentication fields (OPTIONAL - for future implementation)
  password: {
    type: String,
    required: false, // Make optional for now
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date
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

  // Active status for clinic management
  active: {
    type: Boolean,
    default: false,
    index: true // For efficient filtering
  },
  
  // Auth setup tracking (NEW)
  authSetup: {
    type: Boolean,
    default: false, // True when admin sets up email/password
    index: true
  },
  
  // Admin approval fields (NEW)
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
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
ClinicSchema.index({ location: '2dsphere' }); // Geospatial index
ClinicSchema.index({ email: 1 }, { unique: true }); // Unique constraint on email
ClinicSchema.index({ isApproved: 1, active: 1 }); // For approved and active clinics
ClinicSchema.index({ isEmailVerified: 1 }); // For email verification status

// Text index for full-text search
ClinicSchema.index({
  name: 'text',
  'locationDetails.formattedAddress': 'text',
  services: 'text',
  searchableAddress: 'text'
});

// Pre-save middleware to hash password
ClinicSchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare password
ClinicSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const Clinic = mongoose.model<IClinic>('Clinic', ClinicSchema);
export default Clinic;