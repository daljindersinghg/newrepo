// components/admin/CreateClinicForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GooglePlacesAutocomplete } from '../landing/GooglePlacesAutocomplete';
import { geocodeAddress } from '@/lib/api/geocoding';
import { adminClinicApi } from '@/lib/api/adminClinic';
import axios from 'axios';

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
}

const serviceOptions = [
  'General Dentistry',
  'Teeth Cleaning',
  'Dental Checkups',
  'Fillings',
  'Root Canal',
  'Crowns',
  'Bridges',
  'Dental Implants',
  'Teeth Whitening',
  'Orthodontics',
  'Braces',
  'Invisalign',
  'Oral Surgery',
  'Tooth Extraction',
  'Emergency Dental Care',
  'Pediatric Dentistry',
  'Periodontal Treatment',
  'Dentures',
  'Cosmetic Dentistry',
  'Veneers'
];

const insuranceOptions = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'MetLife',
  'Delta Dental',
  'Humana',
  'United Healthcare',
  'Guardian',
  'Aflac',
  'Principal'
];

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function CreateClinicForm() {
  const [isManualMode, setIsManualMode] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [email, setEmail] = useState('');
  const [acceptedInsurance, setAcceptedInsurance] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual form state
  const [manualForm, setManualForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    services: [] as string[],
    acceptedInsurance: [] as string[],
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  const toggleMode = () => {
    setIsManualMode((prev) => !prev);
    setMessage(null);
  };

  // Search for dental clinics using Google Places
  const handleSearch = async (query: string) => {
    if (query.length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/google-places/search`, {
        params: { query: `${query} dental clinic` }
      });

      if (response.data.success) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceSelect = (place: PlaceResult) => {
    setSelectedPlace(place);
    setSearchResults([]);
  };

  const handleInsuranceToggle = (insurance: string) => {
    setAcceptedInsurance(prev =>
      prev.includes(insurance)
        ? prev.filter(i => i !== insurance)
        : [...prev, insurance]
    );
  };

  // Handle manual form input changes
  const handleManualInputChange = (field: string, value: any) => {
    setManualForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualServiceToggle = (service: string) => {
    setManualForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleManualInsuranceToggle = (insurance: string) => {
    setManualForm(prev => ({
      ...prev,
      acceptedInsurance: prev.acceptedInsurance.includes(insurance)
        ? prev.acceptedInsurance.filter(i => i !== insurance)
        : [...prev.acceptedInsurance, insurance]
    }));
  };

  const handleManualHoursChange = (day: string, value: string) => {
    setManualForm(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  // Geocode address when address changes
  const handleAddressChange = async (address: string) => {
    handleManualInputChange('address', address);
    
    if (address.trim().length > 10) {
      try {
        const result = await geocodeAddress(address);
        if (result.success && result.latitude && result.longitude) {
          setManualForm(prev => ({
            ...prev,
            latitude: result.latitude,
            longitude: result.longitude
          }));
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace || !email) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics/google-places`, {
        placeId: selectedPlace.place_id,
        email,
        acceptedInsurance
      });

      if (response.status >= 200 && response.status < 300) {
        setMessage({ type: 'success', text: 'Clinic created successfully with Google Places data!' });
        
        // Reset form
        setSelectedPlace(null);
        setEmail('');
        setAcceptedInsurance([]);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to create clinic' });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Network error. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!manualForm.name || !manualForm.address || !manualForm.phone || !manualForm.email) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (manualForm.services.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one service' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const clinicData = {
        ...manualForm,
        location: manualForm.latitude && manualForm.longitude ? {
          type: 'Point',
          coordinates: [manualForm.longitude, manualForm.latitude]
        } : undefined
      };

      await adminClinicApi.createClinicManually(clinicData);
      
      setMessage({ type: 'success', text: 'Clinic created successfully!' });
      
      // Reset form
      setManualForm({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        services: [],
        acceptedInsurance: [],
        hours: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: ''
        },
        latitude: undefined,
        longitude: undefined
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create clinic. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Clinic</h2>
              <p className="text-gray-600 mt-1">
                {isManualMode 
                  ? 'Manually enter all clinic details' 
                  : 'Search and auto-populate clinic information from Google'
                }
              </p>
            </div>
            <Button
              onClick={toggleMode}
              variant="outline"
              className="ml-4"
            >
              {isManualMode ? 'Switch to Google Search' : 'Switch to Manual Entry'}
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 m-6 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {isManualMode ? (
          /* Manual Form */
          <form onSubmit={handleManualSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => handleManualInputChange('name', e.target.value)}
                    placeholder="Enter clinic name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={manualForm.phone}
                    onChange={(e) => handleManualInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => handleManualInputChange('email', e.target.value)}
                    placeholder="clinic@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={manualForm.website}
                    onChange={(e) => handleManualInputChange('website', e.target.value)}
                    placeholder="https://www.example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address * 
                  <span className="text-xs text-gray-500 ml-1">(Will be geocoded automatically)</span>
                </label>
                <div className="space-y-2">
                  <GooglePlacesAutocomplete
                    placeholder="Search address with Google Places..."
                    onPlaceSelect={(place) => {
                      if (place.formatted_address) {
                        handleAddressChange(place.formatted_address);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="text-center text-gray-400 text-xs">OR</div>
                  <input
                    type="text"
                    value={manualForm.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    placeholder="Type address manually..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {manualForm.latitude && manualForm.longitude && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Location found: {manualForm.latitude.toFixed(4)}, {manualForm.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Services Offered *</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {serviceOptions.map((service) => (
                  <label key={service} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualForm.services.includes(service)}
                      onChange={() => handleManualServiceToggle(service)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Operating Hours</h3>
              <div className="space-y-3">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-28 text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </div>
                    <input
                      type="text"
                      value={manualForm.hours[day]}
                      onChange={(e) => handleManualHoursChange(day, e.target.value)}
                      placeholder="9:00 AM - 5:00 PM or 'Closed'"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Accepted Insurance (Optional)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {insuranceOptions.map((insurance) => (
                  <label key={insurance} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualForm.acceptedInsurance.includes(insurance)}
                      onChange={() => handleManualInsuranceToggle(insurance)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                    />
                    <span className="text-sm text-gray-700">{insurance}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Clinic...
                  </>
                ) : (
                  'Create Clinic Manually'
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Google Places Search Form */
          <form onSubmit={handleGoogleSubmit} className="p-6">
            {/* Step 1: Search for Clinic */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1. Search for Your Dental Clinic
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search for dental clinic on Google
                  </label>
                  <GooglePlacesAutocomplete
                    placeholder="Type clinic name or address..."
                    onPlaceSelect={(place) => {
                      // Use the Google Places data to search our API
                      handleSearch(place.name || place.formatted_address);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results */}
                {isSearching && (
                  <div className="text-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-2">Searching dental clinics...</p>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Select your clinic:</p>
                    {searchResults.map((place) => (
                      <button
                        key={place.place_id}
                        type="button"
                        onClick={() => handlePlaceSelect(place)}
                        className={`w-full text-left p-4 border rounded-lg hover:bg-blue-50 transition-colors ${
                          selectedPlace?.place_id === place.place_id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{place.name}</h4>
                            <p className="text-sm text-gray-600">{place.formatted_address}</p>
                            {place.rating && (
                              <div className="flex items-center mt-1">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm text-gray-600 ml-1">
                                  {place.rating} ({place.user_ratings_total} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                          {selectedPlace?.place_id === place.place_id && (
                            <div className="text-blue-600">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Required Info */}
            {selectedPlace && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. Add Required Information
                </h3>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-green-800">Selected: {selectedPlace.name}</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    We'll automatically fetch hours, photos, and other details from Google Places.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="clinic@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used for account setup and appointment notifications
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Insurance (Optional) */}
            {selectedPlace && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  3. Insurance Accepted (Optional)
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {insuranceOptions.map((insurance) => (
                    <label key={insurance} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedInsurance.includes(insurance)}
                        onChange={() => handleInsuranceToggle(insurance)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <span className="text-sm text-gray-700">{insurance}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={!selectedPlace || !email || isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Clinic...
                  </>
                ) : (
                  'Create Clinic with Google Data'
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What gets auto-populated:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Clinic name and address</li>
                <li>• Phone number and website</li>
                <li>• Operating hours</li>
                <li>• Photos from Google</li>
                <li>• Location coordinates</li>
                <li>• Basic services (inferred from clinic type)</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
