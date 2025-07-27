// components/results/DoctorCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSimpleTracking } from '../AnalyticsProvider';

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

interface DoctorCardProps {
  doctor: Doctor;
  index: number;
  userEmail: string | null;
}

export function DoctorCard({ doctor, index, userEmail }: DoctorCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { track } = useSimpleTracking();

  const handleBookAppointment = () => {
    track('book_appointment_clicked', {
      doctor_id: doctor._id,
      doctor_name: doctor.name,
      clinic_name: doctor.clinic.name,
      user_email: userEmail,
      position: index + 1
    });

    // In a real app, this would open a booking modal or navigate to booking page
    alert(`Booking appointment with ${doctor.name}. This would open the booking system.`);
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    track('doctor_details_viewed', {
      doctor_id: doctor._id,
      doctor_name: doctor.name,
      position: index + 1
    });
  };

  const handleClinicWebsite = () => {
    if (doctor.clinic.website) {
      track('clinic_website_clicked', {
        doctor_id: doctor._id,
        clinic_name: doctor.clinic.name,
        website: doctor.clinic.website
      });
      window.open(doctor.clinic.website, '_blank');
    }
  };

  // Generate a mock rating (in real app, this would come from reviews)
  const mockRating = 4.5 + (Math.random() * 0.5);
  const mockReviewCount = 15 + Math.floor(Math.random() * 50);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {/* Doctor Avatar */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-semibold text-xl">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {doctor.name}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(mockRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {mockRating.toFixed(1)} ({mockReviewCount} reviews)
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {doctor.specialties.slice(0, 3).map((specialty, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {doctor.specialties.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{doctor.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verified Badge */}
            {doctor.verified && (
              <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            )}
          </div>

          {/* Clinic Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{doctor.clinic.name}</h4>
                <p className="text-sm text-gray-600 mb-2">📍 {doctor.clinic.address}</p>
                <p className="text-sm text-gray-600">📞 {doctor.clinic.phone}</p>
                
                {/* Services */}
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {doctor.clinic.services.slice(0, 4).map((service, i) => (
                      <span key={i} className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                        {service}
                      </span>
                    ))}
                    {doctor.clinic.services.length > 4 && (
                      <span className="text-xs text-gray-500">+{doctor.clinic.services.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>

              {doctor.clinic.website && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClinicWebsite}
                  className="ml-4"
                >
                  Website
                </Button>
              )}
            </div>
          </div>

          {/* Bio (if expanded) */}
          {showDetails && doctor.bio && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">About {doctor.name.split(' ')[1] || doctor.name}</h5>
              <p className="text-gray-600 text-sm leading-relaxed">{doctor.bio}</p>
            </div>
          )}

          {/* All Specialties (if expanded) */}
          {showDetails && doctor.specialties.length > 3 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">All Specialties</h5>
              <div className="flex flex-wrap gap-2">
                {doctor.specialties.map((specialty, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 lg:min-w-[200px]">
          <Button
            onClick={handleBookAppointment}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            📅 Book Appointment
          </Button>
          
          <Button
            variant="outline"
            onClick={handleViewDetails}
            className="text-gray-700"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>

          {/* Quick Info */}
          <div className="text-center pt-2 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-green-600 mb-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Available Today
            </div>
            <div className="text-xs text-gray-500">
              New patient special: $50 gift card
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}