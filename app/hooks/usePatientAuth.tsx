'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface PatientInfo {
  name: string;
  email: string;
  phone: string;
  isAuthenticated: boolean;
  signupCompletedAt?: string;
  loginDate?: string;
}

export function usePatientAuth() {
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load patient info from localStorage on mount
    const loadPatientInfo = () => {
      try {
        const stored = localStorage.getItem('patientInfo');
        if (stored) {
          const parsed = JSON.parse(stored);
          setPatientInfo(parsed);
        }
      } catch (error) {
        console.error('Error loading patient info:', error);
        localStorage.removeItem('patientInfo'); // Clean up corrupted data
      } finally {
        setIsLoading(false);
      }
    };

    loadPatientInfo();

    // Listen for storage changes (useful for multi-tab scenarios)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'patientInfo') {
        if (e.newValue) {
          try {
            setPatientInfo(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing patient info from storage:', error);
            setPatientInfo(null);
          }
        } else {
          setPatientInfo(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = async () => {
    try {
      // Call logout API to clear HTTP-only cookie
      await api.post('/api/v1/patients/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear localStorage and redirect regardless of API response
      localStorage.removeItem('patientInfo');
      setPatientInfo(null);
      window.location.href = '/';
    }
  };

  const updatePatientInfo = (newInfo: Partial<PatientInfo>) => {
    if (patientInfo) {
      const updated = { ...patientInfo, ...newInfo };
      localStorage.setItem('patientInfo', JSON.stringify(updated));
      setPatientInfo(updated);
    }
  };

  return {
    patientInfo,
    isAuthenticated: !!patientInfo?.isAuthenticated,
    isLoading,
    logout,
    updatePatientInfo
  };
}
