// components/landing/EnhancedSearchHero.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSimpleTracking } from '../AnalyticsProvider';
import { usePatientTracking } from '@/hooks/usePatientTracking';
import { useSearchHistory } from '@/hooks/useSearchHistory';

// Lazy-load GooglePlacesAutocomplete on the client only
const GooglePlacesAutocomplete = dynamic(
  () => import('./GooglePlacesAutocomplete'),
  { ssr: false }
);

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  name: string;
  types: string[];
}

export function EnhancedSearchHero() {
  const [selectedLocation, setSelectedLocation] = useState<PlaceResult | null>(null);
  const { track } = useSimpleTracking();
  const { trackSearch, trackEvent } = usePatientTracking();
  const { addSearch, getLastSearch, hasSearchHistory, getRecentSearches } = useSearchHistory();
  const [showPrevious, setShowPrevious] = useState(false);

  useEffect(() => {
    trackEvent('landing_page_viewed', {
      page_section: 'search_hero',
      has_search_history: hasSearchHistory(),
    });

    const last = getLastSearch();
    if (last && hasSearchHistory()) {
      setShowPrevious(true);
    }
  }, [getLastSearch, hasSearchHistory, trackEvent]);

  const handleLocationSelect = (place: PlaceResult) => {
    setSelectedLocation(place);
    track('address_selected');
    trackEvent('location_selected', {
      address: place.formatted_address,
      place_id: place.place_id,
      location_types: place.types,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
    });
  };

  const doSearch = () => {
    if (!selectedLocation) return;
    track('search_dentists_clicked');
    trackSearch('dentist_search', selectedLocation.formatted_address, []);
    trackEvent('dentist_search_initiated', {
      address: selectedLocation.formatted_address,
      place_id: selectedLocation.place_id,
      search_method: 'new_search',
      coordinates: {
        lat: selectedLocation.geometry.location.lat,
        lng: selectedLocation.geometry.location.lng,
      },
    });

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
    trackEvent('previous_search_resumed', {
      previous_address: last.address,
      search_method: 'resume_previous',
      coordinates: { lat: last.lat, lng: last.lng },
    });
    localStorage.setItem(
      'searchLocation',
      JSON.stringify({ address: last.address, lat: last.lat, lng: last.lng })
    );
    window.location.href = '/results';
  };

  const recent = getRecentSearches(3);

  return (
    <section className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-brand-light to-brand-secondary p-6 sm:p-8 md:p-12">
      {/* Hero Text */}
      <div className="max-w-xl mx-auto text-center space-y-4 mb-8 sm:mb-12">
        <span className="inline-block px-4 py-1 bg-brand-secondary text-brand-primary rounded-full text-xs font-medium animate-pulse">
          Find Dentists Near You
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
          Your <span className="text-transparent bg-clip-text bg-gradient-brand">Perfect Dentist</span><br />
          Is Just a Search Away
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-sm mx-auto">
          Enter your address to discover verified dentists with instant booking and same-day availability.
        </p>
      </div>

      {/* Search Card */}
      <div className="mt-8 max-w-lg mx-auto w-full bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-slide-up-fade">
        <label className="flex items-center gap-2 text-gray-700 mb-2">
          <span className="text-2xl">📍</span>
          <span className="font-semibold text-lg">Enter your location</span>
        </label>

        <GooglePlacesAutocomplete
          placeholder="Enter your location"
          onPlaceSelect={handleLocationSelect}
          className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-light transition"
          showCurrentLocationButton={true}
        />

        {/* Recent Searches */}
        {!selectedLocation && recent.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <span className="text-base">⏱</span> Recent Searches
            </h4>
            <ul className="space-y-2">
              {recent.map((s, i) => (
                <li key={i}>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-brand-light rounded-lg transition-all duration-200 hover:scale-[1.01]"
                    onClick={() => {
                      setSelectedLocation({
                        place_id: s.place_id || '',
                        formatted_address: s.address,
                        geometry: { location: { lat: s.lat, lng: s.lng } },
                        name: s.address,
                        types: [],
                      });
                      track('recent_search_selected');
                      trackEvent('recent_search_selected', {
                        address: s.address,
                        search_date: s.searchDate,
                        coordinates: { lat: s.lat, lng: s.lng },
                        selection_method: 'recent_history',
                      });
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

        {/* Confirmation */}
        {selectedLocation && (
          <div className="mt-4 p-4 bg-brand-light rounded-lg border border-brand-secondary flex items-center justify-between animate-slide-down-fade">
            <div>
              <h3 className="text-brand-primary font-semibold">Location Confirmed</h3>
              <p className="text-sm text-gray-700">{selectedLocation.formatted_address}</p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-brand-primary hover:text-brand-accent transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={doSearch}
          disabled={!selectedLocation}
          className={`mt-6 w-full py-3 font-semibold rounded-xl transition-all duration-300 ${
            selectedLocation
              ? 'bg-gradient-brand text-white hover:opacity-90 active:scale-95'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedLocation ? 'Search Dentists' : 'Select an Address First'}
        </button>
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-600 text-sm">
        {['Verified dentists', 'Instant booking', 'Same-day appointments'].map((item) => (
          <div key={item} className="flex items-center gap-1 transition-transform hover:scale-105">
            <span className="text-brand-primary text-lg">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
