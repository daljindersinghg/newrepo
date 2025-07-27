// components/results/DoctorResults.tsx
'use client';

import { useState, useEffect } from 'react';

import { useSimpleTracking } from '../AnalyticsProvider';
import { Button } from '@/components/ui/button';
import { EmailCapture } from './EmailCapture';
import { DoctorCard } from './DoctorCard';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  bio?: string;
  status: 'active' | 'pending' | 'suspended';
  verified: boolean;
  clinic: {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    services: string[];
  };
  createdAt: string;
}

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

export function DoctorResults() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailCapture, setShowEmailCapture] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { track } = useSimpleTracking();

  useEffect(() => {
    // Get location from localStorage (set by search)
    const savedLocation = localStorage.getItem('searchLocation');
    if (savedLocation) {
      const locationData = JSON.parse(savedLocation);
      setLocation(locationData);
      fetchDoctors(locationData);
    } else {
      setError('No search location found. Please search again.');
      setLoading(false);
    }

    // Check if user already provided email
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
      setShowEmailCapture(false);
    }
  }, []);

  const fetchDoctors = async (locationData: LocationData) => {
    try {
      setLoading(true);
      
      // For now, fetch all doctors since we don't have location-based filtering in API yet
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors?limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      
      if (data.success) {
        // Filter active doctors only
        const activeDoctors = data.data.doctors.filter((doctor: Doctor) => 
          doctor.status === 'active' && doctor.verified
        );
        setDoctors(activeDoctors);
        
        track('doctor_results_loaded', {
          location: locationData.address,
          doctors_count: activeDoctors.length
        });
      } else {
        throw new Error(data.message || 'Failed to fetch doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setShowEmailCapture(false);
    localStorage.setItem('userEmail', email);
    
    track('email_captured', {
      email,
      location: location?.address,
      doctors_shown: doctors.length
    });
  };

  const handleReturnToSearch = () => {
    localStorage.removeItem('searchLocation');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding Dentists Near You</h2>
          <p className="text-gray-600">Please wait while we search for the best dentists in your area...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleReturnToSearch} className="bg-blue-600 hover:bg-blue-700">
            Return to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dentists Near You
              </h1>
              {location && (
                <p className="text-gray-600 mt-1">
                  📍 {location.address}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={handleReturnToSearch}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              New Search
            </Button>
          </div>
        </div>
      </div>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <EmailCapture
          onSubmit={handleEmailSubmit}
          doctorCount={doctors.length}
          location={location?.address || 'your area'}
        />
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🦷</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No dentists found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any verified dentists in this area yet.
            </p>
            <Button onClick={handleReturnToSearch}>
              Try Different Location
            </Button>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {doctors.length} Dentist{doctors.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-gray-600">All dentists are verified and accepting new patients</p>
              </div>
              
              {/* Filters - Future Enhancement */}
              <div className="flex items-center gap-4">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>Sort by: Distance</option>
                  <option>Sort by: Rating</option>
                  <option>Sort by: Availability</option>
                </select>
              </div>
            </div>

            {/* Doctor Cards */}
            <div className={`grid gap-6 ${showEmailCapture ? 'filter blur-sm pointer-events-none' : ''}`}>
              {doctors.map((doctor, index) => (
                <DoctorCard
                  key={doctor._id} 
                  doctor={doctor} 
                  index={index}
                  userEmail={userEmail}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            {!showEmailCapture && doctors.length > 0 && (
              <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Book Your Appointment?
                </h3>
                <p className="text-gray-600 mb-6">
                  Get your $50 gift card after your first visit through our platform
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Instant booking
                  </div>
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    $50 reward guaranteed
                  </div>
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified professionals
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}