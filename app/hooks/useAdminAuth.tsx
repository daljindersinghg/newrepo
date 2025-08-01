// app/hooks/useAdminAuth.tsx
'use client';

import { useState, useEffect } from 'react';
import { adminApi, AdminLoginData } from '@/lib/api/admin';

interface AdminData {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Check if admin is logged in on component mount
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    try {
      const adminData = localStorage.getItem('adminData');
      const adminToken = localStorage.getItem('adminToken');
      
      if (adminData && adminToken) {
        setAdmin(JSON.parse(adminData));
      }
    } catch (error) {
      console.error('Error checking admin auth:', error);
      clearAdminAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData: AdminLoginData) => {
    try {
      setLoading(true);
      setError('');

      const response = await adminApi.login(loginData);

      console.log('🚀 ~ :47 ~ login ~ response::==', response)

      
      if (response.success) {
        // Store token and admin data correctly
        localStorage.setItem('adminToken', response.data.token);

        console.log('🚀 ~ :51 ~ login ~ response.data::==', response.data)

        
        // Create admin data object from the response
        const adminData: AdminData = {
          id: response.data.admin.id,
          name: response.data.admin.name,
          email: response.data.admin.email,
          roles: response.data.admin.roles
        };
        
        localStorage.setItem('adminData', JSON.stringify(adminData));
        setAdmin(adminData);
        
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Login failed');
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearAdminAuth();
    }
  };

  const clearAdminAuth = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setAdmin(null);
  };

  const isLoggedIn = !!admin;
  const isAdmin = admin?.roles.includes('superadmin') || admin?.roles.includes('staff');

  return {
    admin,
    loading,
    error,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    clearError: () => setError(''),
    refreshAuth: checkAdminAuth
  };
}
