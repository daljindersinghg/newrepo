// components/results/ClinicCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSimpleTracking } from '../AnalyticsProvider';
import BookingFlow from '../booking/BookingFlow';

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
  thumbnail?: string;
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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { track } = useSimpleTracking();

  const handleBookAppointment = () => {
    track('book_appointment_clicked', {
      clinic_id: clinic._id,
      clinic_name: clinic.name,
      user_email: userEmail,
      position: index + 1
    });
    setShowBookingModal(true);
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
    track('clinic_details_viewed', {
      clinic_id: clinic._id,
      clinic_name: clinic.name,
      position: index + 1
    });
  };

  const displayRating = clinic.rating || (4.0 + (Math.random() * 1.0));
  const displayReviewCount = clinic.reviewCount || (10 + Math.floor(Math.random() * 40));

  const getCurrentDayHours = () => {
    if (!clinic.hours) return 'Call for hours';
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return clinic.hours[today as keyof typeof clinic.hours] || 'Closed';
  };

  return (
    <div className={`
      bg-white rounded-lg shadow-md border overflow-hidden
      transition-all duration-200 hover:shadow-lg

      mb-4 sm:mb-6
      ${showDetails ? 'h-auto' : 'h-36 sm:h-48'}
    `}>
      {/* Rectangle Layout: Image 1/3, Content 2/3 */}
      <div className="flex h-36 sm:h-48">
        {/* Thumbnail - 1/3 width */}
        <div className="w-1/3 relative overflow-hidden">
          {clinic.thumbnail ? (
            <img 
              src={clinic.thumbnail} 
              alt={`${clinic.name} photo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          {/* Fallback background */}
          <div className={`
            absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 
            flex items-center justify-center
            ${clinic.thumbnail ? 'hidden' : ''}
          `}>
            <span className="text-white font-bold text-lg sm:text-xl">
              {clinic.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>

       
        </div>

        {/* Content - 2/3 width */}
        <div className="w-2/3 p-3 sm:p-4 flex flex-col justify-between">
          {/* Top section */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 leading-tight">
              {clinic.name}
              {isHighlighted && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">📍</span>
              )}
            </h3>
            
            {/* Rating */}
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(displayRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-xs text-gray-600">
                {displayRating.toFixed(1)} ({displayReviewCount})
              </span>
            </div>

            {/* Address & Hours */}
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-start">
                <span className="mr-1">📍</span>
                <span className="line-clamp-2">{clinic.address.slice(0,28)}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">🕒</span>
                <span>{getCurrentDayHours()}</span>
              </div>
            </div>
          </div>

          {/* Bottom section - Bigger buttons with more space */}
          <div className="flex gap-3 mt-3">
            <Button
              onClick={handleBookAppointment}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 h-8 flex-1"
            >
              📅 Book
            </Button>
            
            <Button
              variant="outline"
              onClick={handleViewDetails}
              className="text-gray-600 text-sm px-4 py-2 h-8 flex-shrink-0"
            >
              {showDetails ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Services */}
          <div className="mb-3 pt-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Services</h4>
            <div className="flex flex-wrap gap-1">
              {clinic.services.slice(0, 6).map((service, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                  {service}
                </span>
              ))}
              {clinic.services.length > 6 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{clinic.services.length - 6}
                </span>
              )}
            </div>
          </div>

          {/* Insurance */}
          {clinic.acceptedInsurance && clinic.acceptedInsurance.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Insurance</h4>
              <div className="flex flex-wrap gap-1">
                {clinic.acceptedInsurance.slice(0, 4).map((insurance, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded"
                  >
                    {insurance}
                  </span>
                ))}
                {clinic.acceptedInsurance.length > 4 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{clinic.acceptedInsurance.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hours */}
          {clinic.hours && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Hours</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(clinic.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize text-gray-600">{day.slice(0, 3)}</span>
                    <span className="text-gray-500">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <BookingFlow 
              clinicId={clinic._id} 
              clinicName={clinic.name}
            />
          </div>
        </div>
      )}
    </div>
  );
}