import api from '../api';

export interface Notification {
  _id: string;
  recipient: string;
  recipientType: 'patient' | 'clinic';
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  relatedAppointment?: string;
  actionRequired: boolean;
  actionType: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const notificationApi = {
  // Get notifications for authenticated clinic
  async getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false): Promise<{ success: boolean; data: NotificationResponse }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString()
    });
    
    const response = await api.get(`/api/v1/notifications?${params}`);
    return response.data;
  },

  // Get unread notification count
  async getUnreadCount(): Promise<{ success: boolean; unreadCount: number }> {
    const response = await api.get('/api/v1/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; data: Notification }> {
    const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await api.patch('/api/v1/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/v1/notifications/${notificationId}`);
    return response.data;
  }
};