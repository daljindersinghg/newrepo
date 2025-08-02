// components/admin/AdminDashboard.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { CreateClinicForm } from './CreateClinicForm';
import { ViewClinics } from './ViewClinics';
import { ClinicAuthManagement } from './ClinicAuthManagement';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';

type TabType = 'add-clinic' | 'add-doctor' | 'view-clinics' | 'view-doctors' | 'clinic-auth' | 'analytics';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const { admin, isLoggedIn, logout, loading, refreshAuth } = useAdminAuth();

  // Show login if not authenticated
  if (!isLoggedIn && !loading) {
    return (
      <AdminLogin 
        onLoginSuccess={() => {
          // Refresh auth state after successful login
          refreshAuth();
          console.log('Login successful, refreshing auth state');
        }} 
      />
    );
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: '📊'
    },
    {
      id: 'add-clinic' as TabType,
      label: 'Add Clinic',
      icon: '🏥'
    },

    {
      id: 'view-clinics' as TabType,
      label: 'View Clinics',
      icon: '🏢'
    },
    {
      id: 'clinic-auth' as TabType,
      label: 'Clinic Authentication',
      icon: '🔐'
    },

  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AdminAnalyticsDashboard />;
      case 'add-clinic':
        return <CreateClinicForm />;
   
      case 'view-clinics':
        return <ViewClinics />;
      case 'clinic-auth':
        return <ClinicAuthManagement />;
      default:
        return <AdminAnalyticsDashboard />;
    }
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
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-700 p-1 rounded"
            title="Close sidebar"
            aria-label="Close sidebar"
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
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors",
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span className="mr-3 text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{admin?.roles?.join(', ') || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Logout"
              aria-label="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                title="Open sidebar"
                aria-label="Open sidebar"
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
                  Manage your dental platform
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}