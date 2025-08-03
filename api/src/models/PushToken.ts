import mongoose, { Document, Schema } from 'mongoose';

export interface IPushToken extends Document {
  token: string;
  clinicId: mongoose.Types.ObjectId;
  platform: 'web' | 'mobile';
  userAgent?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PushTokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: [true, 'FCM token is required'],
    unique: true,
    index: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic',
    required: [true, 'Clinic ID is required'],
    index: true
  },
  platform: {
    type: String,
    enum: ['web', 'mobile'],
    required: [true, 'Platform is required'],
    default: 'web'
  },
  userAgent: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
PushTokenSchema.index({ clinicId: 1, isActive: 1 }); // For finding active tokens by clinic
PushTokenSchema.index({ token: 1, clinicId: 1 }, { unique: true }); // Prevent duplicate tokens per clinic

// Pre-save middleware to update timestamps
PushTokenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const PushToken = mongoose.model<IPushToken>('PushToken', PushTokenSchema);
export default PushToken;