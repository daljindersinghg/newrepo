// app/components/results/ClinicResults.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSimpleTracking } from '../AnalyticsProvider';
import { Button } from '@/components/ui/button';
import { ClinicCard } from './ClinicCard';
import { MapView } from './MapView';
import { clinicApi, ClinicSearchFilters } from '@/lib/api/clinic';
import { useAuth } from '@/providers/AuthProvider';
import { usePatientAuth } from '@/hooks/usePatientAuth';

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
  locationDetails?: {
    latitude: number;
    longitude: number;
    placeId: string;
    formattedAddress: string;
    addressComponents: {
      streetNumber?: string;
      route?: string;
      locality?: string;
      administrativeAreaLevel1?: string;
      administrativeAreaLevel2?: string;
      country?: string;
      postalCode?: string;
    };
    viewport?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
    businessInfo?: {
      businessStatus?: string;
      placeTypes?: string[];
      website?: string;
      phoneNumber?: string;
    };
  };
  searchableAddress?: string[];
  
  // Verification fields - match your actual data
  isVerified?: boolean;      // Your DB has this field
  verificationDate?: string; // Your DB has this field
  
  // Rating fields - your DB has these
  rating?: number;
  reviewCount?: number;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
}

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

export function ClinicResults() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name' | 'relevance'>('distance');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('');
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  const { track } = useSimpleTracking();
  const { showAuthModal } = useAuth();
  const { patientInfo, isAuthenticated } = usePatientAuth();

  useEffect(() => {
    // Get location from localStorage (set by search)
    const savedLocation = localStorage.getItem('searchLocation');
    if (savedLocation) {
      const locationData = JSON.parse(savedLocation);
      setLocation(locationData);
      fetchClinics(locationData);
    } else {
      setError('No search location found. Please search again.');
      setLoading(false);
    }

    // Check if user is not authenticated, show auth prompt after 2 seconds
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowAuthPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const fetchClinics = async (locationData: LocationData, searchTerm?: string) => {
    try {
      setLoading(true);
      
      const searchFilters: ClinicSearchFilters = {
        limit: 50,
        verified: true,
        active: true,
        location: {
          lat: locationData.lat,
          lng: locationData.lng,
          radius: 25 // 25km radius
        },
        sortBy: sortBy,
        search: searchTerm || specialtyFilter || undefined
      };

      // Add services filter if specialty is selected
      if (specialtyFilter) {
        searchFilters.services = [specialtyFilter];
      }

      const response = await clinicApi.searchClinics(searchFilters);
      
      if (response.success) {
        // Sort clinics based on sortBy criteria (if not already sorted by backend)
        const sortedClinics = sortClinics(response.data.clinics, sortBy);
        setClinics(sortedClinics);
        
        track('clinic_results_loaded', {
          location: locationData.address,
          clinic_count: sortedClinics.length,
          specialty_filter: specialtyFilter || 'all',
          sort_by: sortBy,
          search_term: searchTerm || '',
          search_method: response.data.searchMeta?.searchMethod || 'location'
        });
      } else {
        throw new Error(response.message || 'Failed to fetch clinics');
      }
    } catch (err: any) {
      console.error('Error fetching clinics:', err);
      setError(`Failed to load Clinic: ${err.response?.data?.message || err.message}. Please try again.`);
 
    } finally {
      setLoading(false);
    }
  };

  const sortClinics = (clinicList: Clinic[], sortBy: string) => {
    switch (sortBy) {
      case 'rating':
        return [...clinicList].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'name':
        return [...clinicList].sort((a, b) => a.name.localeCompare(b.name));
      case 'relevance':
        // Keep original order for relevance (backend handles this)
        return clinicList;
      case 'distance':
      default:
        // For now, keep original order (backend $near handles distance sorting)
        return clinicList;
    }
  };

  const handleAuthPrompt = () => {
    setShowAuthPrompt(false);
    showAuthModal('signup');
    
    track('auth_prompted', {
      location: location?.address,
      clinics_shown: clinics.length
    });
  };

  const handleReturnToSearch = () => {
    localStorage.removeItem('searchLocation');
    window.location.href = '/';
  };

  const handleSortChange = (newSortBy: 'distance' | 'rating' | 'name' | 'relevance') => {
    setSortBy(newSortBy);
    const sortedClinics = sortClinics(clinics, newSortBy);
    setClinics(sortedClinics);
    
    track('clinic_results_sorted', {
      sort_by: newSortBy,
      location: location?.address,
      clinic_count: clinics.length
    });
  };

  const handleSpecialtyFilter = (specialty: string) => {
    setSpecialtyFilter(specialty);
    if (location) {
      fetchClinics(location, searchQuery);
    }
    
    track('clinic_results_filtered', {
      specialty_filter: specialty || 'all',
      location: location?.address
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location && searchQuery.trim()) {
      fetchClinics(location, searchQuery.trim());
      track('clinic_search_performed', {
        search_term: searchQuery.trim(),
        location: location?.address
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClinicSelect = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    
    // Scroll to clinic card in list
    const clinicElement = document.getElementById(`clinic-${clinicId}`);
    if (clinicElement) {
      clinicElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    track('clinic_selected_from_map', {
      clinic_id: clinicId,
      location: location?.address
    });
  };

  const handleClinicHover = (clinicId: string | null) => {
    // Could add hover effects here
    setSelectedClinicId(clinicId);
  };

  // Get unique services for filter dropdown
  const availableServices = [...new Set(
    clinics.flatMap(clinic => clinic.services)
  )].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
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
            <div className="flex items-center gap-3">
              {/* Toggle Map View */}
              <Button 
                variant="outline" 
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 13l-6-3" />
                </svg>
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
              
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
      </div>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl border">
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4">
                <span className="text-3xl">🦷</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Book an Appointment?
              </h2>
              <p className="text-gray-600">
                Sign up now to book appointments and get your $50 gift card!
              </p>
            </div>

            <Button
              onClick={handleAuthPrompt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mb-4"
            >
              Sign Up to Book Now
            </Button>

            <button
              onClick={() => setShowAuthPrompt(false)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Continue browsing
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {clinics.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🦷</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No dental clinics found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any verified dental clinics in this area yet.
            </p>
            <Button onClick={handleReturnToSearch}>
              Try Different Location
            </Button>
          </div>
        ) : (
          <>
            {/* Results Header with Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {clinics.length} Dental Clinic{clinics.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-gray-600">All clinics are verified and accepting new patients</p>
              </div>
              
              {/* Filters and Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Specialty Filter */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service:
                  </label>
                  <select 
                    value={specialtyFilter}
                    onChange={(e) => handleSpecialtyFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[150px]"
                  >
                    <option value="">All Services</option>
                    {availableServices.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by:
                  </label>
                  <select 
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as 'distance' | 'rating' | 'name' | 'relevance')}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[150px]"
                    aria-label="Sort clinics by"
                    title="Sort clinics by"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="distance">Distance</option>
                    <option value="rating">Rating</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {specialtyFilter && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                    {specialtyFilter}
                    <button 
                      type="button"
                      onClick={() => handleSpecialtyFilter('')}
                      className="hover:bg-blue-200 rounded-full p-1"
                      aria-label="Remove specialty filter"
                      title="Remove filter"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                </div>
              </div>
            )}

            {/* Two Column Layout */}
            <div className={`grid gap-6 ${showMap ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
              
              {/* Left Column - Clinic List */}
              <div className="space-y-6 max-h-[85vh] min-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {clinics.map((clinic, index) => (
                  <div 
                    key={clinic._id}
                    id={`clinic-${clinic._id}`}
                    className={`transition-all duration-200 ${
                      selectedClinicId === clinic._id ? 'ring-1 ring-blue-200 ring-opacity-50' : ''
                    }`}
                    onMouseEnter={() => handleClinicHover(clinic._id)}
                    onMouseLeave={() => handleClinicHover(null)}
                  >
                    <ClinicCard
                      clinic={clinic} 
                      index={index}
                      userEmail={patientInfo?.email || null}
                      isHighlighted={selectedClinicId === clinic._id}
                    />
                  </div>
                ))}
              </div>

              {/* Right Column - Map */}
              {showMap && (
                <div className="sticky top-4 h-[85vh] min-h-[600px]">
                  <MapView
                    clinics={clinics}
                    selectedClinicId={selectedClinicId}
                    onClinicSelect={handleClinicSelect}
                    userLocation={location ? { lat: location.lat, lng: location.lng } : undefined}
                  />
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            {clinics.length > 0 && (
              <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Book Your Appointment?
                </h3>
                <p className="text-gray-600 mb-6">
                  Get your $50 gift card after your first visit through our platform
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
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