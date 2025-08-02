import axios from 'axios';

export interface GeocodeResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  message?: string;
}

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Ensure this is set in your environment variables
    if (!apiKey) {
      throw new Error('Geocoding API key is missing');
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: apiKey,
      },
    });

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return {
        success: true,
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      return {
        success: false,
        message: response.data.error_message || 'Failed to geocode address',
      };
    }
  } catch (error: any) {
    console.error('Geocoding error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during geocoding',
    };
  }
};
