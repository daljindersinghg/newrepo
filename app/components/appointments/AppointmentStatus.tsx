'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Appointment, appointmentApi } from '@/lib/api/appointments';

interface AppointmentStatusProps {
  appointment: Appointment;
  onUpdate?: (updatedAppointment: Appointment) => void;
}

export default function AppointmentStatus({ appointment, onUpdate }: AppointmentStatusProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'counter-offered': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for Clinic Response';
      case 'counter-offered': return 'Alternative Time Suggested';
      case 'confirmed': return 'Confirmed';
      case 'rejected': return 'Request Declined';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handlePatientResponse = async (responseType: 'accept' | 'reject') => {
    setLoading(true);
    setError(null);

    try {
      const result = await appointmentApi.patientResponse(appointment._id, {
        responseType,
        message: responseMessage.trim() || undefined
      });

      if (result.success && onUpdate) {
        onUpdate(result.appointment);
        setShowResponse(false);
        setResponseMessage('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond to clinic');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment request?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await appointmentApi.cancelAppointment(appointment._id, 'Cancelled by patient');
      if (result.success && onUpdate) {
        onUpdate(result.appointment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const latestClinicResponse = appointment.clinicResponses[appointment.clinicResponses.length - 1];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{appointment.clinic.name}</h3>
          <p className="text-sm text-gray-600">{appointment.clinic.address}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {getStatusText(appointment.status)}
        </span>
      </div>

      {/* Original Request */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Your Request</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>Date:</strong> {format(new Date(appointment.originalRequest.requestedDate), 'EEEE, MMMM d, yyyy')}</p>
          <p><strong>Time:</strong> {appointment.originalRequest.requestedTime}</p>
          <p><strong>Duration:</strong> {appointment.originalRequest.duration} minutes</p>
          <p><strong>Type:</strong> {appointment.type}</p>
          <p><strong>Reason:</strong> {appointment.originalRequest.reason}</p>
        </div>
      </div>

      {/* Clinic Response */}
      {latestClinicResponse && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Clinic Response</h4>
          <div className="space-y-2 text-sm">
            {latestClinicResponse.responseType === 'counter-offer' && (
              <div className="text-blue-800">
                <p><strong>Suggested Date:</strong> {latestClinicResponse.proposedDate ? format(new Date(latestClinicResponse.proposedDate), 'EEEE, MMMM d, yyyy') : 'Same date'}</p>
                <p><strong>Suggested Time:</strong> {latestClinicResponse.proposedTime || appointment.originalRequest.requestedTime}</p>
                <p><strong>Duration:</strong> {latestClinicResponse.proposedDuration || appointment.originalRequest.duration} minutes</p>
              </div>
            )}
            <p className="text-blue-700">{latestClinicResponse.message}</p>
            <p className="text-xs text-blue-600">
              Responded {format(new Date(latestClinicResponse.respondedAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      )}

      {/* Confirmed Details */}
      {appointment.confirmedDetails && (
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Confirmed Appointment</h4>
          <div className="space-y-1 text-sm text-green-800">
            <p><strong>Date:</strong> {format(new Date(appointment.confirmedDetails.finalDate), 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> {appointment.confirmedDetails.finalTime}</p>
            <p><strong>Duration:</strong> {appointment.confirmedDetails.finalDuration} minutes</p>
            <p className="text-xs text-green-600 mt-2">
              Confirmed {format(new Date(appointment.confirmedDetails.confirmedAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {appointment.status === 'counter-offered' && !showResponse && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowResponse(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Respond to Clinic
          </button>
        </div>
      )}

      {/* Response Form */}
      {showResponse && appointment.status === 'counter-offered' && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Respond to Clinic's Suggestion</h4>
          
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            placeholder="Add a message (optional)..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            rows={3}
          />

          <div className="flex gap-3">
            <button
              onClick={() => handlePatientResponse('accept')}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Accepting...' : 'Accept Alternative Time'}
            </button>
            
            <button
              onClick={() => handlePatientResponse('reject')}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Declining...' : 'Decline'}
            </button>
            
            <button
              onClick={() => {
                setShowResponse(false);
                setResponseMessage('');
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {['pending', 'counter-offered'].includes(appointment.status) && (
        <div className="border-t pt-4">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Cancel Request'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Request Info */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <p>Requested {format(new Date(appointment.createdAt), 'MMM d, yyyy h:mm a')}</p>
        {appointment.lastActivityAt !== appointment.createdAt && (
          <p>Last updated {format(new Date(appointment.lastActivityAt), 'MMM d, yyyy h:mm a')}</p>
        )}
      </div>
    </div>
  );
}