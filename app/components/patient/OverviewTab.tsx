'use client';

import { useState, useEffect } from 'react';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { appointmentApi, Appointment } from '@/lib/api/appointments';
import { format } from 'date-fns';

export function OverviewTab() {
  const { patientInfo } = usePatientAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientInfo?._id) {
      fetchAppointments();
    }
  }, [patientInfo?._id]);

  const fetchAppointments = async () => {
    if (!patientInfo?._id) return;
    
    try {
      const result = await appointmentApi.getMyRequests(patientInfo._id);
      if (result.success) {
        setAppointments(result.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentAppointments = appointments
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
    .slice(0, 5);

  const counterOfferedAppointments = appointments.filter(apt => apt.status === 'counter-offered');

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book New Appointment
          </button>
          
          <button
            type="button"
            onClick={() => window.location.href = '/patient/appointments'}
            className="flex items-center justify-center p-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
            </svg>
            View All Appointments
          </button>
        </div>
      </div>

      {/* Urgent Actions */}
      {counterOfferedAppointments.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">Action Required</h3>
          <p className="text-purple-700 mb-4">
            You have {counterOfferedAppointments.length} appointment{counterOfferedAppointments.length > 1 ? 's' : ''} with alternative times suggested by clinics.
          </p>
          <button
            type="button"
            onClick={() => window.location.href = '/patient/appointments'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Respond to Clinics
          </button>
        </div>
      )}

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
            <p className="text-gray-600 mt-2">Loading appointments...</p>
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
            <p className="text-gray-600 mb-4">Start by finding and booking with a dental clinic</p>
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Find Clinics
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentAppointments.map((appointment) => (
              <div key={appointment._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{appointment.clinic.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{appointment.clinic.address}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{format(new Date(appointment.originalRequest.requestedDate), 'MMM d, yyyy')}</span>
                      <span>{appointment.originalRequest.requestedTime}</span>
                      <span>{appointment.duration} min</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'counter-offered' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status === 'pending' ? 'Waiting for Response' :
                     appointment.status === 'counter-offered' ? 'Needs Your Response' :
                     appointment.status === 'confirmed' ? 'Confirmed' :
                     appointment.status === 'rejected' ? 'Declined' :
                     appointment.status}
                  </span>
                </div>
              </div>
            ))}
            
            <div className="p-4 bg-gray-50 text-center">
              <button
                type="button"
                onClick={() => window.location.href = '/patient/appointments'}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Appointments →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}