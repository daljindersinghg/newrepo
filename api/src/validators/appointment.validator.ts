// api/src/validators/appointment.validator.ts
import { z } from 'zod';

// Schema for creating a new appointment
export const appointmentSchema = z.object({
  patient: z.string()
    .min(1, 'Patient ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID format'),
  
  clinic: z.string()
    .min(1, 'Clinic ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid clinic ID format'),
  
  appointmentDate: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Appointment date must be a valid future date'),
  
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 240 minutes')
    .default(30),
  
  type: z.enum(['consultation', 'cleaning', 'procedure', 'emergency', 'follow-up'])
    .default('consultation'),
  
  reason: z.string()
    .min(1, 'Reason for appointment is required')
    .max(500, 'Reason cannot exceed 500 characters'),
  
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  
  // Insurance information (optional)
  insuranceClaim: z.object({
    claimNumber: z.string().optional(),
    approved: z.boolean().optional(),
    coverageAmount: z.number().min(0).optional()
  }).optional(),
  
  estimatedCost: z.number()
    .min(0, 'Estimated cost must be non-negative')
    .optional(),
  
  // Patient contact preferences
  contactPreferences: z.object({
    reminderMethod: z.enum(['email', 'sms', 'both']).default('email'),
    reminderTime: z.number().min(1).max(72).default(24) // hours before appointment
  }).optional()
});

// Schema for rescheduling an appointment
export const rescheduleSchema = z.object({
  newDateTime: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'New appointment date must be a valid future date'),
  
  reason: z.string()
    .min(1, 'Reason for rescheduling is required')
    .max(500, 'Reason cannot exceed 500 characters'),
  
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 240 minutes')
    .optional() // If not provided, keep original duration
});

// Schema for updating appointment status
export const statusUpdateSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']),
  
  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional(),
  
  actualCost: z.number()
    .min(0, 'Actual cost must be non-negative')
    .optional(), // Only for completed appointments
  
  // For completed appointments
  treatmentProvided: z.string()
    .max(1000, 'Treatment description cannot exceed 1000 characters')
    .optional(),
  
  followUpRequired: z.boolean().optional(),
  followUpDate: z.string()
    .refine((date) => {
      if (!date) return true; // Optional field
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Follow-up date must be a valid future date')
    .optional()
});

// Schema for cancelling an appointment
export const cancellationSchema = z.object({
  reason: z.string()
    .min(1, 'Reason for cancellation is required')
    .max(500, 'Reason cannot exceed 500 characters'),
  
  refundRequested: z.boolean().default(false),
  
  rescheduleRequested: z.boolean().default(false),
  
  preferredRescheduleDate: z.string()
    .refine((date) => {
      if (!date) return true; // Optional field
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Preferred reschedule date must be a valid future date')
    .optional()
});

// Schema for availability queries
export const availabilityQuerySchema = z.object({
  date: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Date must be in valid format (YYYY-MM-DD)'),
  
  duration: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 15 && num <= 240;
    }, 'Duration must be between 15 and 240 minutes')
    .default('30'),
  
  buffer: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 60;
    }, 'Buffer time must be between 0 and 60 minutes')
    .default('15'),
  
  includeBooked: z.enum(['true', 'false']).default('false'),
  
  maxAdvanceDays: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 365;
    }, 'Max advance days must be between 1 and 365')
    .default('90')
});

// Schema for slot reservation
export const slotReservationSchema = z.object({
  datetime: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Datetime must be a valid future date and time'),
  
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 240 minutes')
    .default(30),
  
  patientId: z.string()
    .min(1, 'Patient ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID format'),
  
  reservationMinutes: z.number()
    .min(5, 'Reservation must be at least 5 minutes')
    .max(30, 'Reservation cannot exceed 30 minutes')
    .default(10)
});

// Type exports for use in controllers and services
export type AppointmentCreateData = z.infer<typeof appointmentSchema>;
export type AppointmentRescheduleData = z.infer<typeof rescheduleSchema>;
export type AppointmentStatusUpdate = z.infer<typeof statusUpdateSchema>;
export type AppointmentCancellation = z.infer<typeof cancellationSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type SlotReservation = z.infer<typeof slotReservationSchema>;