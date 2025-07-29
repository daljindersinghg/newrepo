// components/results/ClinicCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSimpleTracking } from '../AnalyticsProvider';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  services: string[];
  acceptedInsurance?: string[];
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'pending' | 'suspended';
  verified: boolean;
  createdAt: string;
}

interface ClinicCardProps {
  clinic: Clinic;
  index: number;
  userEmail: string | null;
  isHighlighted?: boolean;
}

export function ClinicCard({ clinic, index, userEmail, isHighlighted = false }: ClinicCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { track } = useSimpleTracking();

  const handleBookAppointment = () => {
    track('book_appointment_clicked', {
      clinic_id: clinic._id,
      clinic_name: clinic.name,
      user_email: userEmail,
      position: index + 1
    });

    // In a real app, this would open a booking modal or navigate to booking page
    alert(`Booking appointment with ${clinic.name}. This would open the booking system.`);
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    track('clinic_details_viewed', {
      clinic_id: clinic._id,
      clinic_name: clinic.name,
      position: index + 1
    });
  };

  const handleClinicWebsite = () => {
    if (clinic.website) {
      track('clinic_website_clicked', {
        clinic_id: clinic._id,
        clinic_name: clinic.name,
        website: clinic.website
      });
      window.open(clinic.website, '_blank');
    }
  };

  const handleGetDirections = () => {
    if (clinic.location) {
      const lat = clinic.location.coordinates[1];
      const lng = clinic.location.coordinates[0];
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      
      track('directions_clicked', {
        clinic_id: clinic._id,
        clinic_name: clinic.name,
        coordinates: clinic.location.coordinates
      });
      
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Generate mock rating if not available
  const displayRating = clinic.rating || (4.0 + (Math.random() * 1.0));
  const displayReviewCount = clinic.reviewCount || (10 + Math.floor(Math.random() * 40));

  const getCurrentDayHours = () => {
    if (!clinic.hours) return 'Call for hours';
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return clinic.hours[today as keyof typeof clinic.hours] || 'Closed';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all duration-200 ${
      isHighlighted ? 'border-blue-500 shadow-blue-100' : 'border-gray-200'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Clinic Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {/* Clinic Logo/Icon */}
              <div className={`w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4 ${
                isHighlighted ? 'ring-2 ring-blue-400' : ''
              }`}>
                <span className="text-blue-600 font-semibold text-xl">
                  {clinic.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {clinic.name}
                  {isHighlighted && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      📍 Selected on map
                    </span>
                  )}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(displayRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {displayRating.toFixed(1)} ({displayReviewCount} reviews)
                  </span>
                </div>

                {/* Address and Contact */}
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">📍</span>
                    {clinic.address}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">📞</span>
                    <a href={`tel:${clinic.phone}`} className="hover:text-blue-600 transition-colors">
                      {clinic.phone}
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-1">🕒</span>
                    Today: {getCurrentDayHours()}
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Badge */}
            {clinic.verified && (
              <div className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            )}
          </div>

          {/* Services */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
            <div className="flex flex-wrap gap-2">
              {clinic.services.slice(0, 6).map((service, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {service}
                </span>
              ))}
              {clinic.services.length > 6 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{clinic.services.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Insurance (if expanded) */}
          {showDetails && clinic.acceptedInsurance && clinic.acceptedInsurance.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Accepted Insurance</h5>
              <div className="flex flex-wrap gap-2">
                {clinic.acceptedInsurance.map((insurance, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
                  >
                    {insurance}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hours (if expanded) */}
          {showDetails && clinic.hours && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Hours</h5>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {Object.entries(clinic.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize font-medium">{day}:</span>
                    <span className="text-gray-600">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Distance info (if available) */}
          {clinic.location && (
            <div className="text-xs text-gray-500 mb-4">
              📍 Location: {clinic.location.coordinates[1].toFixed(4)}, {clinic.location.coordinates[0].toFixed(4)}
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

          <div className="grid grid-cols-2 gap-2">
            {clinic.website && (
              <Button
                variant="outline"
                onClick={handleClinicWebsite}
                className="text-blue-600 text-sm"
                size="sm"
              >
                🌐 Website
              </Button>
            )}

            {clinic.location && (
              <Button
                variant="outline"
                onClick={handleGetDirections}
                className="text-green-600 text-sm"
                size="sm"
              >
                🗺️ Directions
              </Button>
            )}
          </div>

          {/* Quick Info */}
          <div className="text-center pt-2 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-green-600 mb-1">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Same-day appointments
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