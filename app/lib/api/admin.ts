// app/lib/api/admin.ts
import api from '@/lib/api';

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: {
      id: string;
      name: string;
      email: string;
      roles: string[];
      createdAt: string;
      updatedAt: string;
    };
    token: string;
  };
}

export const adminApi = {
  // Login admin
  async login(loginData: AdminLoginData): Promise<AdminLoginResponse> {
    const response = await api.post('/api/v1/admin/login', loginData);

    console.log('🚀 ~ :30 ~ login ~ response::==', response)

    return response.data;
  },

  // Logout admin
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/api/v1/admin/logout');
    return response.data;
  },

  // Get admin profile (for verification)
  async getProfile(adminId: string): Promise<any> {
    const response = await api.get(`/api/v1/admin/${adminId}`);
    return response.data;
  },

  // Get analytics dashboard data
  async getDashboardAnalytics(timeRange: string = '7d'): Promise<any> {
    const response = await api.get(`/api/v1/admin/analytics/dashboard?timeRange=${timeRange}`);
    return response.data;
  }
};
