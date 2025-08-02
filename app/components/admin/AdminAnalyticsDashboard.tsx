'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';

export function AdminAnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminApi.getDashboardAnalytics();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data available</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      {/* Simple stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold">{data.totalSignups}</div>
          <div className="text-sm text-gray-600">Total Signups</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold">{data.activePatients}</div>
          <div className="text-sm text-gray-600">Active Patients</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold">{data.conversionRate}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold">{data.topLocations?.[0]?.searches || 0}</div>
          <div className="text-sm text-gray-600">Top Location Searches</div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-4">
          {data.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
            <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <div className="font-medium">{activity.email}</div>
                <div className="text-sm text-gray-600">{activity.action}</div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch data from your analytics API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/analytics/dashboard?timeRange=${selectedTimeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPatientJourney = async (email: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/analytics/patient-journey?email=${email}`);
      const data = await response.json();
      
      if (data.success) {
        // Show patient journey in modal or expand section
        console.log('Patient Journey:', data.data);
        alert(`Patient Journey:\n${JSON.stringify(data.data, null, 2)}`);
      }
    } catch (error) {
      console.error('Failed to fetch patient journey:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load analytics data</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Patient Analytics</h2>
        <select 
          title="Select time range for analytics"
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSignups}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activePatients}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Search to booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drop-off Rate</CardTitle>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((analytics.dropoffData.signupStep1 / analytics.dropoffData.landingPage) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              At signup step 1
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Search Locations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Search Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium">{location.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{location.searches} searches</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${Math.min((location.searches / (analytics.topLocations[0]?.searches || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Drop-off Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Journey Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">Landing Page Views</span>
              <span className="text-lg font-bold">{analytics.dropoffData.landingPage}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium">Started Signup</span>
              <div className="text-right">
                <span className="text-lg font-bold">{analytics.dropoffData.signupStep1}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((analytics.dropoffData.signupStep1 / analytics.dropoffData.landingPage) * 100)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium">Completed Signup</span>
              <div className="text-right">
                <span className="text-lg font-bold">{analytics.dropoffData.signupStep2}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((analytics.dropoffData.signupStep2 / analytics.dropoffData.landingPage) * 100)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium">Searched for Dentists</span>
              <div className="text-right">
                <span className="text-lg font-bold">{analytics.dropoffData.searchResults}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((analytics.dropoffData.searchResults / analytics.dropoffData.landingPage) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Patient Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patient Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <button
                      onClick={() => searchPatientJourney(activity.email)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                    >
                      {activity.email}
                    </button>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                    {activity.location && (
                      <p className="text-xs text-gray-400">📍 {activity.location}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.open('https://app.posthog.com', '_blank')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium">Open PostHog</h3>
              <p className="text-sm text-gray-500">View detailed analytics</p>
            </button>
            <button 
              onClick={fetchAnalytics}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium">Refresh Data</h3>
              <p className="text-sm text-gray-500">Get latest insights</p>
            </button>
            <button 
              onClick={() => {
                const data = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(analytics, null, 2))}`;
                const link = document.createElement('a');
                link.href = data;
                link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
              }}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h3 className="font-medium">Export Data</h3>
              <p className="text-sm text-gray-500">Download as JSON</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
