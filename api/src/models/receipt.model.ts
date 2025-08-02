import mongoose, { Document, Schema } from 'mongoose';

export interface IReceipt extends Document {
  _id: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  fileName: string;
  originalFileName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  type: 'treatment' | 'consultation' | 'prescription' | 'other';
  description?: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  isActive: boolean;
  metadata?: {
    appointmentId?: mongoose.Types.ObjectId;
    clinicId?: mongoose.Types.ObjectId;
    amount?: number;
    currency?: string;
    receiptDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalFileName: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['treatment', 'consultation', 'prescription', 'other'],
    required: true,
    default: 'other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      sparse: true
    },
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      sparse: true
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true
    },
    receiptDate: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ReceiptSchema.index({ patient: 1, type: 1 });
ReceiptSchema.index({ patient: 1, uploadDate: -1 });
ReceiptSchema.index({ cloudinaryPublicId: 1 }, { unique: true });

// Virtual for file extension
ReceiptSchema.virtual('fileExtension').get(function() {
  return this.originalFileName.split('.').pop()?.toLowerCase();
});

// Virtual for formatted file size
ReceiptSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Pre-save middleware
ReceiptSchema.pre('save', function(next) {
  if (this.isNew) {
    this.uploadDate = new Date();
  }
  next();
});

// Static methods
ReceiptSchema.statics.findByPatient = function(patientId: string, options: any = {}) {
  const query: any = { patient: patientId, isActive: true };
  if (options.type) query.type = options.type;
  
  return this.find(query)
    .sort({ uploadDate: -1 })
    .limit(options.limit || 50);
};

ReceiptSchema.statics.findByType = function(patientId: string, type: string) {
  return this.find({ patient: patientId, type, isActive: true })
    .sort({ uploadDate: -1 });
};

ReceiptSchema.statics.getPatientStats = function(patientId: string) {
  return this.aggregate([
    { $match: { patient: new mongoose.Types.ObjectId(patientId), isActive: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' }
      }
    }
  ]);
};

const Receipt = mongoose.model<IReceipt>('Receipt', ReceiptSchema);

export default Receipt;