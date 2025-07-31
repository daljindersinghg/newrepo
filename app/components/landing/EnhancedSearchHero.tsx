// src/components/landing/EnhancedSearchHero.tsx
'use client';

import { useState, useEffect } from 'react';
import { GooglePlacesAutocomplete } from './GooglePlacesAutocomplete';
import { useSimpleTracking } from '../AnalyticsProvider';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
}

export function EnhancedSearchHero() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { track } = useSimpleTracking();
  const { addSearch, getLastSearch, hasSearchHistory, getRecentSearches } = useSearchHistory();
  const [showPreviousSearch, setShowPreviousSearch] = useState(false);

  useEffect(() => {
    // Check if there's a previous search on mount
    const lastSearch = getLastSearch();
    if (lastSearch && hasSearchHistory()) {
      setShowPreviousSearch(true);
    }
  }, []);

  const handleLocationSelect = (place) => {
    setSelectedLocation(place);
    track('address_selected');
    console.log('📍 Address selected:', place.formatted_address);
  };

  const handleSearch = () => {
    if (selectedLocation) {
      track('search_dentists_clicked');
      
      // Add to search history
      addSearch({
        address: selectedLocation.formatted_address,
        lat: selectedLocation.geometry.location.lat,
        lng: selectedLocation.geometry.location.lng,
        place_id: selectedLocation.place_id
      });
      
      // Navigate to results
      window.location.href = '/results';
    }
  };

  const handleReturnToPreviousSearch = () => {
    const lastSearch = getLastSearch();
    if (lastSearch) {
      track('return_to_previous_search_clicked');
      
      // Set current search location for results page
      localStorage.setItem('searchLocation', JSON.stringify({
        address: lastSearch.address,
        lat: lastSearch.lat,
        lng: lastSearch.lng
      }));
      
      window.location.href = '/results';
    }
  };

  const recentSearches = getRecentSearches(3);
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23e0e7ff' fillOpacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}
      ></div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Find Dentists Near You
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Perfect Dentist
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Enter your address to find verified dentists in your area with instant booking and same-day availability.
          </p>
        </div>

        {/* Previous Search Section */}
        {showPreviousSearch && getLastSearch() && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xl">🔄</span>
                  </div>
                  <div>
                    <h3 className="text-blue-800 font-semibold text-lg mb-2">Continue Previous Search</h3>
                    <p className="text-blue-700 text-base font-medium">
                      {getLastSearch()?.address}
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      Searched on {new Date(getLastSearch()?.searchDate || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviousSearch(false)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-full transition-colors"
                  aria-label="Dismiss previous search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleReturnToPreviousSearch}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Continue Search
                </button>
                <button
                  onClick={() => setShowPreviousSearch(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  New Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-12">
            
            {/* Address Input */}
            <div className="space-y-6">
              <div className="text-center">
                <label className="flex items-center justify-center gap-3 text-gray-700 font-semibold text-xl mb-6">
                  <span className="text-3xl">📍</span>
                  Where are you located?
                </label>
              </div>

              {/* Google Places Input - Removed duplicate icon styling */}
              <div className="relative">
                <GooglePlacesAutocomplete
                  placeholder="Start typing your address, city, or ZIP code..."
                  onPlaceSelect={handleLocationSelect}
                  className="text-gray-900 text-lg h-16 px-6 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all duration-200 shadow-sm w-full"
                />
              </div>

              {/* Helper Text */}
              <p className="text-center text-gray-500 text-sm">
                💡 Type any address and we'll show you suggestions
              </p>

              {/* Recent Searches */}
              {!selectedLocation && recentSearches.length > 0 && (
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <h4 className="text-gray-700 font-medium text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Recent Searches
                  </h4>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedLocation({
                            formatted_address: search.address,
                            geometry: {
                              location: {
                                lat: search.lat,
                                lng: search.lng
                              }
                            },
                            place_id: search.place_id || '',
                            name: search.address,
                            types: []
                          });
                          track('recent_search_selected');
                        }}
                        className="w-full text-left p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm">📍</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-medium text-sm truncate">{search.address}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(search.searchDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-2xl">✓</span>
                    </div>
                    <div>
                      <h3 className="text-green-800 font-semibold text-lg mb-2">Perfect! Location confirmed</h3>
                      <p className="text-green-700 text-base font-medium">
                        {selectedLocation.formatted_address}
                      </p>
                      <p className="text-green-600 text-sm mt-2 font-mono bg-green-100 px-2 py-1 rounded inline-block">
                        {selectedLocation.geometry.location.lat.toFixed(4)}, {selectedLocation.geometry.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-full transition-colors"
                    aria-label="Clear location"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Search Button */}
            <div className="mt-8">
              <button
                onClick={handleSearch}
                disabled={!selectedLocation}
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {selectedLocation ? (
                  <>
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Dentists Near This Location
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Please select an address first
                  </>
                )}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-lg">✓</span>
                <span>Verified dentists</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500 text-lg">✓</span>
                <span>Instant booking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500 text-lg">✓</span>
                <span>Same-day appointments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-white/70 backdrop-blur rounded-2xl px-8 py-4 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">50K+</div>
              <div className="text-sm text-gray-600">Happy patients</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2,500+</div>
              <div className="text-sm text-gray-600">Partner dentists</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4.9★</div>
              <div className="text-sm text-gray-600">Average rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}