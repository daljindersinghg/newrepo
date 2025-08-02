'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClinicPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to clinic dashboard
    router.push('/clinic/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to clinic dashboard...</p>
      </div>
    </div>
  );
}