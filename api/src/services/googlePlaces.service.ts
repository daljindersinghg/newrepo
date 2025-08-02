// api/src/services/googlePlaces.service.ts (Fixed version)
import axios from 'axios';

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    weekday_text: string[];
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types: string[];
}

// interface LocationDetails {
//   latitude: number;
//   longitude: number;
//   placeId: string;
//   formattedAddress: string;
//   addressComponents: {
//     streetNumber?: string;
//     route?: string;
//     locality?: string;
//     administrativeAreaLevel1?: string;
//     administrativeAreaLevel2?: string;
//     country?: string;
//     postalCode?: string;
//   };
//   viewport?: {
//     northeast: { lat: number; lng: number };
//     southwest: { lat: number; lng: number };
//   };
//   businessInfo?: {
//     businessStatus?: string;
//     placeTypes?: string[];
//     website?: string;
//     phoneNumber?: string;
//   };
// }

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY!;
    if (!this.apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY environment variable is required');
    }
  }
  generateThumbnail(placeDetails: PlaceDetails): string {
    // First priority: Get the first photo from Google Places (business photo)
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      return this.getPhotoUrl(placeDetails.photos[0].photo_reference, 300);
    }
    
    // Fallback: Generate static map if no photos available
    return `https://maps.googleapis.com/maps/api/staticmap?center=${placeDetails.geometry.location.lat},${placeDetails.geometry.location.lng}&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C${placeDetails.geometry.location.lat},${placeDetails.geometry.location.lng}&key=${this.apiKey}`;
  }

  /**
   * Get detailed information about a place using Place ID
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const fields = [
        'place_id',
        'name',
        'formatted_address',
        'formatted_phone_number',
        'website',
        'opening_hours',
        'photos',
        'rating',
        'user_ratings_total',
        'business_status',
        'geometry',
        'address_components',
        'types'
      ].join(',');

      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: fields,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK' && response.data.result) {
        return response.data.result;
      }

      console.error('Google Places API error:', response.data.status, response.data.error_message);
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `${this.baseUrl}/photo?photoreference=${photoReference}&maxwidth=${maxWidth}&key=${this.apiKey}`;
  }

  /**
   * Search for places by text query
   */
  async searchPlaces(query: string, location?: { lat: number; lng: number }, radius: number = 50000) {
    try {
      const params: any = {
        query: query,
        key: this.apiKey,
        fields: 'place_id,name,formatted_address,rating,geometry',
        region: 'ca'  // Restrict results to Canada
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = radius;
      }

      const response = await axios.get(`${this.baseUrl}/textsearch/json`, { params });

      if (response.data.status === 'OK') {
        return response.data.results;
      }

      return [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  /**
   * Convert Google opening hours to our format
   */
  parseOpeningHours(openingHours?: PlaceDetails['opening_hours']) {
    if (!openingHours || !openingHours.weekday_text) {
      return {
        monday: 'Closed',
        tuesday: 'Closed',
        wednesday: 'Closed',
        thursday: 'Closed',
        friday: 'Closed',
        saturday: 'Closed',
        sunday: 'Closed'
      };
    }

    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const hours: any = {};

    // Initialize all days as closed
    dayMap.forEach(day => {
      hours[day] = 'Closed';
    });

    // Parse Google's weekday_text format
    openingHours.weekday_text.forEach(dayText => {
      const [dayName, timeText] = dayText.split(': ');
      const dayKey = dayName.toLowerCase();
      
      if (dayMap.includes(dayKey)) {
        hours[dayKey] = timeText === 'Closed' ? 'Closed' : timeText;
      }
    });

    return hours;
  }

  /**
   * Extract and format address components
   */
  parseAddressComponents(addressComponents: PlaceDetails['address_components']) {
    const components: any = {};
    
    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        components.route = component.long_name;
      }
      if (types.includes('locality')) {
        components.locality = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        components.administrativeAreaLevel1 = component.long_name;
      }
      if (types.includes('administrative_area_level_2')) {
        components.administrativeAreaLevel2 = component.long_name;
      }
      if (types.includes('country')) {
        components.country = component.long_name;
      }
      if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
    });
    
    return components;
  }

  /**
   * Get clinic-specific information and auto-populate data
   */
async getClinicData(placeId: string) {
    const placeDetails = await this.getPlaceDetails(placeId);
    if (!placeDetails) return null;

    const clinicData = {
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      phone: placeDetails.formatted_phone_number || '',
      website: placeDetails.website || '',
      
      location: {
        type: 'Point' as const,
        coordinates: [placeDetails.geometry.location.lng, placeDetails.geometry.location.lat] as [number, number]
      },
      
      locationDetails: {
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng,
        placeId: placeDetails.place_id,
        formattedAddress: placeDetails.formatted_address,
        addressComponents: this.parseAddressComponents(placeDetails.address_components),
        businessInfo: {
          businessStatus: placeDetails.business_status,
          placeTypes: placeDetails.types,
          website: placeDetails.website,
          phoneNumber: placeDetails.formatted_phone_number
        }
      },
      
      hours: this.parseOpeningHours(placeDetails.opening_hours),
      
      // ADD THIS LINE:
      thumbnail: this.generateThumbnail(placeDetails),
      
      photos: placeDetails.photos?.map(photo => ({
        url: this.getPhotoUrl(photo.photo_reference),
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || [],
      
      rating: placeDetails.rating || 0,
      reviewCount: placeDetails.user_ratings_total || 0,
      isVerified: this.isDentalPractice(placeDetails.types, placeDetails.name),
      services: this.inferServices(placeDetails.types, placeDetails.name),
      searchableAddress: [
        placeDetails.address_components.find(c => c.types.includes('locality'))?.long_name,
        placeDetails.address_components.find(c => c.types.includes('administrative_area_level_1'))?.long_name,
        placeDetails.address_components.find(c => c.types.includes('postal_code'))?.long_name
      ].filter(Boolean) as string[],
      acceptedInsurance: [] as string[]
    };

    return clinicData;
  }

  /**
   * Check if place is likely a dental practice
   */
  private isDentalPractice(types: string[], name: string): boolean {
    const dentalKeywords = [
      'dental', 'dentist', 'orthodontic', 'oral', 'endodontic', 
      'periodontic', 'prosthodontic', 'maxillofacial'
    ];
    
    // Check place types
    const isDentalType = types.some(type => 
      type.includes('dentist') || type.includes('dental')
    );
    
    // Check name
    const isDentalName = dentalKeywords.some(keyword => 
      name.toLowerCase().includes(keyword)
    );
    
    return isDentalType || isDentalName;
  }

  /**
   * Infer services based on place information
   */
  private inferServices(types: string[], name: string): string[] {
    const defaultServices = ['General Dentistry', 'Teeth Cleaning'];
    
    const nameKeywords = name.toLowerCase();
    const additionalServices: string[] = [];
    
    if (nameKeywords.includes('orthodontic') || nameKeywords.includes('braces')) {
      additionalServices.push('Orthodontics');
    }
    if (nameKeywords.includes('cosmetic')) {
      additionalServices.push('Cosmetic Dentistry');
    }
    if (nameKeywords.includes('pediatric') || nameKeywords.includes('kids')) {
      additionalServices.push('Pediatric Dentistry');
    }
    if (nameKeywords.includes('oral surgery')) {
      additionalServices.push('Oral Surgery');
    }
    
    return [...defaultServices, ...additionalServices];
  }
}