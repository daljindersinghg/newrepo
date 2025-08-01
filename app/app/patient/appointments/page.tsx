'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useAuth } from '@/providers/AuthProvider';
import { appointmentApi, Appointment } from '@/lib/api/appointments';
import AppointmentStatus from '@/components/appointments/AppointmentStatus';

export default function PatientAppointments() {
  const { patientInfo, isAuthenticated, isLoading: authLoading } = usePatientAuth();
  const { showAuthModal } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchAppointments = async () => {
    if (!patientInfo?._id) return;
    
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
          <p className="text-gray-600 mb-6">Please sign in to view your appointments</p>
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

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filterStatus);

  const statusCounts = {
    all: appointments.length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    'counter-offered': appointments.filter(apt => apt.status === 'counter-offered').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    rejected: appointments.filter(apt => apt.status === 'rejected').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-1">Track and manage your appointment requests</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/patient/dashboard"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back
              </Link>
              <Link
                href="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book New Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'all', label: 'All', count: statusCounts.all },
                { key: 'pending', label: 'Pending', count: statusCounts.pending },
                { key: 'counter-offered', label: 'Needs Response', count: statusCounts['counter-offered'] },
                { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
                { key: 'rejected', label: 'Declined', count: statusCounts.rejected },
                { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    filterStatus === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filterStatus === tab.key
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
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
              type="button"
              onClick={fetchAppointments}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === 'all' ? 'No Appointment Requests' : `No ${filterStatus === 'counter-offered' ? 'Appointments Needing Response' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Appointments`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't made any appointment requests yet." 
                : `You don't have any ${filterStatus === 'counter-offered' ? 'appointments needing your response' : filterStatus + ' appointments'} at the moment.`
              }
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Find a Clinic
            </Link>
          </div>
        )}

        {/* Appointments List */}
        {!loading && !error && filteredAppointments.length > 0 && (
          <div className="space-y-6">
            {filteredAppointments
              .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
              .map((appointment) => (
                <AppointmentStatus
                  key={appointment._id}
                  appointment={appointment}
                  onUpdate={handleAppointmentUpdate}
                />
              ))}
          </div>
        )}

        {/* Refresh Button */}
        {!loading && appointments.length > 0 && (
          <div className="text-center mt-8">
            <button
              type="button"
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