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
  },

  // Patient Management
  async getAllPatients(page: number = 1, limit: number = 10, search?: string, signupStep?: string): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (signupStep && signupStep !== 'all') params.append('signupStep', signupStep);
    
    const response = await api.get(`/api/v1/admin/patients?${params.toString()}`);
    return response.data;
  },

  async getPatientStats(): Promise<any> {
    const response = await api.get('/api/v1/admin/patients/stats');
    return response.data;
  },

  async getPatientById(patientId: string): Promise<any> {
    const response = await api.get(`/api/v1/admin/patients/${patientId}`);
    return response.data;
  },

  async updatePatientStep(patientId: string, signupStep: 1 | 2 | 'completed'): Promise<any> {
    const response = await api.put(`/api/v1/admin/patients/${patientId}/step`, { signupStep });
    return response.data;
  },

  // Appointment Management
  async getAllAppointments(
    page: number = 1, 
    limit: number = 10, 
    status?: string, 
    search?: string, 
    clinicId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (clinicId) params.append('clinicId', clinicId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/api/v1/admin/appointments?${params.toString()}`);
    return response.data;
  },

  async getAppointmentStats(): Promise<any> {
    const response = await api.get('/api/v1/admin/appointments/stats');
    return response.data;
  },

  async getAppointmentById(appointmentId: string): Promise<any> {
    const response = await api.get(`/api/v1/admin/appointments/${appointmentId}`);
    return response.data;
  },

  async updateAppointmentStatus(appointmentId: string, status: string, notes?: string): Promise<any> {
    const response = await api.put(`/api/v1/admin/appointments/${appointmentId}/status`, { status, notes });
    return response.data;
  },

  async addAppointmentMessage(appointmentId: string, message: string, adminId?: string): Promise<any> {
    const response = await api.post(`/api/v1/admin/appointments/${appointmentId}/message`, { message, adminId });
    return response.data;
  },

  async sendAppointmentReminder(appointmentId: string): Promise<any> {
    const response = await api.post(`/api/v1/admin/appointments/${appointmentId}/reminder`);
    return response.data;
  }
};
