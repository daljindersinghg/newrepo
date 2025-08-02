'use client';

import { useState, useCallback } from 'react';
import { appointmentNotifications } from '@/lib/utils/appointmentNotifications';

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'rescheduled' 
  | 'completed' 
  | 'no_show'
  | 'in_progress'
  | 'counter-offered'
  | 'rejected';

export interface AppointmentStatusUpdate {
  appointmentId: string;
  oldStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
  notes?: string;
  updatedBy: 'patient' | 'clinic' | 'system';
  timestamp: string;
}

export interface StatusTransition {
  from: AppointmentStatus;
  to: AppointmentStatus;
  allowedBy: ('patient' | 'clinic' | 'system')[];
  requiresNotification: boolean;
  requiresConfirmation?: boolean;
}

// Define valid status transitions
const statusTransitions: StatusTransition[] = [
  // From pending
  { from: 'pending', to: 'confirmed', allowedBy: ['clinic'], requiresNotification: true },
  { from: 'pending', to: 'counter-offered', allowedBy: ['clinic'], requiresNotification: true },
  { from: 'pending', to: 'rejected', allowedBy: ['clinic'], requiresNotification: true },
  { from: 'pending', to: 'cancelled', allowedBy: ['patient', 'clinic'], requiresNotification: true },

  // From counter-offered
  { from: 'counter-offered', to: 'confirmed', allowedBy: ['patient'], requiresNotification: true },
  { from: 'counter-offered', to: 'rejected', allowedBy: ['patient'], requiresNotification: true },
  { from: 'counter-offered', to: 'cancelled', allowedBy: ['patient', 'clinic'], requiresNotification: true },

  // From confirmed
  { from: 'confirmed', to: 'in_progress', allowedBy: ['clinic'], requiresNotification: false },
  { from: 'confirmed', to: 'rescheduled', allowedBy: ['patient', 'clinic'], requiresNotification: true },
  { from: 'confirmed', to: 'cancelled', allowedBy: ['patient', 'clinic'], requiresNotification: true, requiresConfirmation: true },
  { from: 'confirmed', to: 'no_show', allowedBy: ['clinic'], requiresNotification: false },

  // From in_progress
  { from: 'in_progress', to: 'completed', allowedBy: ['clinic'], requiresNotification: false },
  { from: 'in_progress', to: 'cancelled', allowedBy: ['clinic'], requiresNotification: true },

  // From rescheduled
  { from: 'rescheduled', to: 'confirmed', allowedBy: ['clinic'], requiresNotification: true },
  { from: 'rescheduled', to: 'cancelled', allowedBy: ['patient', 'clinic'], requiresNotification: true },
];

export function useAppointmentStatus() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getValidTransitions = useCallback((
    currentStatus: AppointmentStatus, 
    userType: 'patient' | 'clinic' | 'system'
  ): AppointmentStatus[] => {
    return statusTransitions
      .filter(transition => 
        transition.from === currentStatus && 
        transition.allowedBy.includes(userType)
      )
      .map(transition => transition.to);
  }, []);

  const isValidTransition = useCallback((
    fromStatus: AppointmentStatus,
    toStatus: AppointmentStatus,
    userType: 'patient' | 'clinic' | 'system'
  ): boolean => {
    return statusTransitions.some(transition =>
      transition.from === fromStatus &&
      transition.to === toStatus &&
      transition.allowedBy.includes(userType)
    );
  }, []);

  const updateAppointmentStatus = useCallback(async (
    appointmentId: string,
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
    userType: 'patient' | 'clinic' | 'system',
    appointmentData?: any,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsUpdating(true);
    setError(null);

    try {
      // Validate transition
      if (!isValidTransition(currentStatus, newStatus, userType)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      }

      const transition = statusTransitions.find(t => 
        t.from === currentStatus && 
        t.to === newStatus && 
        t.allowedBy.includes(userType)
      );

      // Check if confirmation is required
      if (transition?.requiresConfirmation) {
        const confirmed = window.confirm(
          `Are you sure you want to change the appointment status to ${newStatus}?`
        );
        if (!confirmed) {
          return { success: false, error: 'Update cancelled by user' };
        }
      }

      // Update status via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
          updatedBy: userType,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      const result = await response.json();

      // Send notification if required
      if (transition?.requiresNotification && appointmentData) {
        try {
          switch (newStatus) {
            case 'confirmed':
              // Don't send notification for confirmation (internal action)
              break;
            case 'cancelled':
              await appointmentNotifications.onAppointmentCancelled(appointmentData);
              break;
            case 'rescheduled':
              // Would need old/new date/time for reschedule notification
              await appointmentNotifications.onAppointmentRescheduled(
                appointmentData,
                appointmentData.originalDate || appointmentData.appointmentDate,
                appointmentData.originalTime || appointmentData.appointmentTime
              );
              break;
            case 'counter-offered':
              // Custom notification for counter-offers
              await appointmentNotifications.onCounterOffer(appointmentData, {
                proposedDate: appointmentData.proposedDate,
                proposedTime: appointmentData.proposedTime,
                message: appointmentData.counterOfferMessage
              });
              break;
          }
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
          // Don't fail the status update if notification fails
        }
      }

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [isValidTransition]);

  const getStatusInfo = useCallback((status: AppointmentStatus) => {
    const statusConfig = {
      pending: {
        label: 'Pending Review',
        color: 'yellow',
        description: 'Waiting for clinic response',
        icon: '⏳',
        priority: 1
      },
      counter_offered: {
        label: 'Alternative Suggested',
        color: 'blue',
        description: 'Clinic suggested different time',
        icon: '💬',
        priority: 2
      },
      confirmed: {
        label: 'Confirmed',
        color: 'green',
        description: 'Appointment confirmed',
        icon: '✅',
        priority: 3
      },
      in_progress: {
        label: 'In Progress',
        color: 'purple',
        description: 'Appointment currently happening',
        icon: '🏥',
        priority: 4
      },
      completed: {
        label: 'Completed',
        color: 'emerald',
        description: 'Appointment finished successfully',
        icon: '✨',
        priority: 5
      },
      rescheduled: {
        label: 'Rescheduled',
        color: 'indigo',
        description: 'Moved to different time',
        icon: '📅',
        priority: 2
      },
      cancelled: {
        label: 'Cancelled',
        color: 'gray',
        description: 'Appointment cancelled',
        icon: '❌',
        priority: 0
      },
      rejected: {
        label: 'Declined',
        color: 'red',
        description: 'Request was declined',
        icon: '⛔',
        priority: 0
      },
      no_show: {
        label: 'No Show',
        color: 'orange',
        description: 'Patient did not attend',
        icon: '🚫',
        priority: 0
      }
    };

    return statusConfig[status.replace('-', '_') as keyof typeof statusConfig] || {
      label: status,
      color: 'gray',
      description: 'Unknown status',
      icon: '❓',
      priority: 0
    };
  }, []);

  const getStatusTimeline = useCallback((statusHistory: AppointmentStatusUpdate[]) => {
    return statusHistory
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(update => ({
        ...update,
        statusInfo: getStatusInfo(update.newStatus),
        formattedTime: new Date(update.timestamp).toLocaleString()
      }));
  }, [getStatusInfo]);

  return {
    isUpdating,
    error,
    updateAppointmentStatus,
    getValidTransitions,
    isValidTransition,
    getStatusInfo,
    getStatusTimeline,
    clearError: () => setError(null)
  };
}