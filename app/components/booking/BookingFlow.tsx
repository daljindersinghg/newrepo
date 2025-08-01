'use client';

import { useState } from 'react';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useAuth } from '@/providers/AuthProvider';
import TimeSlotRequestPicker from './TimeSlotRequestPicker';

interface BookingFlowProps {
  clinicId: string;
  clinicName?: string;
  onClose?: () => void;
}

export default function BookingFlow({ clinicId, clinicName, onClose }: BookingFlowProps) {
  const { patientInfo, isAuthenticated, isLoading } = usePatientAuth();
  const { showAuthModal } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Request Appointment
          {clinicName && <span className="block text-lg font-normal text-gray-600 mt-1">at {clinicName}</span>}
        </h2>
        
        <div className="text-center">
          <p className="text-gray-600 mb-6">Please sign up or log in to request an appointment</p>
          
          <button
            type="button"
            onClick={() => showAuthModal('login')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign Up / Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Request Appointment
        {clinicName && <span className="block text-lg font-normal text-gray-600 mt-1">at {clinicName}</span>}
      </h2>
      
      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800">
          Welcome back, {patientInfo?.name || patientInfo?.email}!
        </p>
      </div>

      <TimeSlotRequestPicker
        clinicId={clinicId}
        selectedSlot={selectedSlot}
        onSlotSelect={setSelectedSlot}
        duration={30}
        onSuccess={onClose}
      />
    </div>
  );
}