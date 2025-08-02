'use client';

import { useClinicAuth } from '@/hooks/useClinicAuth';
import { ClinicDashboardLayout } from '@/components/clinic/ClinicDashboardLayout';
import { ClinicLogin } from '@/components/clinic/ClinicLogin';

export default function ClinicDashboard() {
  const { isLoggedIn, loading, refreshAuth } = useClinicAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isLoggedIn) {
    return (
      <ClinicLogin 
        onLoginSuccess={() => {
          refreshAuth();
          console.log('Clinic login successful');
        }} 
      />
    );
  }

  // Show dashboard if authenticated
  return <ClinicDashboardLayout />;
}