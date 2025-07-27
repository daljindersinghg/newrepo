// src/components/dashboard/DoctorDashboard.tsx
'use client';

import { DashboardLayout } from '../layout/DashboardLayout';

export function DoctorDashboard() {
  const user = {
    name: 'Dr. Michael Chen',
    email: 'dr.chen@dentalclinic.com'
  };

  const todaySchedule = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      time: '9:00 AM',
      type: 'Cleaning',
      status: 'confirmed'
    },
    {
      id: 2,
      patient: 'Robert Smith',
      time: '10:30 AM',
      type: 'Root Canal',
      status: 'in-progress'
    },
    {
      id: 3,
      patient: 'Emily Davis',
      time: '2:00 PM',
      type: 'Crown Fitting',
      status: 'pending'
    }
  ];

  const stats = [
    { label: 'Today\'s Patients', value: '8', change: '+2', color: 'blue' },
    { label: 'This Week', value: '42', change: '+5', color: 'green' },
    { label: 'Revenue (MTD)', value: '$12,450', change: '+8%', color: 'purple' },
    { label: 'Avg Rating', value: '4.9', change: '★', color: 'yellow' }
  ];

  const recentBookings = [
    {
      id: 1,
      patient: 'Alex Thompson',
      date: '2025-07-22',
      time: '11:00 AM',
      type: 'Consultation',
      status: 'new'
    },
    {
      id: 2,
      patient: 'Maria Garcia',
      date: '2025-07-23',
      time: '3:30 PM',
      type: 'Filling',
      status: 'new'
    }
  ];

  return (
    <DashboardLayout userType="doctor" user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Good morning, {user.name}!</h2>
          <p className="text-green-100">You have 8 patients scheduled for today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
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
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium text-sm">
                          {appointment.patient.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{appointment.patient}</h4>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                        <p className="text-sm text-gray-500">{appointment.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'in-progress' ? 'bg}-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-green-600 text-sm font-medium hover:text-green-700">
                View full schedule →
              </button>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <h4 className="font-medium text-gray-900">{booking.patient}</h4>
                      <p className="text-sm text-gray-600">{booking.type}</p>
                      <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        New
                      </span>
                      <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full text-green-600 text-sm font-medium hover:text-green-700">
                View all bookings →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Patient</h3>
                <p className="text-sm text-gray-600">Register new patient</p>
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
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Practice insights</p>
              </div>
            </div>
          </button>

          <button className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Practice Settings</h3>
                <p className="text-sm text-gray-600">Manage your practice</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}