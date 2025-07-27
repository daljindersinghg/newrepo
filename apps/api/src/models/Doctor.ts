// apps/api/src/models/Doctor.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IDoctor extends Document {
  // Auth / profile
  name: string;
  email: string;
  phone: string;
  password: string;

  // Doctor-specific
  clinic: mongoose.Types.ObjectId;
  specialties: string[];
  bio?: string;
  
  // Status fields
  status: 'active' | 'pending' | 'suspended';
  verified: boolean;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(password: string): Promise<boolean>;
}

const DoctorSchema: Schema = new Schema({
  // Auth / profile
  name: { 
    type: String, 
    required: [true, 'Doctor name is required'],
    trim: true
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
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Doctor-specific
  clinic: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Clinic', 
    required: [true, 'Clinic selection is required']
  },
  specialties: {
    type: [String],
    required: [true, 'At least one specialty is required'],
    validate: {
      validator: function(specialties: string[]) {
        return specialties && specialties.length > 0;
      },
      message: 'At least one specialty must be selected'
    }
  },
  bio: { 
    type: String,
    trim: true
  },
  
  // Status
  status: { 
    type: String, 
    enum: {
      values: ['active', 'pending', 'suspended'],
      message: 'Status must be active, pending, or suspended'
    },
    default: 'pending' 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
DoctorSchema.index({ email: 1 }, { unique: true });
DoctorSchema.index({ clinic: 1 });
DoctorSchema.index({ status: 1 });

// Hash password before saving
DoctorSchema.pre('save', async function(this: IDoctor, next) {
  this.updatedAt = new Date();
  
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
DoctorSchema.methods.comparePassword = async function(password: string) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);