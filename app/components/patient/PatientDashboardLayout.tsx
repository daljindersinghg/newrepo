'use client';

import { useState } from 'react';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface PatientDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function PatientDashboardLayout({ children, activeTab, setActiveTab }: PatientDashboardLayoutProps) {
  const { patientInfo, isAuthenticated, logout } = usePatientAuth();
  const { showAuthModal } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
        </svg>
      )
    },
    {
      id: 'appointments',
      label: 'My Appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a3 3 0 01-3 3H6a3 3 0 01-3-3V8a1 1 0 011-1h3z" />
        </svg>
      )
    },
    {
      id: 'find-clinics',
      label: 'Find Clinics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard</p>
          <button
            type="button"
            onClick={() => showAuthModal('login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-blue-600">
          <div className="flex items-center">
            <div className="bg-white rounded-lg p-2 mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Patient Portal</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-700 p-1 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors",
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-r-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className={cn(
                    "mr-3",
                    activeTab === tab.id ? "text-blue-500" : "text-gray-400"
                  )}>
                    {tab.icon}
                  </span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Patient Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {getInitials(patientInfo?.name || 'P')}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{patientInfo?.name}</p>
              <p className="text-xs text-gray-500">{patientInfo?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full text-left text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back, {patientInfo?.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}