// api/src/models/Appointment.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  
  appointmentDate: Date;
  duration: number; // in minutes
  
  // Updated status enum for request-based workflow
  status: 'requested' | 'pending' | 'counter-offered' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  type: 'consultation' | 'cleaning' | 'procedure' | 'emergency' | 'follow-up';
  
  notes?: string;
  reason?: string;
  
  // Request workflow fields
  requestedDate: Date; // Original patient request date
  requestedReason: string; // Patient's reason for appointment
  
  // Counter-offer fields
  counterOffer?: {
    proposedDate: Date;
    proposedDuration: number;
    clinicMessage: string;
    offeredAt: Date;
  };
  
  // Patient response fields
  patientResponse?: 'accepted' | 'rejected' | 'counter';
  patientMessage?: string;
  respondedAt?: Date;
  
  estimatedCost?: number;
  actualCost?: number;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  
  appointmentDate: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // default 30 minutes
  
  // Updated status enum for request workflow
  status: { 
    type: String, 
    enum: ['requested', 'pending', 'counter-offered', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'requested'
  },
  type: { 
    type: String, 
    enum: ['consultation', 'cleaning', 'procedure', 'emergency', 'follow-up'],
    required: true
  },
  
  notes: { type: String },
  reason: { type: String },
  
  // Request workflow fields
  requestedDate: { type: Date, default: Date.now },
  requestedReason: { type: String, required: true },
  
  // Counter-offer fields
  counterOffer: {
    proposedDate: { type: Date },
    proposedDuration: { type: Number },
    clinicMessage: { type: String },
    offeredAt: { type: Date }
  },
  
  // Patient response fields
  patientResponse: { 
    type: String, 
    enum: ['accepted', 'rejected', 'counter'] 
  },
  patientMessage: { type: String },
  respondedAt: { type: Date },
  
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  
  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
AppointmentSchema.index({ patient: 1, appointmentDate: 1 });
AppointmentSchema.index({ clinic: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ patient: 1, status: 1 });
AppointmentSchema.index({ clinic: 1, status: 1 });
AppointmentSchema.index({ status: 1, appointmentDate: 1 });

// Auto-update updatedAt
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);