'use client';

import { useState, useEffect, useRef } from 'react';
import { useClinicAuth } from '@/hooks/useClinicAuth';
import { ClinicSidebar } from '@/components/layout/ClinicSidebar';
import { ClinicOverviewTab } from './ClinicOverviewTab';
import { ClinicAppointmentsTab } from './ClinicAppointmentsTab';
import { ClinicPendingTab } from './ClinicPendingTab';
import { ClinicCalendarTab } from './ClinicCalendarTab';
import { ClinicPatientsTab } from './ClinicPatientsTab';
import { ClinicSettingsTab } from './ClinicSettingsTab';
import { SimpleNotificationDropdown } from './SimpleNotificationDropdown';

type ClinicTab = 'overview' | 'appointments' | 'pending' | 'calendar' | 'patients' | 'settings';

export function ClinicDashboardLayout() {
  const { clinic, logout } = useClinicAuth();
  const [activeTab, setActiveTab] = useState<ClinicTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileDropdownOpen]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClinicOverviewTab />;
      case 'appointments':
        return <ClinicAppointmentsTab />;
      case 'pending':
        return <ClinicPendingTab />;
      case 'calendar':
        return <ClinicCalendarTab />;
      case 'patients':
        return <ClinicPatientsTab />;
      case 'settings':
        return <ClinicSettingsTab />;
      default:
        return <ClinicOverviewTab />;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return 'Dashboard Overview';
      case 'appointments':
        return 'All Appointments';
      case 'pending':
        return 'Pending Requests';
      case 'calendar':
        return 'Calendar View';
      case 'patients':
        return 'Patient Database';
      case 'settings':
        return 'Clinic Settings';
      default:
        return 'Clinic Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <ClinicSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">{getTabTitle()}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notification Dropdown */}
              <SimpleNotificationDropdown />
              
              {/* Help */}
              <button 
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Get help"
                aria-label="Get help and support"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Open profile menu"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {clinic?.name ? clinic.name.charAt(0).toUpperCase() : 'C'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {clinic?.name || 'Clinic'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {clinic?.email || 'clinic@example.com'}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {clinic?.name || 'Clinic'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {clinic?.email || 'clinic@example.com'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('settings');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}