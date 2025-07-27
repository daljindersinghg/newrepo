// src/components/dashboard/PatientDashboard.tsx
'use client';

import { DashboardLayout } from '../layout/DashboardLayout';

export function PatientDashboard() {
  const user = {
    name: 'Sarah Johnson',
    email: 'sarah@example.com'
  };

  const upcomingAppointments = [
    {
      id: 1,
      dentist: 'Dr. Michael Chen',
      date: '2025-07-20',
      time: '10:00 AM',
      type: 'Cleaning',
      status: 'confirmed'
    },
    {
      id: 2,
      dentist: 'Dr. Emily Rodriguez',
      date: '2025-08-15',
      time: '2:30 PM',
      type: 'Crown Fitting',
      status: 'pending'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Appointment booked',
      dentist: 'Dr. Michael Chen',
      date: '2 days ago',
      icon: '📅'
    },
    {
      id: 2,
      action: 'Gift card earned',
      amount: '$50',
      date: '1 week ago',
      icon: '💳'
    },
    {
      id: 3,
      action: 'Review submitted',
      dentist: 'Dr. Sarah Williams',
      date: '2 weeks ago',
      icon: '⭐'
    }
  ];

  return (
    <DashboardLayout userType="patient" user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-blue-100">Manage your dental appointments and health records</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Find Dentists</h3>
                <p className="text-sm text-gray-600">Search for dentists near you</p>
              </div>
            </div>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule your next visit</p>
              </div>
            </div>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gift Cards</h3>
                <p className="text-sm text-gray-600">View your rewards</p>
              </div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.dentist}</h4>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <p className="text-sm text-gray-500">{appointment.date} at {appointment.time}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-blue-600 text-sm font-medium hover:text-blue-700">
                View all appointments →
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <span className="text-2xl mr-3">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">
                        {activity.dentist && `with ${activity.dentist}`}
                        {activity.amount && activity.amount}
                      </p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Health Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Health Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600">Oral Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">6 months</div>
                <div className="text-sm text-gray-600">Last Cleaning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">$150</div>
                <div className="text-sm text-gray-600">Gift Cards Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}