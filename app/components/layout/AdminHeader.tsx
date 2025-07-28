// apps/web/components/admin/layout/AdminHeader.tsx
'use client';

import { AdminTab } from '../AdminDashboard';

interface AdminHeaderProps {
  onMenuClick: () => void;
  activeTab: AdminTab;
}

export function AdminHeader({ onMenuClick, activeTab }: AdminHeaderProps) {
  const getTabTitle = (tab: AdminTab): string => {
    switch (tab) {
      case 'overview': return 'Dashboard Overview';
      case 'add-doctor': return 'Add New Doctor';
      case 'add-clinic': return 'Add New Clinic';
      case 'doctors': return 'Manage Doctors';
      case 'clinics': return 'Manage Clinics';
      case 'users': return 'User Management';
      case 'analytics': return 'Platform Analytics';
      case 'settings': return 'System Settings';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {getTabTitle(activeTab)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your dental platform from here
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-3-3h-5l-3 3h5V7a3 3 0 013-3h0a3 3 0 013 3v10z" />
            </svg>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Help */}
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button className="flex items-center text-gray-700 hover:text-gray-900">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-medium text-sm">AD</span>
              </div>
              <span className="text-sm font-medium">Admin</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}