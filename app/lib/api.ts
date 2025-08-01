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
    // Add admin token if available and requesting admin routes
    const adminToken = localStorage.getItem('adminToken');
    const clinicToken = localStorage.getItem('clinicToken');
    
    // Check if this is a clinic API call
    if (config.url?.includes('/clinic/') && clinicToken) {
      config.headers.Authorization = `Bearer ${clinicToken}`;
    }
    // Otherwise use admin token if available
    else if (adminToken) {
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
      const requestUrl = error.config?.url || '';
      
      // Handle clinic unauthorized
      if (requestUrl.includes('/clinic/')) {
        localStorage.removeItem('clinicToken');
        localStorage.removeItem('clinicData');
        
        // Only redirect if we're on a clinic page
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/clinic')) {
          window.location.reload();
        }
      }
      // Handle admin unauthorized
      else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        
        // Only redirect if we're on an admin page
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
