'use client';

import { useState, useEffect } from 'react';
import { appointmentApi, Appointment, ClinicResponse } from '@/lib/api/appointments';
import { format } from 'date-fns';

export function ClinicPendingTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Mock clinic ID - in real app this would come from auth context
  const clinicId = "clinic_123";

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await appointmentApi.getClinicRequests(clinicId);
      
      if (result.success) {
        // Filter only pending appointments
        const pendingAppointments = result.appointments.filter(apt => apt.status === 'pending');
        setAppointments(pendingAppointments);
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

  const handleClinicResponse = async (appointmentId: string, response: ClinicResponse) => {
    try {
      setProcessingId(appointmentId);
      const result = await appointmentApi.clinicResponse(appointmentId, response);
      
      if (result.success) {
        // Remove from pending list or update status
        setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
        
        // Show success message
        alert(`Response sent successfully!`);
      } else {
        throw new Error('Failed to send response');
      }
    } catch (err) {
      console.error('Error sending response:', err);
      alert(err instanceof Error ? err.message : 'Failed to send response');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAccept = (appointment: Appointment) => {
    const response: ClinicResponse = {
      responseType: 'confirmation',
      message: `We confirm your appointment for ${format(new Date(appointment.originalRequest.requestedDate), 'MMM d, yyyy')} at ${appointment.originalRequest.requestedTime}.`
    };
    handleClinicResponse(appointment._id, response);
  };

  const handleReject = (appointment: Appointment) => {
    const reason = prompt('Please provide a reason for declining this appointment:');
    if (!reason) return;

    const response: ClinicResponse = {
      responseType: 'rejection',
      message: reason
    };
    handleClinicResponse(appointment._id, response);
  };

  const handleCounterOffer = (appointment: Appointment) => {
    const newDate = prompt('Please enter a new date (YYYY-MM-DD):');
    const newTime = prompt('Please enter a new time (HH:MM):');
    const message = prompt('Optional message to patient:') || 'We would like to suggest an alternative time for your appointment.';

    if (!newDate || !newTime) return;

    const response: ClinicResponse = {
      responseType: 'counter-offer',
      proposedDate: new Date(newDate),
      proposedTime: newTime,
      proposedDuration: appointment.duration,
      message
    };
    handleClinicResponse(appointment._id, response);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        <span className="ml-3 text-gray-600">Loading pending appointments...</span>
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
          onClick={fetchPendingAppointments}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
        <p className="text-gray-600">All appointment requests have been processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Appointment Requests ({appointments.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and respond to patient appointment requests
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.patient.name || appointment.patient.email}
                      </h3>
                      <p className="text-sm text-gray-600">{appointment.patient.email}</p>
                      {appointment.patient.phone && (
                        <p className="text-sm text-gray-600">{appointment.patient.phone}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      Pending Review
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Requested Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Date:</span> {format(new Date(appointment.originalRequest.requestedDate), 'MMM d, yyyy')}</p>
                        <p><span className="font-medium">Time:</span> {appointment.originalRequest.requestedTime}</p>
                        <p><span className="font-medium">Duration:</span> {appointment.duration} minutes</p>
                        <p><span className="font-medium">Type:</span> {appointment.type}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Reason for Visit</h4>
                      <p className="text-sm text-gray-600">
                        {appointment.originalRequest.reason || 'No specific reason provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Requested {format(new Date(appointment.originalRequest.requestedAt), 'MMM d, yyyy \'at\' HH:mm')}
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => handleReject(appointment)}
                        disabled={processingId === appointment._id}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === appointment._id ? 'Processing...' : 'Decline'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleCounterOffer(appointment)}
                        disabled={processingId === appointment._id}
                        className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === appointment._id ? 'Processing...' : 'Suggest Alternative'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleAccept(appointment)}
                        disabled={processingId === appointment._id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === appointment._id ? 'Processing...' : 'Accept'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}