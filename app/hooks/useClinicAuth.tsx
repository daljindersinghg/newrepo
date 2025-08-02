// app/hooks/useClinicAuth.tsx
'use client';

import { useState, useEffect } from 'react';
import { clinicApi, ClinicLoginData } from '@/lib/api/clinic';

interface ClinicData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  services: string[];
  website?: string;
}

export function useClinicAuth() {
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Check if clinic is logged in on component mount
  useEffect(() => {
    checkClinicAuth();
  }, []);

  const checkClinicAuth = () => {
    try {
      const clinicData = localStorage.getItem('clinicData');
      const clinicToken = localStorage.getItem('clinicToken');
      
      if (clinicData && clinicToken) {
        setClinic(JSON.parse(clinicData));
      }
    } catch (error) {
      console.error('Error checking clinic auth:', error);
      clearClinicAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData: ClinicLoginData) => {
    try {
      setLoading(true);
      setError('');

      const response = await clinicApi.login(loginData);
      
      if (response.success) {
        // Store token and clinic data
        localStorage.setItem('clinicToken', response.data.token);
        
        // Create clinic data object from the response
        const clinicData: ClinicData = {
          id: response.data.clinic.id,
          name: response.data.clinic.name,
          email: response.data.clinic.email,
          phone: response.data.clinic.phone,
          address: response.data.clinic.address,
          services: response.data.clinic.services,
          website: response.data.clinic.website
        };
        
        localStorage.setItem('clinicData', JSON.stringify(clinicData));
        setClinic(clinicData);
        
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
      await clinicApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear all clinic and authentication-related data
      clearClinicAuth();
      
      // Clear any additional tokens or session data
      const authKeys = ['accessToken', 'refreshToken', 'authToken', 'sessionToken'];
      authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear search history as well on clinic logout
      localStorage.removeItem('searchHistory');
      localStorage.removeItem('searchLocation');
      
      // Redirect to home page
      window.location.href = '/';
    }
  };

  const clearClinicAuth = () => {
    localStorage.removeItem('clinicToken');
    localStorage.removeItem('clinicData');
    setClinic(null);
  };

  const isLoggedIn = !!clinic;

  return {
    clinic,
    loading,
    error,
    isLoggedIn,
    login,
    logout,
    clearError: () => setError(''),
    refreshAuth: checkClinicAuth
  };
}
