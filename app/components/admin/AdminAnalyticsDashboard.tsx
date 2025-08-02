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
