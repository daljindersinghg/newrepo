import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add admin token if available
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized - clear admin auth
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Only redirect if we're on an admin page
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
