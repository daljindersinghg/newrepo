'use client';

import { useState, useEffect } from 'react';
import { GooglePlacesAutocomplete } from './GooglePlacesAutocomplete';
import { useSimpleTracking } from '../AnalyticsProvider';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number; };
  };
  name: string;
  types: string[];
}

export function EnhancedSearchHero() {
  const [selectedLocation, setSelectedLocation] = useState<PlaceResult | null>(null);
  const { track } = useSimpleTracking();
  const { addSearch, getLastSearch, hasSearchHistory, getRecentSearches } = useSearchHistory();
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    const last = getLastSearch();
    if (last && hasSearchHistory()) {
      setShowPrevious(true);
    }
  }, [getLastSearch, hasSearchHistory]);

  const handleLocationSelect = (place: PlaceResult) => {
    setSelectedLocation(place);
    track('address_selected');
  };

  const doSearch = () => {
    if (!selectedLocation) return;
    track('search_dentists_clicked');
    addSearch({
      address: selectedLocation.formatted_address,
      lat: selectedLocation.geometry.location.lat,
      lng: selectedLocation.geometry.location.lng,
      place_id: selectedLocation.place_id,
    });
    window.location.href = '/results';
  };

  const resumePrevious = () => {
    const last = getLastSearch();
    if (!last) return;
    track('return_to_previous_search_clicked');
    localStorage.setItem('searchLocation', JSON.stringify({
      address: last.address,
      lat: last.lat,
      lng: last.lng,
    }));
    window.location.href = '/results';
  };

  const recent = getRecentSearches(3);

  return (
    <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6 sm:p-8 md:p-12">
      {/* Hero Text */}
      <div className="max-w-xl mx-auto text-center space-y-4 mb-8 sm:mb-12">
        <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium animate-pulse">
          Find Dentists Near You
        </span>
        {/* Adjusted font sizing for better mobile experience */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">Perfect Dentist</span><br/>
          Is Just a Search Away
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-sm mx-auto">
          Enter your address to discover verified dentists with instant booking and same-day availability.
        </p>
      </div>

      {/* Previous Search Card with refined styling and animation */}
      {showPrevious && getLastSearch() && (
        <div className="mt-6 max-w-md mx-auto w-full bg-white shadow-lg rounded-2xl p-5 border border-gray-100 animate-slide-up-fade">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg text-gray-800 font-semibold">Continue Previous Search</h3>
              <p className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-full">{getLastSearch()?.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(getLastSearch()!.searchDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setShowPrevious(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={resumePrevious}
              className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-transform hover:scale-[1.01] active:scale-95"
            >
              Continue
            </button>
            <button
              onClick={() => setShowPrevious(false)}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-transform hover:scale-[1.01] active:scale-95"
            >
              New Search
            </button>
          </div>
        </div>
      )}

      {/* Search Card with refined styling and animation */}
      <div className="mt-8 max-w-lg mx-auto w-full bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-slide-up-fade">
        <label className="flex items-center gap-2 text-gray-700 mb-2">
          <span className="text-2xl">📍</span>
          <span className="font-semibold text-lg">Where are you located?</span>
        </label>

        <GooglePlacesAutocomplete
          placeholder="Type address, city, or ZIP"
          onPlaceSelect={handleLocationSelect}
          className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />

        {/* Recent Searches with hover animation */}
        {!selectedLocation && recent.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <span className="text-base">⏱</span> Recent Searches
            </h4>
            <ul className="space-y-2">
              {recent.map((s, i) => (
                <li key={i}>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                    onClick={() => {
                      setSelectedLocation({
                        formatted_address: s.address,
                        geometry: { location: { lat: s.lat, lng: s.lng } },
                        place_id: s.place_id || '',
                        name: s.address,
                        types: [],
                      });
                      track('recent_search_selected');
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-800">{s.address}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(s.searchDate).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Selected Location Confirmation with slide-in animation */}
        {selectedLocation && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between animate-slide-down-fade">
            <div>
              <h3 className="text-green-800 font-semibold">Location Confirmed</h3>
              <p className="text-sm text-green-700">{selectedLocation.formatted_address}</p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Search button with enhanced disabled state and hover/active animations */}
        <button
          onClick={doSearch}
          disabled={!selectedLocation}
          className={`mt-6 w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
            selectedLocation
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 active:scale-95'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedLocation ? 'Search Dentists' : 'Select an Address First'}
        </button>
      </div>

      {/* Trust Indicators with small animations */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-600 text-sm">
        {['Verified dentists', 'Instant booking', 'Same-day appointments'].map((item) => (
          <div key={item} className="flex items-center gap-1 transition-transform hover:scale-105">
            <span className="text-green-500 text-lg">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}