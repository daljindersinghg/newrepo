import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  // Auth / profile
  name: string;
  email: string;
  phone?: string;
  password: string;

  // Patient-specific
  address?: string;
  insurance?: {
    provider?: string;
    policyNumber?: string;
  };
  referralCode?: string;
  referredBy?: string; // someone else's code

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema({
  // Auth / profile
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },

  // Patient-specific
  address: { type: String },
  insurance: {
    provider: { type: String },
    policyNumber: { type: String }
  },
  referralCode: { type: String, unique: true },
  referredBy: { type: String }, // someone else's code

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt
PatientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IPatient>('Patient', PatientSchema);
