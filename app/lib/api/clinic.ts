// app/lib/api/clinic.ts
import api from '@/lib/api';

export interface ClinicLoginData {
  email: string;
  password: string;
}

export interface ClinicLoginResponse {
  success: boolean;
  message: string;
  data: {
    clinic: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      services: string[];
      website?: string;
      authSetup: boolean;
      isApproved: boolean;
      active: boolean;
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
}

export interface ClinicSearchFilters {
  search?: string;
  location?: {
    lat: number;
    lng: number;
    radius?: number; // in kilometers
  };
  services?: string[];
  verified?: boolean;
  active?: boolean;
  sortBy?: 'distance' | 'rating' | 'name' | 'relevance';
  page?: number;
  limit?: number;
}

export interface ClinicSearchResponse {
  success: boolean;
  message: string;
  data: {
    clinics: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    searchMeta?: {
      searchTerm?: string;
      location?: string;
      searchMethod?: 'text' | 'regex' | 'location';
    };
  };
}

export const clinicApi = {
  // Login clinic
  async login(loginData: ClinicLoginData): Promise<ClinicLoginResponse> {
    const response = await api.post('/api/v1/clinic/login', loginData);
    return response.data;
  },

  // Logout clinic
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/api/v1/clinic/logout');
    return response.data;
  },

  // Get clinic profile
  async getProfile(): Promise<any> {
    const response = await api.get('/api/v1/clinic/profile');
    return response.data;
  },

  // Update clinic profile
  async updateProfile(profileData: any): Promise<any> {
    const response = await api.put('/api/v1/clinic/profile', profileData);
    return response.data;
  },

  // ✅ Enhanced search clinics with smart fallback
  async searchClinics(filters: ClinicSearchFilters = {}): Promise<ClinicSearchResponse> {
    const params = new URLSearchParams();
    
    // Basic parameters
    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 20).toString());
    
    // Search parameters
    if (filters.search) {
      params.append('search', filters.search.trim());
    }
    
    // Location parameters
    if (filters.location) {
      params.append('lat', filters.location.lat.toString());
      params.append('lng', filters.location.lng.toString());
      if (filters.location.radius) {
        params.append('radius', filters.location.radius.toString());
      }
    }
    
    // Filter parameters
    if (filters.services && filters.services.length > 0) {
      filters.services.forEach(service => params.append('services', service));
    }
    
    if (filters.verified !== undefined) {
      params.append('verified', filters.verified.toString());
    }
    
    if (filters.active !== undefined) {
      params.append('active', filters.active.toString());
    }
    
    // Sorting
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }

    try {
      const response = await api.get(`/api/v1/public/clinics?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Clinic search error:', error);
      
      // If search fails, try a simpler query
      if (filters.search) {
        console.log('Retrying search with basic parameters...');
        const basicParams = new URLSearchParams({
          page: (filters.page || 1).toString(),
          limit: (filters.limit || 20).toString(),
          active: 'true'
        });
        
        const fallbackResponse = await api.get(`/api/v1/public/clinics?${basicParams}`);
        
        // Filter results client-side if search term exists
        if (fallbackResponse.data.success && filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const filteredClinics = fallbackResponse.data.data.clinics.filter((clinic: any) => 
            clinic.name?.toLowerCase().includes(searchTerm) ||
            clinic.address?.toLowerCase().includes(searchTerm) ||
            clinic.services?.some((service: string) => 
              service.toLowerCase().includes(searchTerm)
            )
          );
          
          return {
            ...fallbackResponse.data,
            data: {
              ...fallbackResponse.data.data,
              clinics: filteredClinics,
              searchMeta: {
                searchTerm: filters.search,
                searchMethod: 'regex'
              }
            }
          };
        }
        
        return fallbackResponse.data;
      }
      
      throw error;
    }
  },

  // Get all clinics (backward compatibility)
  async getClinics(filters: ClinicSearchFilters = {}): Promise<ClinicSearchResponse> {
    return this.searchClinics(filters);
  }
};
