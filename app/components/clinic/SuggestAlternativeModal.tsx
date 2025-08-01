'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Appointment, ClinicResponse } from '@/lib/api/appointments';

interface SuggestAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSubmit: (response: ClinicResponse) => void;
  isLoading?: boolean;
}

export function SuggestAlternativeModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onSubmit, 
  isLoading = false 
}: SuggestAlternativeModalProps) {
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [message, setMessage] = useState('We would like to suggest an alternative time for your appointment.');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!proposedDate) {
      newErrors.date = 'Please select a date';
    } else {
      const selectedDate = new Date(proposedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!proposedTime) {
      newErrors.time = 'Please select a time';
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(proposedTime)) {
        newErrors.time = 'Please enter a valid time format (HH:MM)';
      }
    }

    if (!message.trim()) {
      newErrors.message = 'Please provide a message to the patient';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const response: ClinicResponse = {
      responseType: 'counter-offer',
      proposedDate: new Date(proposedDate),
      proposedTime,
      proposedDuration: appointment?.duration,
      message: message.trim()
    };

    onSubmit(response);
    handleClose();
  };

  const handleClose = () => {
    setProposedDate('');
    setProposedTime('');
    setMessage('We would like to suggest an alternative time for your appointment.');
    setErrors({});
    onClose();
  };

  // Generate time slots (9 AM to 5 PM in 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 5:00 PM
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Suggest Alternative Time
            </h3>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {appointment && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Original Request</h4>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Patient:</span> {appointment.patient.name || appointment.patient.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Requested:</span> {format(new Date(appointment.originalRequest.requestedDate), 'MMM d, yyyy')} at {appointment.originalRequest.requestedTime}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {appointment.duration} minutes
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {appointment.type}
              </p>
              {appointment.originalRequest.reason && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reason:</span> {appointment.originalRequest.reason}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div>
              <label htmlFor="proposedDate" className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Date *
              </label>
              <input
                type="date"
                id="proposedDate"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                min={minDate}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label htmlFor="proposedTime" className="block text-sm font-medium text-gray-700 mb-1">
                Proposed Time *
              </label>
              <select
                id="proposedTime"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.time ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time} ({format(new Date(`2000-01-01T${time}`), 'h:mm a')})
                  </option>
                ))}
              </select>
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message to Patient *
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain why you're suggesting an alternative time..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Send Alternative'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}