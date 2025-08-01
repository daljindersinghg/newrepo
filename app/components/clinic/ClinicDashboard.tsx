// app/components/clinic/ClinicDashboard.tsx
'use client';

import { useClinicAuth } from '@/hooks/useClinicAuth';
import { ClinicLogin } from './ClinicLogin';

export function ClinicDashboard() {
  const { clinic, isLoggedIn, logout, loading, refreshAuth } = useClinicAuth();

  // Show login if not authenticated
  if (!isLoggedIn && !loading) {
    return (
      <ClinicLogin 
        onLoginSuccess={() => {
          refreshAuth();
          console.log('Clinic login successful');
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

  // Show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinic Dashboard</h1>
              <p className="text-gray-600">Welcome back, {clinic?.name}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Clinic Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {clinic?.name}</p>
              <p><span className="font-medium">Email:</span> {clinic?.email}</p>
              <p><span className="font-medium">Phone:</span> {clinic?.phone}</p>
              <p><span className="font-medium">Address:</span> {clinic?.address}</p>
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <div className="space-y-1">
              {clinic?.services && clinic.services.length > 0 ? (
                clinic.services.map((service, index) => (
                  <p key={index} className="text-gray-600">• {service}</p>
                ))
              ) : (
                <p className="text-gray-500 italic">No services listed</p>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                View Appointments
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Update Profile
              </button>
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                Manage Availability
              </button>
            </div>
          </div>

        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Your Clinic Dashboard</h3>
          <p className="text-gray-600">
            This is your central hub for managing your clinic's presence on our platform. 
            You can view and manage appointment requests, update your clinic information, 
            and communicate with patients.
          </p>
        </div>
      </div>
    </div>
  );
}
