import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IPatient extends Document {
  // Required fields (Step 1)
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;

  // Optional fields (Step 2)
  insuranceProvider?: string;
  
  // Address (can be added later)
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  // OTP fields for email verification
  emailOTP?: string;
  otpExpires?: Date;
  isEmailVerified: boolean;

  // Signup tracking
  signupStep: 1 | 2 | 'completed';
  signupCompletedAt?: Date;

  // Referral system
  referralCode?: string;
  referredBy?: string;

  // Status
  isActive: boolean;

  // Audit
  createdAt: Date;
  updatedAt: Date;

  // Methods
  generateEmailOTP(): string;
  isOTPValid(otp: string): boolean;
  generateReferralCode(): string;
}

const PatientSchema: Schema = new Schema({
  // Required fields (Step 1)
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(date: Date) {
        const today = new Date();
        const minAge = new Date();
        minAge.setFullYear(today.getFullYear() - 13); // Minimum age 13
        return date <= minAge && date >= new Date('1900-01-01');
      },
      message: 'Patient must be at least 13 years old and date cannot be before 1900'
    }
  },

  // Optional fields (Step 2)
  insuranceProvider: {
    type: String,
    trim: true,
    enum: {
      values: [
        'Blue Cross Blue Shield',
        'Aetna',
        'Cigna', 
        'MetLife',
        'Delta Dental',
        'Humana',
        'United Healthcare',
        'Guardian',
        'Aflac',
        'Principal',
        'No Insurance',
        'Other'
      ],
      message: 'Please select a valid insurance provider'
    }
  },

  // Address
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'United States' }
  },

  // OTP fields
  emailOTP: {
    type: String,
    select: false // Don't include in queries by default
  },
  otpExpires: {
    type: Date,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  // Signup tracking
  signupStep: {
    type: String,
    enum: [1, 2, 'completed'],
    default: 1
  },
  signupCompletedAt: {
    type: Date
  },

  // Referral system
  referralCode: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  referredBy: {
    type: String,
    trim: true
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Audit
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes
PatientSchema.index({ email: 1 }, { unique: true });
PatientSchema.index({ phone: 1 });
PatientSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
PatientSchema.index({ referredBy: 1 });
PatientSchema.index({ isActive: 1 });
PatientSchema.index({ signupStep: 1 });
PatientSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
PatientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate referral code if completing signup and none exists
  if (this.signupStep === 'completed' && !this.referralCode) {
    this.referralCode = (this as any).generateReferralCode();
  }
  
  // Set completion date when completing signup
  if (this.signupStep === 'completed' && !this.signupCompletedAt) {
    this.signupCompletedAt = new Date();
  }
  
  next();
});

// Instance method to generate email OTP
PatientSchema.methods.generateEmailOTP = function(): string {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP before storing
  this.emailOTP = crypto.createHash('sha256').update(otp).digest('hex');
  
  // Set expiration to 10 minutes from now
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  
  return otp; // Return plain OTP for sending via email
};

// Instance method to verify OTP
PatientSchema.methods.isOTPValid = function(otp: string): boolean {
  if (!this.emailOTP || !this.otpExpires) {
    return false;
  }
  
  // Check if OTP has expired
  if (this.otpExpires < new Date()) {
    return false;
  }
  
  // Hash the provided OTP and compare
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  return hashedOTP === this.emailOTP;
};

// Instance method to generate unique referral code
PatientSchema.methods.generateReferralCode = function(): string {
  const name = this.name.replace(/\s+/g, '').toLowerCase();
  const namePrefix = name.substring(0, 3);
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${namePrefix}${randomSuffix}`;
};

// Static method to find by referral code
PatientSchema.statics.findByReferralCode = function(code: string) {
  return this.findOne({ referralCode: code, isActive: true });
};

// Static method to find active patients
PatientSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to get signup statistics
PatientSchema.statics.getSignupStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$signupStep',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model<IPatient>('Patient', PatientSchema);
