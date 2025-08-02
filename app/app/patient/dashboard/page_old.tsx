'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useAuth } from '@/providers/AuthProvider';
import { appointmentApi, Appointment } from '@/lib/api/appointments';
import AppointmentStatus from '@/components/appointments/AppointmentStatus';
import { format } from 'date-fns';
import { SharedHeader } from '@/components/shared/SharedHeader';

export default function PatientDashboard() {
  const { patientInfo, isAuthenticated, isLoading: authLoading } = usePatientAuth();
  const { showAuthModal } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!patientInfo?._id) {
        throw new Error('Patient ID not found');
      }
      
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard</p>
          <button
            type="button"
            onClick={() => showAuthModal('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const counterOfferedAppointments = appointments.filter(apt => apt.status === 'counter-offered');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const recentAppointments = appointments
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Uniform Header */}
      <SharedHeader 
        showDentistLogin={true} 
        showPatientAuth={true}
        className="sticky top-0 z-50" 
      />

      {/* Mobile-First Dashboard */}
      <div className="px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {patientInfo?.name?.split(' ')[0] || 'Patient'}!
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your dental appointments and profile
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {pendingAppointments.length}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {confirmedAppointments.length}
            </div>
            <div className="text-xs text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {counterOfferedAppointments.length}
            </div>
            <div className="text-xs text-gray-600">Counter Offers</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {appointments.length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link href="/" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors">
            <div className="font-medium mb-1">Book New Appointment</div>
            <div className="text-sm opacity-90">Find dentists near you</div>
          </Link>
          <Link href="/patient/profile" className="bg-white border border-gray-200 p-4 rounded-lg text-center hover:bg-gray-50 transition-colors">
            <div className="font-medium mb-1 text-gray-900">Update Profile</div>
            <div className="text-sm text-gray-600">Manage your information</div>
          </Link>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
            <Link href="/patient/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              <span className="ml-2 text-gray-600 text-sm">Loading...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                type="button"
                onClick={fetchAppointments}
                className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && recentAppointments.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm mb-4">No appointments yet</p>
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Book Your First Appointment
              </Link>
            </div>
          )}

          {!loading && !error && recentAppointments.length > 0 && (
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div key={appointment._id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{appointment.clinic.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{appointment.clinic.address}</p>
                      <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                        <span>{format(new Date(appointment.originalRequest.requestedDate), 'MMM d')}</span>
                        <span>{appointment.originalRequest.requestedTime}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'counter-offered' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status === 'pending' ? 'Pending' :
                       appointment.status === 'counter-offered' ? 'Needs Response' :
                       appointment.status === 'confirmed' ? 'Confirmed' :
                       appointment.status === 'rejected' ? 'Declined' :
                       appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}