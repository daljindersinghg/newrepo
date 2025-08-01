'use client';

import { ReactNode } from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import { useClinicAuth } from '@/hooks/useClinicAuth';

interface ClinicLayoutProps {
  children: ReactNode;
}

export function ClinicLayout({ children }: ClinicLayoutProps) {
  const { clinic, logout } = useClinicAuth();

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-green-600">
                    Clinic Dashboard
                  </h1>
                </div>
              </div>

              {/* Right side - Notifications and User Menu */}
              <div className="flex items-center space-x-4">
                {/* Notification Dropdown */}
                <NotificationDropdown />

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{clinic?.name}</p>
                    <p className="text-gray-500">{clinic?.email}</p>
                  </div>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex items-center p-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              © 2025 Clinic Management System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </NotificationProvider>
  );
}

// Example usage in a clinic dashboard page:
// 
// import { ClinicLayout } from '@/components/clinic/ClinicLayout';
// import { ClinicPendingTab } from '@/components/clinic/ClinicPendingTab';
// 
// export default function ClinicDashboardPage() {
//   return (
//     <ClinicLayout>
//       <div className="space-y-6">
//         <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
//         <ClinicPendingTab />
//       </div>
//     </ClinicLayout>
//   );
// }