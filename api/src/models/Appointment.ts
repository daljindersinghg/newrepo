import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  // Basic Info
  patient: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  
  // Current appointment details
  appointmentDate: Date;
  duration: number; // in minutes
  type: 'consultation' | 'cleaning' | 'procedure' | 'emergency' | 'follow-up';
  
  // Request workflow status
  status: 'pending' | 'counter-offered' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  
  // Original patient request
  originalRequest: {
    requestedDate: Date;
    requestedTime: string; // "14:00"
    duration: number;
    reason: string;
    requestedAt: Date;
  };
  
  // Clinic responses (array to track conversation)
  clinicResponses: [{
    responseType: 'counter-offer' | 'confirmation' | 'rejection';
    proposedDate?: Date;
    proposedTime?: string;
    proposedDuration?: number;
    message: string;
    respondedAt: Date;
    respondedBy: mongoose.Types.ObjectId; // clinic staff
  }];
  
  // Patient responses to counter-offers
  patientResponses: [{
    responseType: 'accept' | 'reject' | 'counter';
    message?: string;
    respondedAt: Date;
  }];
  
  // Final confirmation
  confirmedDetails?: {
    finalDate: Date;
    finalTime: string;
    finalDuration: number;
    confirmedAt: Date;
    confirmedBy: 'patient' | 'clinic';
  };
  
  // Communication thread
  messages: [{
    sender: 'patient' | 'clinic';
    senderId: mongoose.Types.ObjectId;
    message: string;
    sentAt: Date;
    readAt?: Date;
  }];
  
  // Metadata
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date; // for sorting active conversations
}

const AppointmentSchema = new Schema<IAppointment>({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  clinic: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
  
  appointmentDate: { type: Date, required: true },
  duration: { type: Number, required: true, default: 30 },
  type: { 
    type: String, 
    enum: ['consultation', 'cleaning', 'procedure', 'emergency', 'follow-up'],
    default: 'consultation'
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'counter-offered', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  originalRequest: {
    requestedDate: { type: Date, required: true },
    requestedTime: { type: String, required: true },
    duration: { type: Number, required: true },
    reason: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now }
  },
  
  clinicResponses: [{
    responseType: { 
      type: String, 
      enum: ['counter-offer', 'confirmation', 'rejection'],
      required: true 
    },
    proposedDate: { type: Date },
    proposedTime: { type: String },
    proposedDuration: { type: Number },
    message: { type: String, required: true },
    respondedAt: { type: Date, default: Date.now },
    respondedBy: { type: Schema.Types.ObjectId, ref: 'Clinic' }
  }],
  
  patientResponses: [{
    responseType: { 
      type: String, 
      enum: ['accept', 'reject', 'counter'],
      required: true 
    },
    message: { type: String },
    respondedAt: { type: Date, default: Date.now }
  }],
  
  confirmedDetails: {
    finalDate: { type: Date },
    finalTime: { type: String },
    finalDuration: { type: Number },
    confirmedAt: { type: Date },
    confirmedBy: { type: String, enum: ['patient', 'clinic'] }
  },
  
  messages: [{
    sender: { type: String, enum: ['patient', 'clinic'], required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date }
  }],
  
  estimatedCost: { type: Number },
  actualCost: { type: Number },
  notes: { type: String },
  
  lastActivityAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
AppointmentSchema.index({ patient: 1, status: 1, lastActivityAt: -1 });
AppointmentSchema.index({ clinic: 1, status: 1, lastActivityAt: -1 });
AppointmentSchema.index({ status: 1, 'originalRequest.requestedDate': 1 });

// Update lastActivityAt on save
AppointmentSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);