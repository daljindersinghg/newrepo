'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { appointmentApi, Appointment } from '@/lib/api/appointments';

interface AppointmentNotificationProps {
  onClose: () => void;
}

export default function AppointmentNotification({ onClose }: AppointmentNotificationProps) {
  const { isAuthenticated } = usePatientAuth();
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
   const { patientInfo } = usePatientAuth();
  useEffect(() => {
    if (isAuthenticated) {
      loadRecentAppointments();
    }
  }, [isAuthenticated]);

  const loadRecentAppointments = async () => {
    try {
   
      const result = await appointmentApi.getMyRequests(patientInfo?._id);
      if (result.success) {
        // Show only recent appointments that need attention
        const needsAttention = result.appointments.filter(apt => 
          apt.status === 'counter-offered' || 
          (apt.status === 'confirmed' && !apt.confirmedDetails)
        );
        setRecentAppointments(needsAttention.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading || recentAppointments.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Appointment Updates</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {recentAppointments.map((appointment) => (
          <div key={appointment._id} className="p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start space-x-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                appointment.status === 'counter-offered' ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {appointment.clinic.name}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {appointment.status === 'counter-offered' 
                    ? 'Alternative time suggested - needs your response'
                    : 'Appointment confirmed'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(appointment.lastActivityAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 rounded-b-lg">
        <a
          href="/appointments"
          className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All Appointments
        </a>
      </div>
    </div>
  );
}