// app/components/clinic/ClinicDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useClinicAuth } from '@/hooks/useClinicAuth';
import { ClinicLogin } from './ClinicLogin';

export function ClinicDashboard() {
  const { clinic, isLoggedIn, logout, loading, refreshAuth } = useClinicAuth();
  const router = useRouter();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (isLoggedIn && !loading) {
      router.push('/clinic/dashboard');
    }
  }, [isLoggedIn, loading, router]);

  // Show login if not authenticated
  if (!isLoggedIn && !loading) {
    return (
      <ClinicLogin 
        onLoginSuccess={() => {
          refreshAuth();
          console.log('Clinic login successful');
          // Redirect will happen via useEffect
        }} 
      />
    );
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show dashboard (will redirect to full dashboard)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
