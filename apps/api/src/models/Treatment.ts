import mongoose, { Document, Schema } from 'mongoose';

export interface ITreatment extends Document {
  appointment: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  
  treatmentName: string;
  description?: string;
  category: 'preventive' | 'restorative' | 'cosmetic' | 'surgical' | 'orthodontic' | 'periodontal';
  
  procedures: {
    name: string;
    code?: string; // dental procedure code
    cost: number;
    completed: boolean;
    notes?: string;
  }[];
  
  totalCost: number;
  insuranceCovered?: number;
  patientPaid?: number;
  
  startDate: Date;
  completionDate?: Date;
  followUpRequired?: boolean;
  followUpDate?: Date;
  
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  
  // Medical records
  preConditions?: string[];
  postInstructions?: string;
  complications?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentSchema: Schema = new Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  
  treatmentName: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['preventive', 'restorative', 'cosmetic', 'surgical', 'orthodontic', 'periodontal'],
    required: true
  },
  
  procedures: [{
    name: { type: String, required: true },
    code: { type: String }, // dental procedure code
    cost: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String }
  }],
  
  totalCost: { type: Number, required: true },
  insuranceCovered: { type: Number, default: 0 },
  patientPaid: { type: Number, default: 0 },
  
  startDate: { type: Date, required: true },
  completionDate: { type: Date },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  
  status: { 
    type: String, 
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  
  // Medical records
  preConditions: [String],
  postInstructions: { type: String },
  complications: { type: String },
  
  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
TreatmentSchema.index({ patient: 1, startDate: -1 });
TreatmentSchema.index({ doctor: 1, startDate: -1 });
TreatmentSchema.index({ status: 1 });

// Auto-update updatedAt
TreatmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ITreatment>('Treatment', TreatmentSchema);
