'use client';

import { useState, useEffect } from 'react';
import { appointmentApi, Appointment } from '@/lib/api/appointments';
import { format } from 'date-fns';
import { useClinicAuth } from '@/hooks/useClinicAuth';

export function ClinicAppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { clinic } = useClinicAuth();

  // Get clinic ID from authenticated clinic data
  const clinicId = clinic?.id;

  useEffect(() => {
    if (clinicId) {
      fetchAppointments();
    }
  }, [clinicId]);

  const fetchAppointments = async () => {
    if (!clinicId) {
      setError('Clinic ID not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await appointmentApi.getClinicRequests(clinicId);
      
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        <span className="ml-3 text-gray-600">Loading appointments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'counter-offered', label: 'Awaiting Patient', count: statusCounts['counter-offered'] },
              { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
              { key: 'rejected', label: 'Declined', count: statusCounts.rejected },
              { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filterStatus === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    filterStatus === tab.key
                      ? 'bg-green-100 text-green-600'
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

      {/* Empty State */}
      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterStatus === 'all' ? 'No Appointments' : `No ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1).replace('-', ' ')} Appointments`}
          </h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? "No appointment requests have been received yet." 
              : `No ${filterStatus.replace('-', ' ')} appointments at the moment.`
            }
          </p>
        </div>
      )}

      {/* Appointments List */}
      {filteredAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {filterStatus === 'all' ? 'All Appointments' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1).replace('-', ' ')} Appointments`} ({filteredAppointments.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredAppointments
              .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
              .map((appointment) => (
                <div key={appointment._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {appointment.patient.name || appointment.patient.email}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.patient.email}</p>
                          {appointment.patient.phone && (
                            <p className="text-sm text-gray-600">{appointment.patient.phone}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'counter-offered' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          appointment.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'pending' ? 'Needs Review' :
                           appointment.status === 'counter-offered' ? 'Awaiting Patient' :
                           appointment.status === 'confirmed' ? 'Confirmed' :
                           appointment.status === 'rejected' ? 'Declined' :
                           appointment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Requested Time</h4>
                          <p className="text-sm text-gray-600">
                            {format(new Date(appointment.originalRequest.requestedDate), 'MMM d, yyyy')} at {appointment.originalRequest.requestedTime}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Duration & Type</h4>
                          <p className="text-sm text-gray-600">
                            {appointment.duration} minutes • {appointment.type}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Requested</h4>
                          <p className="text-sm text-gray-600">
                            {format(new Date(appointment.originalRequest.requestedAt), 'MMM d, yyyy \'at\' HH:mm')}
                          </p>
                        </div>
                      </div>

                      {appointment.originalRequest.reason && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Reason for Visit</h4>
                          <p className="text-sm text-gray-600">{appointment.originalRequest.reason}</p>
                        </div>
                      )}

                      {/* Show clinic responses */}
                      {appointment.clinicResponses && appointment.clinicResponses.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Clinic Response</h4>
                          <div className="bg-gray-50 rounded-lg p-3 mt-1">
                            {appointment.clinicResponses.map((response, index) => (
                              <div key={index} className="text-sm">
                                <p className="text-gray-600">{response.message}</p>
                                {response.proposedDate && (
                                  <p className="text-gray-600 mt-1">
                                    <span className="font-medium">Suggested:</span> {format(new Date(response.proposedDate), 'MMM d, yyyy')} at {response.proposedTime}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show patient responses */}
                      {appointment.patientResponses && appointment.patientResponses.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Patient Response</h4>
                          <div className="bg-blue-50 rounded-lg p-3 mt-1">
                            {appointment.patientResponses.map((response, index) => (
                              <div key={index} className="text-sm">
                                <p className="text-blue-700 font-medium capitalize">{response.responseType}ed</p>
                                {response.message && <p className="text-blue-600 mt-1">{response.message}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      {appointments.length > 0 && (
        <div className="text-center">
          <button
            type="button"
            onClick={fetchAppointments}
            className="text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Refresh Appointments
          </button>
        </div>
      )}
    </div>
  );
}