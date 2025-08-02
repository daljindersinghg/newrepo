// lib/api/adminClinic.ts
import api from '@/lib/api';

export interface AdminClinicSearchFilters {
  nameSearch?: string;
  addressSearch?: string;
  limit?: number;
}

export interface AdminClinicSearchResponse {
  success: boolean;
  message: string;
  data: {
    clinics: any[];
    total: number;
    searchMeta?: {
      nameQuery?: string;
      addressQuery?: string;
      searchMethod?: 'text' | 'regex' | 'combined' | 'error';
    };
  };
}

export const adminClinicApi = {
  // Simple search for admin - search by name or address
  async searchClinics(filters: AdminClinicSearchFilters = {}): Promise<AdminClinicSearchResponse> {
    const params = new URLSearchParams();
    
    // Set reasonable limits for admin search
    params.append('limit', (filters.limit || 50).toString());
    params.append('active', 'true'); // Only show active clinics for adding
    
    // Build search query - combine name and address searches
    const searchTerms = [];
    if (filters.nameSearch?.trim()) {
      searchTerms.push(filters.nameSearch.trim());
    }
    if (filters.addressSearch?.trim()) {
      searchTerms.push(filters.addressSearch.trim());
    }
    
    if (searchTerms.length > 0) {
      params.append('search', searchTerms.join(' '));
    }

    try {
      const response = await api.get(`/api/v1/public/clinics?${params}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: 'Search completed successfully',
          data: {
            clinics: response.data.data.clinics,
            total: response.data.data.pagination.total,
            searchMeta: {
              nameQuery: filters.nameSearch,
              addressQuery: filters.addressSearch,
              searchMethod: response.data.data.searchMeta?.searchMethod || 'combined'
            }
          }
        };
      } else {
        throw new Error(response.data.message || 'Search failed');
      }
    } catch (error: any) {
      console.error('Admin clinic search error:', error);
      
      // Return empty results on error
      return {
        success: false,
        message: error.message || 'Search failed',
        data: {
          clinics: [],
          total: 0,
          searchMeta: {
            nameQuery: filters.nameSearch,
            addressQuery: filters.addressSearch,
            searchMethod: 'error'
          }
        }
      };
    }
  },

  // Get clinic details by ID
  async getClinicById(id: string) {
    try {
      const response = await api.get(`/api/v1/public/clinics/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching clinic details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch clinic details');
    }
  },

  // Check if clinic already exists in our database
  async checkDuplicateClinic(placeId?: string, name?: string, address?: string) {
    try {
      const params = new URLSearchParams();
      if (placeId) params.append('placeId', placeId);
      if (name) params.append('name', name);
      if (address) params.append('address', address);
      
      const response = await api.get(`/api/v1/admin/clinics/check-duplicate?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Error checking duplicate clinic:', error);
      return { success: false, exists: false, message: 'Failed to check duplicates' };
    }
  },

  // Create clinic manually with full details
  async createClinicManually(clinicData: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    thumbnail?: string;
    services: string[];
    acceptedInsurance?: string[];
    hours?: {
      monday?: string;
      tuesday?: string;
      wednesday?: string;
      thursday?: string;
      friday?: string;
      saturday?: string;
      sunday?: string;
    };
    latitude?: number;
    longitude?: number;
  }) {
    try {
      const response = await api.post('/api/v1/admin/clinics', clinicData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating clinic manually:', error);
      throw new Error(error.response?.data?.message || 'Failed to create clinic');
    }
  }
};