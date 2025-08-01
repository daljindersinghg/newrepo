import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  recipientType: 'patient' | 'clinic';
  
  type: 'appointment_request' | 'counter_offer' | 'confirmation' | 'rejection' | 'cancellation' | 'reminder';
  
  title: string;
  message: string;
  
  relatedAppointment?: mongoose.Types.ObjectId;
  
  // Action required
  actionRequired: boolean;
  actionType?: 'respond_to_request' | 'confirm_appointment' | 'reschedule' | 'none';
  actionUrl?: string; // deep link for mobile/web
  
  // Status
  read: boolean;
  readAt?: Date;
  
  // Email tracking
  emailSent: boolean;
  emailSentAt?: Date;
  
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, required: true },
  recipientType: { 
    type: String, 
    enum: ['patient', 'clinic'], 
    required: true 
  },
  
  type: { 
    type: String, 
    enum: ['appointment_request', 'counter_offer', 'confirmation', 'rejection', 'cancellation', 'reminder'],
    required: true 
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  relatedAppointment: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  
  actionRequired: { type: Boolean, default: false },
  actionType: { 
    type: String, 
    enum: ['respond_to_request', 'confirm_appointment', 'reschedule', 'none'],
    default: 'none'
  },
  actionUrl: { type: String },
  
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for performance
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipientType: 1, actionRequired: 1, createdAt: -1 });
NotificationSchema.index({ relatedAppointment: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);