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
  }
};
