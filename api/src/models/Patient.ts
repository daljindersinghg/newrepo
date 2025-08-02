// api/src/models/Patient.ts
import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IPatient extends Document {
  // Required fields (Step 2)
  name?: string;  // Optional during step 1
  email: string;  // Always required
  phone?: string; // Optional during step 1
  dateOfBirth?: Date; // Optional during step 1

  // Optional fields (Step 2)
  insuranceProvider?: string;
  
  // OTP fields for email verification
  emailOTP?: string;
  otpExpires?: Date;
  otpAttempts?: number;
  isEmailVerified: boolean;

  // Signup tracking
  signupStep: 1 | 2 | 'completed';
  signupCompletedAt?: Date;



  // Audit
  createdAt: Date;
  updatedAt: Date;

  // Methods
  generateEmailOTP(): string;
  isOTPValid(otp: string): boolean;
}

const PatientSchema: Schema = new Schema({
  // Optional fields during step 1, required during step 2+
  name: { 
    type: String, 
    required: false,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: false,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: false
  },

  // Optional fields (Step 2)
  insuranceProvider: {
    type: String,
    trim: true
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
  otpAttempts: {
    type: Number,
    default: 0,
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

PatientSchema.index({ signupStep: 1 });
PatientSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps and validate business rules
PatientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Business logic validation for step 2 and completed
  if (this.signupStep === 2 || this.signupStep === 'completed') {
    if (!this.name || !this.phone || !this.dateOfBirth) {
      return next(new Error('Name, phone, and date of birth are required for completing signup'));
    }
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
  
  // Reset attempts counter
  this.otpAttempts = 0;
  
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
  
  // Increment attempts
  this.otpAttempts = (this.otpAttempts || 0) + 1;
  
  // Check if too many attempts
  if (this.otpAttempts > 5) {
    return false;
  }
  
  // Hash the provided OTP and compare
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  return hashedOTP === this.emailOTP;
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