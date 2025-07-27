// apps/web/components/landing/GooglePlacesAutocomplete.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

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

interface GooglePlacesAutocompleteProps {
  onPlaceSelect?: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  minChars?: number;
}

export function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Enter your location",
  className = "",
  debounceMs = 300,
  minChars = 3
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState({
    isLoaded: false,
    isLoading: false,
    error: null as string | null,
    inputValue: '',
    isScriptLoaded: false,
    isSearching: false,
    searchCount: 0,
    needsSetup: false
  });

  // Handle input changes without conflicts
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    
    setState(prev => ({ ...prev, inputValue: newValue }));
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (newValue.length >= minChars) {
      setState(prev => ({ ...prev, isSearching: true }));
      console.log(`⌨️  Typing: "${newValue}" (will search in ${debounceMs}ms)`);
      
      // Set new debounce
      debounceRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, isSearching: false }));
        console.log(`🔍 Search ready for: "${newValue}"`);
      }, debounceMs);
    } else {
      setState(prev => ({ ...prev, isSearching: false }));
    }
  };

  const handleFocus = () => {
    if (!state.isLoaded && !state.isLoading) {
      initializeGoogleMaps();
    }
  };

  const initializeGoogleMaps = () => {
    if (state.isScriptLoaded || state.isLoading) return;
    
    // Check if already loaded
    if ((window as any).google?.maps?.places) {
      setState(prev => ({ ...prev, isLoaded: true, needsSetup: true }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('📡 Google Maps script loaded');
      setState(prev => ({ 
        ...prev, 
        isLoaded: true, 
        isLoading: false, 
        isScriptLoaded: true, 
        needsSetup: true 
      }));
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps script');
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load Google Maps' 
      }));
    };
    
    document.head.appendChild(script);
  };

  const setupAutocomplete = () => {
    if (!inputRef.current || !state.isLoaded || !(window as any).google?.maps?.places) {
      console.log('❌ Cannot setup autocomplete: missing requirements');
      return;
    }

    try {
      const google = (window as any).google;
      
      // Clear any existing autocomplete
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['place_id', 'formatted_address', 'geometry', 'name', 'types']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (place.geometry?.location) {
          const placeResult: PlaceResult = {
            place_id: place.place_id || '',
            formatted_address: place.formatted_address || '',
            geometry: {
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            },
            name: place.name || place.formatted_address || '',
            types: place.types || []
          };

          // Update state AFTER Google Places API sets the value
          setTimeout(() => {
            setState(prev => ({ 
              ...prev, 
              inputValue: place.formatted_address || '',
              searchCount: prev.searchCount + 1,
              isSearching: false
            }));
          }, 100);

          if (onPlaceSelect) {
            onPlaceSelect(placeResult);
          }

          console.log(`✅ Place selected (#${state.searchCount + 1}):`, place.formatted_address);
        }
      });

      setState(prev => ({ ...prev, needsSetup: false }));
      console.log('✅ Google Places Autocomplete initialized successfully');
    } catch (error) {
      console.error('❌ Autocomplete setup error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to setup autocomplete', 
        needsSetup: false 
      }));
    }
  };

  useEffect(() => {
    if (state.needsSetup && state.isLoaded) {
      setTimeout(() => {
        setupAutocomplete();
      }, 150);
    }
  }, [state.needsSetup, state.isLoaded]);

  useEffect(() => {
    if ((window as any).google?.maps?.places) {
      setState(prev => ({ ...prev, isLoaded: true, needsSetup: true }));
    } else {
      initializeGoogleMaps();
    }

    // Cleanup debounce on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      // Cleanup Google Maps listeners
      if (autocompleteRef.current && (window as any).google?.maps?.event) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={state.inputValue}
        disabled={state.isLoading}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className={`w-full pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all ${className} ${
          state.isLoading ? 'bg-gray-100 cursor-not-allowed' : ''
        } ${state.error ? 'border-red-500' : 'hover:border-gray-400'}`}
      />
      
      {/* Right Status Indicator */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        {state.isLoading ? (
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : state.isSearching && state.inputValue.length >= minChars ? (
          <div className="flex items-center gap-1 animate-pulse">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
          </div>
        ) : state.searchCount > 0 ? (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            ✓
          </span>
        ) : (
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>

      {/* Status Messages */}
      {(state.error || state.isLoading || (state.inputValue.length > 0 && state.inputValue.length < minChars)) && (
        <div className="absolute top-full left-0 mt-2 space-y-1">
          {state.error && (
            <div className="text-red-500 text-sm">❌ {state.error}</div>
          )}
          
          {state.isLoading && (
            <div className="text-blue-500 text-sm">📡 Loading Google Maps...</div>
          )}
          
          {!state.isLoading && !state.error && state.inputValue.length > 0 && state.inputValue.length < minChars && (
            <div className="text-gray-400 text-sm">
              💡 Type at least {minChars} characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
}