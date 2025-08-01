'use client';

import { useState, useEffect } from 'react';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useAuth } from '@/providers/AuthProvider';
import { appointmentApi, Appointment } from '@/lib/api/appointments';
import AppointmentStatus from '@/components/appointments/AppointmentStatus';

export default function PatientAppointmentsPage() {
  const { isAuthenticated, isLoading: authLoading } = usePatientAuth();
  const { showAuthModal } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { patientInfo } = usePatientAuth();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await appointmentApi.getMyRequests(patientInfo._id);
      
      if (result.success) {
        setAppointments(result.appointments);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchAppointments();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments(prev => 
      prev.map(apt => apt._id === updatedAppointment._id ? updatedAppointment : apt)
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your appointment requests</p>
          <button
            onClick={() => showAuthModal('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointment Requests</h1>
          <p className="text-gray-600">Track and manage your dental appointment requests</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading your appointments...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Appointments</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchAppointments}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && appointments.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointment Requests</h3>
            <p className="text-gray-600 mb-6">You haven't made any appointment requests yet.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Find a Clinic
            </button>
          </div>
        )}

        {/* Appointments List */}
        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Requests', value: appointments.length, color: 'bg-blue-50 text-blue-700' },
                { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
                { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: 'bg-green-50 text-green-700' },
                { label: 'Needs Response', value: appointments.filter(a => a.status === 'counter-offered').length, color: 'bg-purple-50 text-purple-700' }
              ].map((stat, index) => (
                <div key={index} className={`${stat.color} rounded-lg p-4`}>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Appointments */}
            <div className="space-y-6">
              {appointments
                .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
                .map((appointment) => (
                  <AppointmentStatus
                    key={appointment._id}
                    appointment={appointment}
                    onUpdate={handleAppointmentUpdate}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        {!loading && appointments.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={fetchAppointments}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Refresh Appointments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}