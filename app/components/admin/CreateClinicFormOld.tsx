// components/admin/CreateClinicForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { adminClinicApi } from '@/lib/api/adminClinic';
import axios from 'axios';

interface ClinicResult {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  rating?: number;
  reviewCount?: number;
  locationDetails?: {
    formattedAddress: string;
    placeId?: string;
  };
  isVerified?: boolean;
  active?: boolean;
}

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

export function CreateClinicForm() {
  const [nameSearch, setNameSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ClinicResult[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<ClinicResult | null>(null);
  const [email, setEmail] = useState('');
  const [acceptedInsurance, setAcceptedInsurance] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);

  // Search for dental clinics using our database
  const handleSearch = async () => {
    if (!nameSearch.trim() && !addressSearch.trim()) {
      setMessage({ type: 'error', text: 'Please enter either a clinic name or address to search' });
      return;
    }
    
    setIsSearching(true);
    setMessage(null);
    
    try {
      const response = await adminClinicApi.searchClinics({
        nameSearch: nameSearch.trim() || undefined,
        addressSearch: addressSearch.trim() || undefined,
        limit: 20
      });

      if (response.success) {
        setSearchResults(response.data.clinics);
        if (response.data.clinics.length === 0) {
          setMessage({ type: 'error', text: 'No clinics found matching your search criteria' });
        }
      } else {
        setSearchResults([]);
        setMessage({ type: 'error', text: response.message || 'Search failed' });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setMessage({ type: 'error', text: 'Search failed. Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClinicSelect = (clinic: ClinicResult) => {
    setSelectedClinic(clinic);
    setEmail(clinic.email || '');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setNameSearch('');
    setAddressSearch('');
    setSearchResults([]);
    setSelectedClinic(null);
    setMessage(null);
  };

  const handleInsuranceToggle = (insurance: string) => {
    setAcceptedInsurance(prev =>
      prev.includes(insurance)
        ? prev.filter(i => i !== insurance)
        : [...prev, insurance]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinic || !email) {
      setMessage({ type: 'error', text: 'Please select a clinic and provide an email address' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics`, {
        clinicId: selectedClinic._id,
        name: selectedClinic.name,
        address: selectedClinic.address,
        phone: selectedClinic.phone,
        email,
        website: selectedClinic.website,
        services: selectedClinic.services,
        acceptedInsurance,
        locationDetails: selectedClinic.locationDetails
      });

      if (response.status >= 200 && response.status < 300) {
        setMessage({ type: 'success', text: 'Clinic added successfully to admin panel!' });
        
        // Reset form
        clearSearch();
        setEmail('');
        setAcceptedInsurance([]);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to add clinic' });
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

  const toggleMode = () => {
    setIsManualMode((prev) => !prev);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add Clinic to Admin Panel</h2>
          <p className="text-gray-600 mt-1">Search for existing dental clinics by name or address</p>
          <button
            onClick={toggleMode}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isManualMode ? 'Switch to Search Mode' : 'Switch to Manual Mode'}
          </button>
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

        <form onSubmit={handleSubmit} className="p-6">
          {isManualMode ? (
            // Manual Clinic Entry Form
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Manual Clinic Entry
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter clinic name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setNameSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter clinic address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setAddressSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="button"
                  onClick={clearSearch}
                  variant="outline"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Create Clinic
                </Button>
              </div>
            </div>
          ) : (
            // Search for Clinic Form
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1. Search for Dental Clinic
              </h3>
              
              <div className="space-y-4">
                {/* Dual Search Bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search by Clinic Name
                    </label>
                    <input
                      type="text"
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                      placeholder="e.g., Dr. Smith Dental, ABC Dentistry"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search by Address
                    </label>
                    <input
                      type="text"
                      value={addressSearch}
                      onChange={(e) => setAddressSearch(e.target.value)}
                      placeholder="e.g., Manhattan, New York, 10001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleSearch}
                    disabled={isSearching || (!nameSearch.trim() && !addressSearch.trim())}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search Clinics
                      </>
                    )}
                  </Button>
                  
                  {(nameSearch || addressSearch || searchResults.length > 0) && (
                    <Button
                      type="button"
                      onClick={clearSearch}
                      variant="outline"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Found {searchResults.length} clinic{searchResults.length !== 1 ? 's' : ''}. Select one to add:
                  </p>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {searchResults.map((clinic) => (
                      <button
                        key={clinic._id}
                        type="button"
                        onClick={() => handleClinicSelect(clinic)}
                        className={`w-full text-left p-4 border rounded-lg hover:bg-blue-50 transition-colors ${
                          selectedClinic?._id === clinic._id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{clinic.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{clinic.address}</p>
                              </div>
                              
                              {/* Status Badges */}
                              <div className="flex flex-col gap-1 ml-4">
                                {clinic.isVerified && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Verified
                                  </span>
                                )}
                                {clinic.active && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Additional Info */}
                            <div className="mt-3 space-y-1">
                              {clinic.phone && (
                                <p className="text-xs text-gray-500">📞 {clinic.phone}</p>
                              )}
                              {clinic.email && (
                                <p className="text-xs text-gray-500">✉️ {clinic.email}</p>
                              )}
                              {clinic.website && (
                                <p className="text-xs text-gray-500">🌐 {clinic.website}</p>
                              )}
                              {clinic.rating && (
                                <div className="flex items-center">
                                  <span className="text-yellow-400 text-sm">★</span>
                                  <span className="text-xs text-gray-500 ml-1">
                                    {clinic.rating} ({clinic.reviewCount} reviews)
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Services */}
                            {clinic.services && clinic.services.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {clinic.services.slice(0, 3).map((service, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      {service}
                                    </span>
                                  ))}
                                  {clinic.services.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      +{clinic.services.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {selectedClinic?._id === clinic._id && (
                            <div className="text-blue-600 ml-3">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Required Info */}
          {selectedClinic && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2. Add Required Information
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-green-800">Selected: {selectedClinic.name}</span>
                </div>
                <p className="text-green-700 text-sm">
                  {selectedClinic.address} • {selectedClinic.isVerified ? 'Verified' : 'Unverified'} • {selectedClinic.active ? 'Active' : 'Inactive'}
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
          {selectedClinic && (
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
              disabled={!selectedClinic || !email || isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Clinic...
                </>
              ) : (
                'Add Clinic to Admin Panel'
              )}
            </Button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What gets added from selected clinic:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Clinic name and address</li>
              <li>• Phone number and website (if available)</li>
              <li>• Location coordinates</li>
              <li>• Services and verification status</li>
              <li>• Insurance accepted (optional)</li>
              <li>• Contact email for admin communications</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}