// components/admin/AdminDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminApi } from '@/lib/api/admin';
import { AdminLogin } from './AdminLogin';
import { CreateClinicForm } from './CreateClinicForm';
import { ViewClinics } from './ViewClinics';
import { ClinicAuthManagement } from './ClinicAuthManagement';
import { AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
import { PatientsManagement } from './UsersManagement';
import { BookingsManagement } from './BookingsManagement';
import { NotificationManager } from './NotificationManager';
import { ReceiptManagement } from './ReceiptManagement';

type TabType = 'add-clinic' | 'add-doctor' | 'view-clinics' | 'view-doctors' | 'clinic-auth' | 'analytics' | 'patients' | 'bookings' | 'notifications' | 'receipts';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [patientStats, setPatientStats] = useState<{ total: number; withBookings: number } | null>(null);
  const { admin, isLoggedIn, logout, loading, refreshAuth } = useAdminAuth();

  // Fetch patient stats for header display
  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const response = await adminApi.getPatientStats();
        if (response.success) {
          setPatientStats({
            total: response.data.total,
            withBookings: response.data.withBookings
          });
        }
      } catch (error) {
        console.error('Failed to fetch patient stats:', error);
      }
    };

    if (isLoggedIn) {
      fetchPatientStats();
    }
  }, [isLoggedIn]);

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
      id: 'patients' as TabType,
      label: 'Patients',
      icon: '👥'
    },
    {
      id: 'bookings' as TabType,
      label: 'Bookings',
      icon: '📅'
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
    {
      id: 'notifications' as TabType,
      label: 'Notifications',
      icon: '🔔'
    },
    {
      id: 'receipts' as TabType,
      label: 'Receipts',
      icon: '📄'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AdminAnalyticsDashboard />;
      case 'patients':
        return <PatientsManagement />;
      case 'bookings':
        return <BookingsManagement />;
      case 'add-clinic':
        return <CreateClinicForm />;
      case 'view-clinics':
        return <ViewClinics />;
      case 'clinic-auth':
        return <ClinicAuthManagement />;
      case 'notifications':
        return <NotificationManager />;
      case 'receipts':
        return <ReceiptManagement />;
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
        "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarCollapsed ? "lg:w-16 w-16" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-blue-600">
          <div className="flex items-center">
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-white">Admin Panel</span>
            )}
            {sidebarCollapsed && (
              <span className="text-xl font-bold text-white">AP</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Collapse Toggle (Desktop only) */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block text-white hover:bg-blue-700 p-1 rounded"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
            {/* Close Button (Mobile only) */}
            <button
              type="button"
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
                    "w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors relative group",
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <span className={cn("text-xl", sidebarCollapsed ? "mx-auto" : "mr-3")}>
                    {tab.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="font-medium">{tab.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {tab.label}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <>
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
                  type="button"
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Logout"
                  aria-label="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2 w-full">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Logout"
                  aria-label="Logout"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
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
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
                title="Open sidebar"
                aria-label="Open sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Collapse toggle for desktop */}
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block text-gray-500 hover:text-gray-700 mr-4"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                  )}
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
            
            {/* Patient Stats in Header */}
            {patientStats && (
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{patientStats.total}</div>
                  <div className="text-xs text-gray-500">Total Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{patientStats.withBookings}</div>
                  <div className="text-xs text-gray-500">Patients with Bookings</div>
                </div>
              </div>
            )}
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