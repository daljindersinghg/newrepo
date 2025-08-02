'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay, setHours, setMinutes } from 'date-fns';
import { appointmentApi, AppointmentRequest } from '@/lib/api/appointments';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useRouter } from 'next/navigation';

interface TimeSlotRequestPickerProps {
  clinicId: string;
  selectedSlot: Date | null;
  onSlotSelect: (slot: Date | null) => void;
  duration?: number;
  onSuccess?: () => void;
}

export default function TimeSlotRequestPicker({ 
  clinicId, 
  selectedSlot, 
  onSlotSelect, 
  duration = 30,
  onSuccess
}: TimeSlotRequestPickerProps) {
  const { patientInfo } = usePatientAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Countdown effect for redirect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push('/patient/dashboard');
    }
  }, [success, countdown, router]);

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(new Date(), i));
    }
    return days;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(startOfDay(date));
    updateSelectedSlot(date, selectedTime);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    updateSelectedSlot(selectedDate, time);
  };

  const updateSelectedSlot = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slot = setMinutes(setHours(date, hours), minutes);
    onSlotSelect(slot);
  };

  const handleSubmitRequest = async () => {
    if (!selectedSlot || !reason.trim()) {
      setError('Please select a time slot and provide a reason for your visit');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData: AppointmentRequest = {
        patientId: patientInfo?._id, // Include patient ID from auth context
        clinicId: clinicId,
        requestedDate: selectedSlot,
        requestedTime: format(selectedSlot, 'HH:mm'),
        duration,
        type: 'consultation',
        reason: reason.trim()
      };

      const result = await appointmentApi.requestAppointment(requestData);
      
      if (result.success) {
        setSuccess(true);
        setReason('');
        onSlotSelect(null);
        setSelectedTime('09:00');
        setCountdown(5); // Start countdown for redirect
        
        // Remove the auto-close behavior
        // onSuccess callback is no longer called automatically
      } else {
        throw new Error(result.message || 'Failed to submit appointment request');
      }
      
    } catch (err) {
      console.error('Error submitting appointment request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit appointment request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Request Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Your appointment request has been sent to the clinic. They will review and respond soon.
        </p>
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Redirecting to your dashboard in <span className="font-semibold text-blue-600">{countdown}</span> seconds...
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.push('/patient/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard Now
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setCountdown(5);
            }}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Make Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
        <div className="grid grid-cols-7 gap-2">
          {getNext7Days().map((date) => (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDateSelect(date)}
              className={`p-3 text-center rounded-lg border transition-colors ${
                isSameDay(selectedDate, date)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium">
                {format(date, 'EEE')}
              </div>
              <div className="text-sm">
                {format(date, 'MMM d')}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Select Time (30 min slots)
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {generateTimeSlots().map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => handleTimeSelect(time)}
              className={`p-3 text-sm rounded-lg border transition-colors ${
                selectedTime === time
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reason for Visit</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please describe your symptoms or reason for visit..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
          required
        />
      </div>

      {selectedSlot && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Request Summary</h4>
          <div className="text-blue-800 text-sm space-y-1">
            <p><strong>Date:</strong> {format(selectedSlot, 'EEEE, MMMM d, yyyy')}</p>
            <p><strong>Time:</strong> {format(selectedSlot, 'h:mm a')}</p>
            <p><strong>Duration:</strong> {duration} minutes</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmitRequest}
          disabled={loading || !selectedSlot || !reason.trim()}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? 'Submitting...' : 'Send Request'}
        </button>
        
        {selectedSlot && (
          <button
            type="button"
            onClick={() => {
              onSlotSelect(null);
              setReason('');
              setError(null);
            }}
            className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        This sends a request to the clinic. They will confirm or suggest alternative times.
      </p>
    </div>
  );
}