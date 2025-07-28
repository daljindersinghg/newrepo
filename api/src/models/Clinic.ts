// apps/api/src/models/Clinic.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  services: string[];
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Clinic name is required'],
    trim: true
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
    }
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for email uniqueness
ClinicSchema.index({ email: 1 }, { unique: true });

// Auto-update updatedAt
ClinicSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IClinic>('Clinic', ClinicSchema);

