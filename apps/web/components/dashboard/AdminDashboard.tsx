// src/components/dashboard/AdminDashboard.tsx
'use client';

import { DashboardLayout } from '../layout/DashboardLayout';

export function AdminDashboard() {
  const user = {
    name: 'Admin User',
    email: 'admin@dentalbook.com'
  };

  const platformStats = [
    { label: 'Total Users', value: '12,847', change: '+12%', color: 'blue' },
    { label: 'Active Dentists', value: '1,205', change: '+8%', color: 'green' },
    { label: 'Appointments (MTD)', value: '8,924', change: '+15%', color: 'purple' },
    { label: 'Revenue (MTD)', value: '$124,500', change: '+22%', color: 'yellow' }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New dentist registered',
      details: 'Dr. Amanda Wilson - Seattle, WA',
      time: '2 hours ago',
      type: 'dentist'
    },
    {
      id: 2,
      action: 'Payment processed',
      details: '$2,450 commission payment',
      time: '4 hours ago',
      type: 'payment'
    },
    {
      id: 3,
      action: 'User support ticket',
      details: 'Booking issue reported',
      time: '6 hours ago',
      type: 'support'
    }
  ];

  const topPerformingDentists = [
    { name: 'Dr. Michael Chen', bookings: 42, revenue: '$8,400', rating: 4.9 },
    { name: 'Dr. Sarah Johnson', bookings: 38, revenue: '$7,600', rating: 4.8 },
    { name: 'Dr. Emily Rodriguez', bookings: 35, revenue: '$7,000', rating: 4.9 }
  ];

  return (
    <DashboardLayout userType="admin" user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-red-100">Platform overview and management tools</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`text-sm font-medium ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-yellow-600'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      activity.type === 'dentist' ? 'bg-green-100' :
                      activity.type === 'payment' ? 'bg-blue-100' : 'bg-yellow-100'
                    }`}>
                      {activity.type === 'dentist' ? '👨‍⚕️' :
                       activity.type === 'payment' ? '💰' : '🎫'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-red-600 text-sm font-medium hover:text-red-700">
                View all activity →
              </button>
            </div>
          </div>

          {/* Top Performing Dentists */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Dentists</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topPerformingDentists.map((dentist, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-medium text-sm">
                          {dentist.name.split(' ').map(n => n.charAt(1)).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{dentist.name}</h4>
                        <p className="text-sm text-gray-600">{dentist.bookings} bookings • {dentist.revenue}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-yellow-500">
                        <span className="text-sm font-medium">{dentist.rating}</span>
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage all users</p>
              </div>
            </div>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Practice Verification</h3>
                <p className="text-sm text-gray-600">Approve new dental practices</p>
              </div>
            </div>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Platform Analytics</h3>
                <p className="text-sm text-gray-600">Detailed performance reports</p>
              </div>
            </div>
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">API Status</span>
                </div>
                <p className="text-xs text-gray-600">Operational</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">Database</span>
                </div>
                <p className="text-xs text-gray-600">Healthy</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">Payments</span>
                </div>
                <p className="text-xs text-gray-600">Minor Issues</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">Email Service</span>
                </div>
                <p className="text-xs text-gray-600">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}