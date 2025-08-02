'use client';

import { usePatientTracking } from '@/hooks/usePatientTracking';

export function FindClinicsTab() {
  const { trackEvent } = usePatientTracking();

  const handleGoToSearch = () => {
    trackEvent('patient_clinic_search_initiated', {
      source: 'dashboard_find_clinics_tab',
      action: 'go_to_clinic_search'
    });
    
    window.location.href = '/';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Find Dental Clinics</h3>
      <p className="text-gray-600 mb-6">
        Search for dental clinics in your area and book appointments easily.
      </p>
      <button
        type="button"
        onClick={handleGoToSearch}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Go to Clinic Search
      </button>
    </div>
  );
}