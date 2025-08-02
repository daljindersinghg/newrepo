// app/hooks/useAdminAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';

interface DashboardData {
  totalSignups: number;
  activePatients: number;
  conversionRate: number;
  topLocations: Array<{
    location: string;
    searches: number;
  }>;
  dropoffData: {
    landingPage: number;
    signupStep1: number;
    signupStep2: number;
    searchResults: number;
  };
  recentActivity: Array<{
    email: string;
    action: string;
    timestamp: string;
    location?: string;
  }>;
}

interface UseAdminAnalyticsReturn {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  setTimeRange: (range: string) => void;
  timeRange: string;
}

export const useAdminAnalytics = (): UseAdminAnalyticsReturn => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getDashboardAnalytics(timeRange);
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching dashboard data');
      console.error('Dashboard analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [timeRange]);

  return {
    dashboardData,
    loading,
    error,
    refreshData,
    setTimeRange,
    timeRange
  };
};
