// components/results/MapView.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  rating?: number;
  reviewCount?: number;
  verified: boolean;
}

interface MapViewProps {
  clinics: Clinic[];
  selectedClinicId?: string;
  onClinicSelect?: (clinicId: string) => void;
  userLocation?: { lat: number; lng: number };
}

export function MapView({ clinics, selectedClinicId, onClinicSelect, userLocation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || isMapLoaded) return;

    const initializeMap = () => {
      if (!(window as any).google?.maps) {
        setMapError('Google Maps failed to load');
        return;
      }

      try {
        // Calculate center point from clinics (prioritize clinic locations)
        let center = { lat: 1.3521, lng: 103.8198 }; // Default Singapore center
        
        if (clinics.length > 0) {
          // Always center on clinics, not user location
          const avgLat = clinics.reduce((sum, clinic) => sum + clinic.location.coordinates[1], 0) / clinics.length;
          const avgLng = clinics.reduce((sum, clinic) => sum + clinic.location.coordinates[0], 0) / clinics.length;
          center = { lat: avgLat, lng: avgLng };
        } else if (userLocation) {
          // Only use user location if no clinics available
          center = userLocation;
        }

        const map = new google.maps.Map(mapRef.current!, {
          center,
          zoom: clinics.length > 0 ? 13 : 12, // Start with appropriate zoom for listings
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'on' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy', // Allow easier map interaction
          restriction: clinics.length > 0 ? {
            // Restrict panning to keep focus on clinic area
            latLngBounds: {
              north: Math.max(...clinics.map(c => c.location.coordinates[1])) + 0.05,
              south: Math.min(...clinics.map(c => c.location.coordinates[1])) - 0.05,
              east: Math.max(...clinics.map(c => c.location.coordinates[0])) + 0.05,
              west: Math.min(...clinics.map(c => c.location.coordinates[0])) - 0.05,
            },
            strictBounds: false, // Allow some flexibility
          } : undefined,
        });

        googleMapRef.current = map;
        
        // Create info window
        infoWindowRef.current = new google.maps.InfoWindow({
          maxWidth: 300
        });

        setIsMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    // Check if Google Maps is already loaded
    if ((window as any).google?.maps) {
      initializeMap();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => setMapError('Failed to load Google Maps');
      document.head.appendChild(script);
    }
  }, [isMapLoaded, userLocation]);

  // Add markers for clinics
  useEffect(() => {
    if (!isMapLoaded || !googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    // Add user location marker if available
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4F46E5" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        }
      });
    }

    // Add clinic markers
    clinics.forEach((clinic) => {
      const position = {
        lat: clinic.location.coordinates[1], // latitude
        lng: clinic.location.coordinates[0]  // longitude
      };

      const isSelected = clinic._id === selectedClinicId;
      
      const marker = new google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: clinic.name,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.58 2 8 5.58 8 10c0 7 8 18 8 18s8-11 8-18c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" 
                    fill="${isSelected ? '#DC2626' : '#2563EB'}" 
                    stroke="white" 
                    stroke-width="1"/>
              ${clinic.verified ? `
                <circle cx="24" cy="8" r="4" fill="#10B981"/>
                <path d="M22 8l1.5 1.5L26 7" stroke="white" stroke-width="1.5" fill="none"/>
              ` : ''}
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        // Create info window content
        const infoContent = `
          <div class="p-3 max-w-sm">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-semibold text-gray-900 text-sm">${clinic.name}</h3>
              ${clinic.verified ? '<span class="text-green-600 text-xs">✓ Verified</span>' : ''}
            </div>
            <p class="text-gray-600 text-xs mb-2">${clinic.address}</p>
            <p class="text-gray-600 text-xs mb-2">📞 ${clinic.phone}</p>
            ${clinic.rating ? `
              <div class="flex items-center mb-2">
                <span class="text-yellow-500 text-sm">★</span>
                <span class="text-xs text-gray-600 ml-1">${clinic.rating} (${clinic.reviewCount || 0} reviews)</span>
              </div>
            ` : ''}
            <button 
              onclick="window.selectClinic('${clinic._id}')" 
              class="w-full bg-blue-600 text-white text-xs py-2 px-3 rounded hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
          </div>
        `;

        infoWindowRef.current?.setContent(infoContent);
        infoWindowRef.current?.open(googleMapRef.current, marker);

        // Call onClinicSelect if provided
        if (onClinicSelect) {
          onClinicSelect(clinic._id);
        }
      });

      markersRef.current.set(clinic._id, marker);
    });

    // Fit map to show all clinic markers (keep focused on listings)
    if (clinics.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      
      // Only include clinic locations in bounds calculation
      clinics.forEach(clinic => {
        bounds.extend({
          lat: clinic.location.coordinates[1],
          lng: clinic.location.coordinates[0]
        });
      });
      
      // Add some padding to the bounds for better visual spacing
      const extendedBounds = new google.maps.LatLngBounds();
      const northeast = bounds.getNorthEast();
      const southwest = bounds.getSouthWest();
      
      const latPadding = (northeast.lat() - southwest.lat()) * 0.1; // 10% padding
      const lngPadding = (northeast.lng() - southwest.lng()) * 0.1; // 10% padding
      
      extendedBounds.extend({
        lat: northeast.lat() + latPadding,
        lng: northeast.lng() + lngPadding
      });
      extendedBounds.extend({
        lat: southwest.lat() - latPadding,
        lng: southwest.lng() - lngPadding
      });
      
      googleMapRef.current.fitBounds(extendedBounds);
      
      // Set appropriate zoom limits based on number of clinics
      const listener = google.maps.event.addListener(googleMapRef.current, 'bounds_changed', () => {
        const currentZoom = googleMapRef.current!.getZoom()!;
        
        if (clinics.length === 1) {
          // Single clinic - zoom in closer
          if (currentZoom > 16) googleMapRef.current!.setZoom(16);
          if (currentZoom < 14) googleMapRef.current!.setZoom(14);
        } else if (clinics.length <= 5) {
          // Few clinics - moderate zoom
          if (currentZoom > 15) googleMapRef.current!.setZoom(15);
          if (currentZoom < 12) googleMapRef.current!.setZoom(12);
        } else {
          // Many clinics - wider view
          if (currentZoom > 14) googleMapRef.current!.setZoom(14);
          if (currentZoom < 10) googleMapRef.current!.setZoom(10);
        }
        
        google.maps.event.removeListener(listener);
      });
      
      // If user location exists, show it but don't include in main bounds
      if (userLocation) {
        // Check if user location is far from clinic area
        const clinicBounds = bounds;
        const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);
        
        if (!clinicBounds.contains(userLatLng)) {
          // User is far from clinics - keep focus on clinics but show user location
          console.log('User location is outside clinic area - keeping focus on clinics');
        }
      }
    }

  }, [isMapLoaded, clinics, selectedClinicId, onClinicSelect, userLocation]);

  // Handle selected clinic change
  useEffect(() => {
    if (!selectedClinicId || !isMapLoaded) return;

    const marker = markersRef.current.get(selectedClinicId);
    if (marker) {
      // Update marker icon to selected style
      marker.setIcon({
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C11.58 2 8 5.58 8 10c0 7 8 18 8 18s8-11 8-18c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" 
                  fill="#DC2626" 
                  stroke="white" 
                  stroke-width="1"/>
            <circle cx="24" cy="8" r="4" fill="#10B981"/>
            <path d="M22 8l1.5 1.5L26 7" stroke="white" stroke-width="1.5" fill="none"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      });

      // Center map on selected clinic
      const clinic = clinics.find(c => c._id === selectedClinicId);
      if (clinic) {
        googleMapRef.current?.panTo({
          lat: clinic.location.coordinates[1],
          lng: clinic.location.coordinates[0]
        });
      }
    }

    // Reset other markers to unselected style
    markersRef.current.forEach((marker, id) => {
      if (id !== selectedClinicId) {
        marker.setIcon({
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C11.58 2 8 5.58 8 10c0 7 8 18 8 18s8-11 8-18c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" 
                    fill="#2563EB" 
                    stroke="white" 
                    stroke-width="1"/>
              <circle cx="24" cy="8" r="4" fill="#10B981"/>
              <path d="M22 8l1.5 1.5L26 7" stroke="white" stroke-width="1.5" fill="none"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        });
      }
    });
  }, [selectedClinicId, isMapLoaded, clinics]);

  // Global function for info window button
  useEffect(() => {
    (window as any).selectClinic = (clinicId: string) => {
      if (onClinicSelect) {
        onClinicSelect(clinicId);
      }
    };

    return () => {
      delete (window as any).selectClinic;
    };
  }, [onClinicSelect]);

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-6">
          <div className="text-gray-400 text-4xl mb-2">🗺️</div>
          <p className="text-gray-600 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Legend & Info */}
      {isMapLoaded && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
          <div className="space-y-2">
            <div className="font-medium text-gray-800 mb-2">
              {clinics.length} Clinic{clinics.length !== 1 ? 's' : ''} in Area
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
              <span>Available Clinics</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
              <span>Selected Clinic</span>
            </div>
            {userLocation && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2"></div>
                <span>Your Location</span>
              </div>
            )}
            <div className="text-gray-500 text-xs mt-2 pt-2 border-t">
              Focused on clinic area
            </div>
          </div>
        </div>
      )}
    </div>
  );
}