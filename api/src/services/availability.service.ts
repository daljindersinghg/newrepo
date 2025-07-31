// api/src/services/availability.service.ts
import { Clinic, Appointment, IClinic, IAppointment } from '../models';
import logger from '../config/logger.config';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  duration: number; // in minutes
  type: 'available' | 'booked' | 'blocked' | 'break';
  appointmentId?: string; // if booked
}

export interface AvailabilityOptions {
  serviceDuration?: number; // in minutes, default 30
  bufferTime?: number; // buffer between appointments in minutes, default 15
  includeUnavailable?: boolean; // include booked slots in response, default false
  maxAdvanceDays?: number; // maximum days in advance to book, default 90
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD format
  isOpen: boolean;
  clinicHours?: {
    open: string; // HH:MM format
    close: string; // HH:MM format
  };
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  timeSlots: TimeSlot[];
}

export class AvailabilityService {
  
  /**
   * Get available time slots for a specific clinic and date
   */
  static async getAvailableSlots(
    clinicId: string, 
    date: Date, 
    options: AvailabilityOptions = {}
  ): Promise<DayAvailability> {
    try {
      const {
        serviceDuration = 30,
        bufferTime = 15,
        includeUnavailable = false,
        maxAdvanceDays = 90
      } = options;

      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const requestDate = new Date(date);
      requestDate.setHours(0, 0, 0, 0);

      if (requestDate < today) {
        throw new Error('Cannot check availability for past dates');
      }

      // Check if date is within booking window
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + maxAdvanceDays);
      if (requestDate > maxDate) {
        throw new Error(`Cannot book more than ${maxAdvanceDays} days in advance`);
      }

      // Get clinic details
      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        throw new Error('Clinic not found');
      }

      if (!clinic.active) {
        throw new Error('Clinic is not currently accepting appointments');
      }

      // Get clinic hours for the requested day
      const dayOfWeek = this.getDayOfWeek(requestDate);
      const clinicHours = this.getClinicHoursForDay(clinic, dayOfWeek);

      // If clinic is closed on this day
      if (!clinicHours.isOpen) {
        return {
          date: this.formatDate(requestDate),
          isOpen: false,
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
          timeSlots: []
        };
      }

      // Get existing appointments for this date
      const startOfDay = new Date(requestDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(requestDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.find({
        clinic: clinicId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['scheduled', 'confirmed'] } // Only consider active appointments
      }).sort({ appointmentDate: 1 });

      // Generate time slots
      const timeSlots = this.generateTimeSlots(
        requestDate,
        clinicHours,
        existingAppointments,
        serviceDuration,
        bufferTime,
        includeUnavailable
      );

      // Calculate statistics
      const totalSlots = timeSlots.length;
      const availableSlots = timeSlots.filter(slot => slot.available).length;
      const bookedSlots = timeSlots.filter(slot => slot.type === 'booked').length;

      return {
        date: this.formatDate(requestDate),
        isOpen: true,
        clinicHours: {
          open: clinicHours.open,
          close: clinicHours.close
        },
        totalSlots,
        availableSlots,
        bookedSlots,
        timeSlots
      };

    } catch (error: any) {
      logger.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Get availability for multiple days (calendar view)
   */
  static async getWeeklyAvailability(
    clinicId: string,
    startDate: Date,
    days: number = 7,
    options: AvailabilityOptions = {}
  ): Promise<DayAvailability[]> {
    try {
      const availabilityPromises: Promise<DayAvailability>[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        availabilityPromises.push(
          this.getAvailableSlots(clinicId, date, options)
        );
      }

      const results = await Promise.all(availabilityPromises);
      return results;

    } catch (error: any) {
      logger.error('Error getting weekly availability:', error);
      throw error;
    }
  }

  /**
   * Check if a specific time slot is available
   */
  static async isSlotAvailable(
    clinicId: string,
    appointmentDate: Date,
    duration: number = 30
  ): Promise<boolean> {
    try {
      const startTime = new Date(appointmentDate);
      const endTime = new Date(appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + duration);

      // Check for overlapping appointments
      const conflictingAppointments = await Appointment.find({
        clinic: clinicId,
        status: { $in: ['scheduled', 'confirmed'] },
        $or: [
          // Appointment starts during our time slot
          {
            appointmentDate: {
              $gte: startTime,
              $lt: endTime
            }
          },
          // Appointment ends during our time slot
          {
            $expr: {
              $and: [
                { $lte: ['$appointmentDate', startTime] },
                { 
                  $gt: [
                    { $add: ['$appointmentDate', { $multiply: ['$duration', 60000] }] },
                    startTime
                  ]
                }
              ]
            }
          }
        ]
      });

      if (conflictingAppointments.length > 0) {
        return false;
      }

      // Check clinic hours
      const clinic = await Clinic.findById(clinicId);
      if (!clinic || !clinic.active) {
        return false;
      }

      const dayOfWeek = this.getDayOfWeek(appointmentDate);
      const clinicHours = this.getClinicHoursForDay(clinic, dayOfWeek);

      if (!clinicHours.isOpen) {
        return false;
      }

      // Check if slot is within clinic hours
      const slotTime = this.formatTime(appointmentDate);
      const endSlotTime = this.formatTime(endTime);

      return slotTime >= clinicHours.open && endSlotTime <= clinicHours.close;

    } catch (error: any) {
      logger.error('Error checking slot availability:', error);
      return false;
    }
  }

  /**
   * Reserve a time slot temporarily (for booking process)
   */
  static async reserveSlot(
    clinicId: string,
    appointmentDate: Date,
    duration: number,
    patientId: string,
    reservationMinutes: number = 10
  ): Promise<{ reservationId: string; expiresAt: Date } | null> {
    try {
      // Check if slot is available
      const isAvailable = await this.isSlotAvailable(clinicId, appointmentDate, duration);
      if (!isAvailable) {
        return null;
      }

      // Create temporary reservation (you might want to use Redis for this)
      const reservationId = `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + reservationMinutes);

      // In a real implementation, you'd store this in Redis or a temporary reservations collection
      logger.info(`Slot reserved: ${reservationId} for patient ${patientId} until ${expiresAt}`);

      return {
        reservationId,
        expiresAt
      };

    } catch (error: any) {
      logger.error('Error reserving slot:', error);
      throw error;
    }
  }

  /**
   * Get next available appointment slot
   */
  static async getNextAvailableSlot(
    clinicId: string,
    serviceDuration: number = 30,
    startFromDate?: Date
  ): Promise<TimeSlot | null> {
    try {
      const searchStartDate = startFromDate || new Date();
      const maxSearchDays = 30; // Search up to 30 days ahead

      for (let day = 0; day < maxSearchDays; day++) {
        const searchDate = new Date(searchStartDate);
        searchDate.setDate(searchStartDate.getDate() + day);

        const dayAvailability = await this.getAvailableSlots(
          clinicId, 
          searchDate, 
          { serviceDuration }
        );

        if (dayAvailability.isOpen && dayAvailability.availableSlots > 0) {
          const firstAvailableSlot = dayAvailability.timeSlots.find(slot => slot.available);
          if (firstAvailableSlot) {
            return firstAvailableSlot;
          }
        }
      }

      return null; // No available slots found in the next 30 days

    } catch (error: any) {
      logger.error('Error finding next available slot:', error);
      throw error;
    }
  }

  // ================ PRIVATE HELPER METHODS ================

  /**
   * Generate time slots for a given day
   */
  private static generateTimeSlots(
    date: Date,
    clinicHours: { isOpen: boolean; open: string; close: string },
    existingAppointments: IAppointment[],
    serviceDuration: number,
    bufferTime: number,
    includeUnavailable: boolean
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    if (!clinicHours.isOpen) {
      return slots;
    }

    const [openHour, openMinute] = clinicHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = clinicHours.close.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(openHour, openMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(closeHour, closeMinute, 0, 0);

    // If we're checking today, don't show past time slots
    const now = new Date();
    const currentTime = this.isSameDay(date, now) ? now : startTime;
    const actualStartTime = startTime > currentTime ? startTime : currentTime;

    // Round up to next available slot time
    if (actualStartTime.getMinutes() % serviceDuration !== 0) {
      const minutesToAdd = serviceDuration - (actualStartTime.getMinutes() % serviceDuration);
      actualStartTime.setMinutes(actualStartTime.getMinutes() + minutesToAdd);
    }

    let currentSlotTime = new Date(actualStartTime);

    while (currentSlotTime < endTime) {
      const slotEndTime = new Date(currentSlotTime);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + serviceDuration);

      // Don't create slots that would end after clinic closes
      if (slotEndTime > endTime) {
        break;
      }

      const slot: TimeSlot = {
        startTime: new Date(currentSlotTime),
        endTime: new Date(slotEndTime),
        available: true,
        duration: serviceDuration,
        type: 'available'
      };

      // Check if this slot conflicts with existing appointments
      const conflictingAppointment = existingAppointments.find(appointment => {
        const apptStart = new Date(appointment.appointmentDate);
        const apptEnd = new Date(appointment.appointmentDate);
        apptEnd.setMinutes(apptEnd.getMinutes() + appointment.duration);

        // Check for any overlap
        return (
          (currentSlotTime >= apptStart && currentSlotTime < apptEnd) ||
          (slotEndTime > apptStart && slotEndTime <= apptEnd) ||
          (currentSlotTime <= apptStart && slotEndTime >= apptEnd)
        );
      });

      if (conflictingAppointment) {
        slot.available = false;
        slot.type = 'booked';
        slot.appointmentId = (conflictingAppointment._id as any).toString();
      }

      // Only include the slot if it's available or if we want to include unavailable slots
      if (slot.available || includeUnavailable) {
        slots.push(slot);
      }

      // Move to next slot (including buffer time)
      currentSlotTime.setMinutes(currentSlotTime.getMinutes() + serviceDuration + bufferTime);
    }

    return slots;
  }

  /**
   * Get clinic hours for a specific day of the week
   */
  private static getClinicHoursForDay(
    clinic: IClinic, 
    dayOfWeek: string
  ): { isOpen: boolean; open: string; close: string } {
    const hours = clinic.hours;
    if (!hours) {
      return { isOpen: false, open: '09:00', close: '17:00' };
    }

    const dayHours = hours[dayOfWeek as keyof typeof hours];
    if (!dayHours || dayHours.toLowerCase() === 'closed') {
      return { isOpen: false, open: '09:00', close: '17:00' };
    }

    // Parse hours like "9:00 AM - 5:00 PM" or "09:00 - 17:00"
    const timeRange = dayHours.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?\s*-\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
    
    if (!timeRange) {
      // Fallback to default hours if parsing fails
      return { isOpen: true, open: '09:00', close: '17:00' };
    }

    let openHour = parseInt(timeRange[1]);
    const openMinute = parseInt(timeRange[2] || '0');
    const openPeriod = timeRange[3];

    let closeHour = parseInt(timeRange[4]);
    const closeMinute = parseInt(timeRange[5] || '0');
    const closePeriod = timeRange[6];

    // Convert to 24-hour format
    if (openPeriod && openPeriod.toLowerCase() === 'pm' && openHour !== 12) {
      openHour += 12;
    } else if (openPeriod && openPeriod.toLowerCase() === 'am' && openHour === 12) {
      openHour = 0;
    }

    if (closePeriod && closePeriod.toLowerCase() === 'pm' && closeHour !== 12) {
      closeHour += 12;
    } else if (closePeriod && closePeriod.toLowerCase() === 'am' && closeHour === 12) {
      closeHour = 0;
    }

    const open = `${openHour.toString().padStart(2, '0')}:${openMinute.toString().padStart(2, '0')}`;
    const close = `${closeHour.toString().padStart(2, '0')}:${closeMinute.toString().padStart(2, '0')}`;

    return { isOpen: true, open, close };
  }

  /**
   * Get day of week as lowercase string
   */
  private static getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format time as HH:MM
   */
  private static formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Check if two dates are the same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}