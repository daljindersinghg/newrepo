import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  appointment?: mongoose.Types.ObjectId;
  
  rating: number; // 1-5 stars
  title?: string;
  comment?: string;
  
  categories?: {
    cleanliness?: number;
    staff?: number;
    waitTime?: number;
    treatment?: number;
    value?: number;
  };
  
  isAnonymous: boolean;
  isVerified: boolean;
  
  response?: {
    text: string;
    respondedBy: mongoose.Types.ObjectId; // doctor or admin
    respondedAt: Date;
  };
  
  isPublic: boolean;
  isApproved: boolean;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String },
  
  categories: {
    cleanliness: { type: Number, min: 1, max: 5 },
    staff: { type: Number, min: 1, max: 5 },
    waitTime: { type: Number, min: 1, max: 5 },
    treatment: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  
  isAnonymous: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  
  response: {
    text: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'response.respondedByModel' },
    respondedByModel: { type: String, enum: ['Doctor', 'Admin'] },
    respondedAt: Date
  },
  
  isPublic: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  
  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
ReviewSchema.index({ doctor: 1, isPublic: 1, isApproved: 1 });
ReviewSchema.index({ clinic: 1, isPublic: 1, isApproved: 1 });
ReviewSchema.index({ patient: 1 });
ReviewSchema.index({ rating: 1 });

// Ensure one review per patient per appointment
ReviewSchema.index({ patient: 1, appointment: 1 }, { unique: true });

// Auto-update updatedAt
ReviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IReview>('Review', ReviewSchema);
