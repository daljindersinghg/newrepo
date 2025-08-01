import api from '../api';

export interface AppointmentRequest {
  clinicId: string;
  requestedDate: Date;
  requestedTime: string;
  duration: number;
  type: 'consultation' | 'cleaning' | 'procedure' | 'emergency' | 'follow-up';
  reason: string;
}

export interface ClinicResponse {
  responseType: 'counter-offer' | 'confirmation' | 'rejection';
  proposedDate?: Date;
  proposedTime?: string;
  proposedDuration?: number;
  message: string;
}

export interface PatientResponse {
  responseType: 'accept' | 'reject' | 'counter';
  message?: string;
}

export interface Appointment {
  _id: string;
  patient: {
    _id: string;
    name?: string;
    email: string;
    phone?: string;
  };
  clinic: {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  appointmentDate: string;
  duration: number;
  type: string;
  status: 'pending' | 'counter-offered' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  originalRequest: {
    requestedDate: string;
    requestedTime: string;
    duration: number;
    reason: string;
    requestedAt: string;
  };
  clinicResponses: Array<{
    responseType: 'counter-offer' | 'confirmation' | 'rejection';
    proposedDate?: string;
    proposedTime?: string;
    proposedDuration?: number;
    message: string;
    respondedAt: string;
    respondedBy: string;
  }>;
  patientResponses: Array<{
    responseType: 'accept' | 'reject' | 'counter';
    message?: string;
    respondedAt: string;
  }>;
  confirmedDetails?: {
    finalDate: string;
    finalTime: string;
    finalDuration: number;
    confirmedAt: string;
    confirmedBy: 'patient' | 'clinic';
  };
  messages: Array<{
    sender: 'patient' | 'clinic';
    senderId: string;
    message: string;
    sentAt: string;
    readAt?: string;
  }>;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export const appointmentApi = {
  // Patient requests appointment
  async requestAppointment(data: AppointmentRequest): Promise<{ success: boolean; appointment: Appointment; message: string }> {
    const response = await api.post('/api/v1/appointments/request', data);
    return response.data;
  },

  // Clinic responds to appointment request
  async clinicResponse(appointmentId: string, data: ClinicResponse): Promise<{ success: boolean; appointment: Appointment; message: string }> {
    const response = await api.post(`/api/v1/appointments/${appointmentId}/clinic-response`, data);
    return response.data;
  },

  // Patient responds to clinic counter-offer
  async patientResponse(appointmentId: string, data: PatientResponse): Promise<{ success: boolean; appointment: Appointment; message: string }> {
    const response = await api.post(`/api/v1/appointments/${appointmentId}/patient-response`, data);
    return response.data;
  },

  // Get patient's appointment requests
  async getMyRequests(): Promise<{ success: boolean; appointments: Appointment[] }> {
    const response = await api.get('/api/v1/appointments/my-requests');
    return response.data;
  },

  // Get clinic's appointment requests
  async getClinicRequests(): Promise<{ success: boolean; appointments: Appointment[] }> {
    const response = await api.get('/api/v1/appointments/clinic-requests');
    return response.data;
  },

  // Get appointment by ID
  async getById(appointmentId: string): Promise<Appointment> {
    const response = await api.get(`/api/v1/appointments/${appointmentId}`);
    return response.data;
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string, reason?: string): Promise<{ success: boolean; appointment: Appointment; message: string }> {
    const response = await api.patch(`/api/v1/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  // Add message to conversation
  async addMessage(appointmentId: string, message: string): Promise<{ success: boolean; appointment: Appointment }> {
    const response = await api.post(`/api/v1/appointments/${appointmentId}/messages`, { message });
    return response.data;
  }
};