import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  
  appointmentDate: Date;
  duration: number; // in minutes
  
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'consultation' | 'cleaning' | 'procedure' | 'emergency' | 'follow-up';
  
  notes?: string;
  reason?: string;
  
  // Insurance and payment
  insuranceClaim?: {
    claimNumber?: string;
    approved?: boolean;
    coverageAmount?: number;
  };
  
  estimatedCost?: number;
  actualCost?: number;
  
  // Reminders
  reminderSent?: boolean;
  reminderDate?: Date;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  
  appointmentDate: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // default 30 minutes
  
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: { 
    type: String, 
    enum: ['consultation', 'cleaning', 'procedure', 'emergency', 'follow-up'],
    required: true
  },
  
  notes: { type: String },
  reason: { type: String },
  
  // Insurance and payment
  insuranceClaim: {
    claimNumber: String,
    approved: Boolean,
    coverageAmount: Number
  },
  
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  
  // Reminders
  reminderSent: { type: Boolean, default: false },
  reminderDate: { type: Date },
  
  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
AppointmentSchema.index({ patient: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index({ clinic: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });

// Auto-update updatedAt
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
