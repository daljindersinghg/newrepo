'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useAuth } from '@/providers/AuthProvider';
import { appointmentApi, Appointment } from '@/lib/api/appointments';
import AppointmentStatus from '@/components/appointments/AppointmentStatus';
import { format } from 'date-fns';

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {patientInfo?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Find Clinics
              </Link>
              <Link
                href="/patient/appointments"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                All Appointments
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{appointments.length}</h3>
                <p className="text-sm text-gray-600">Total Requests</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{pendingAppointments.length}</h3>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{counterOfferedAppointments.length}</h3>
                <p className="text-sm text-gray-600">Needs Response</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{confirmedAppointments.length}</h3>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <span className="ml-3 text-gray-600">Loading your appointments...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchAppointments}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
                </div>
                
                {recentAppointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
                    <p className="text-gray-600 mb-4">Start by finding and booking with a dental clinic</p>
                    <Link
                      href="/"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                      Find Clinics
                    </Link>
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
                      <a
                        href="/patient/appointments"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View All Appointments →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Urgent Items */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/"
                    className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Book New Appointment
                  </Link>
                  <Link
                    href="/patient/appointments"
                    className="block w-full bg-gray-200 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    View All Appointments
                  </Link>
                </div>
              </div>

              {/* Urgent Actions */}
              {counterOfferedAppointments.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">Action Required</h3>
                  <p className="text-purple-700 text-sm mb-4">
                    You have {counterOfferedAppointments.length} appointment{counterOfferedAppointments.length > 1 ? 's' : ''} with alternative times suggested by clinics.
                  </p>
                  <a
                    href="/patient/appointments"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm inline-block"
                  >
                    Respond to Clinics
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}