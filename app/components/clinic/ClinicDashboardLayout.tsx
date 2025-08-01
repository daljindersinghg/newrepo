'use client';

import { useState } from 'react';
import { ClinicSidebar } from '@/components/layout/ClinicSidebar';
import { ClinicOverviewTab } from './ClinicOverviewTab';
import { ClinicAppointmentsTab } from './ClinicAppointmentsTab';
import { ClinicPendingTab } from './ClinicPendingTab';
import { ClinicCalendarTab } from './ClinicCalendarTab';
import { ClinicPatientsTab } from './ClinicPatientsTab';
import { ClinicSettingsTab } from './ClinicSettingsTab';

type ClinicTab = 'overview' | 'appointments' | 'pending' | 'calendar' | 'patients' | 'settings';

export function ClinicDashboardLayout() {
  const [activeTab, setActiveTab] = useState<ClinicTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              {/* Notification Bell */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5-5-5h5V9a4 4 0 00-8 0v8h5l-5 5-5-5h5z" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Help */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Profile dropdown */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">DC</span>
                </div>
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