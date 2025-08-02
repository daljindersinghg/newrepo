'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';

interface Appointment {
  _id: string;
  patientInfo?: Array<{
    _id: string;
    name?: string;
    email: string;
    phone?: string;
  }>;
  clinicInfo?: Array<{
    _id: string;
    name: string;
    address?: string;
    phone?: string;
  }>;
  appointmentDate: string;
  duration: number;
  type: string;
  status: 'pending' | 'counter-offered' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  originalRequest: {
    requestedDate: string;
    requestedTime: string;
    duration: number;
    reason: string;
    requestedAt: string;
  };
  clinicResponses: Array<{
    responseType: 'counter-offer' | 'confirmation' | 'rejection';
    proposedDate?: string;
    proposedTime?: string;
    proposedDuration?: number;
    message: string;
    respondedAt: string;
    _id: string;
  }>;
  patientResponses: Array<{
    responseType: 'accept' | 'reject' | 'counter';
    message?: string;
    respondedAt: string;
    _id: string;
  }>;
  messages: Array<{
    sender: 'patient' | 'clinic' | 'admin';
    senderId: string;
    message: string;
    sentAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  counterOffered: number;
  recentBookings: number;
  todaysAppointments: number;
  upcomingThisWeek: number;
}

export function BookingsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCommunication, setShowCommunication] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllAppointments(
        currentPage, 
        10, 
        filterStatus, 
        searchTerm || undefined
      );
      
      if (response.success) {
        setAppointments(response.data.appointments);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminApi.getAppointmentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch appointment stats:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchAppointments(), fetchStats()]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, searchTerm, filterStatus]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await adminApi.updateAppointmentStatus(appointmentId, newStatus);
      if (response.success) {
        setAppointments(appointments.map(app => 
          app._id === appointmentId ? { ...app, status: newStatus as any } : app
        ));
        await fetchStats(); // Refresh stats
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update appointment status');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedAppointment || !newMessage.trim()) return;

    try {
      const response = await adminApi.addAppointmentMessage(selectedAppointment._id, newMessage);
      if (response.success) {
        setSelectedAppointment(response.data);
        setNewMessage('');
        // Update the appointment in the list
        setAppointments(appointments.map(app => 
          app._id === selectedAppointment._id ? response.data : app
        ));
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send message');
    }
  };

  const handleSendReminder = async (appointmentId: string) => {
    try {
      setSendingReminder(appointmentId);
      const response = await adminApi.sendAppointmentReminder(appointmentId);
      if (response.success) {
        alert(`Reminder sent successfully to ${response.data.sentTo}`);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'counter-offered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Today</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.todaysAppointments}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">This Week</h3>
            <p className="text-2xl font-bold text-indigo-600">{stats.upcomingThisWeek}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Recent Bookings</h3>
            <p className="text-2xl font-bold text-teal-600">{stats.recentBookings}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Confirmed</h3>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Counter Offered</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.counterOffered}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Cancelled</h3>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>

       
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Appointments
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, clinic, or reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="filter"
              title="Filter appointments by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="counter-offered">Counter Offered</option>
            </select>
          </div>
          <div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh appointments and statistics"
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                refreshing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {refreshing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span>Refreshing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-2 text-red-800 hover:text-red-900 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient & Clinic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Communication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => {
                const patient = appointment.patientInfo?.[0];
                const clinic = appointment.clinicInfo?.[0];
                
                return (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {patient?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-gray-500">{patient?.email}</div>
                        <div className="text-gray-500">{patient?.phone || 'No phone'}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          @ {clinic?.name || 'Unknown Clinic'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="text-gray-500">
                          {appointment.originalRequest.requestedTime} ({appointment.duration} min)
                        </div>
                        <div className="text-gray-500 capitalize">{appointment.type}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {appointment.originalRequest.reason}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('-', ' ')}
                      </span>
                      <div className="mt-1">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                          title="Change appointment status"
                          className="text-xs border border-gray-300 rounded px-1 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rejected">Rejected</option>
                          <option value="counter-offered">Counter Offered</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {appointment.messages.length + appointment.clinicResponses.length + appointment.patientResponses.length + 1} interactions
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.clinicResponses.length} clinic • {appointment.patientResponses.length} patient • {appointment.messages.length} messages
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowCommunication(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs underline mt-1"
                        >
                          View Full Communication
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                      <button
                        type="button"
                        onClick={() => handleSendReminder(appointment._id)}
                        disabled={sendingReminder === appointment._id || !['confirmed', 'pending'].includes(appointment.status)}
                        className={`block w-full px-3 py-1 rounded text-xs ${
                          ['confirmed', 'pending'].includes(appointment.status)
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {sendingReminder === appointment._id ? 'Sending...' : 'Send Reminder'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Communication Modal */}
      {showCommunication && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Communication - {selectedAppointment.patientInfo?.[0]?.name} @ {selectedAppointment.clinicInfo?.[0]?.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCommunication(false)}
                  title="Close communication modal"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {(() => {
                // Create a chronological timeline of all communications
                const allCommunications = [];
                
                // Add original request
                allCommunications.push({
                  type: 'original-request',
                  timestamp: selectedAppointment.originalRequest.requestedAt,
                  data: selectedAppointment.originalRequest
                });
                
                // Add clinic responses
                selectedAppointment.clinicResponses.forEach(response => {
                  allCommunications.push({
                    type: 'clinic-response',
                    timestamp: response.respondedAt,
                    data: response
                  });
                });
                
                // Add patient responses
                selectedAppointment.patientResponses.forEach(response => {
                  allCommunications.push({
                    type: 'patient-response',
                    timestamp: response.respondedAt,
                    data: response
                  });
                });
                
                // Add messages
                selectedAppointment.messages.forEach(message => {
                  allCommunications.push({
                    type: 'message',
                    timestamp: message.sentAt,
                    data: message
                  });
                });
                
                // Sort by timestamp
                allCommunications.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                
                return allCommunications.length === 1 ? (
                  <p className="text-gray-500 text-center py-8">Only the original request - no responses yet</p>
                ) : (
                  <div className="space-y-4">
                    {allCommunications.map((comm, index) => {
                      if (comm.type === 'original-request') {
                        const req = comm.data as typeof selectedAppointment.originalRequest;
                        return (
                          <div key={index} className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-400">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-yellow-700">
                                Original Request
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(req.requestedAt)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm">
                              <p><strong>Date:</strong> {formatDate(req.requestedDate)}</p>
                              <p><strong>Time:</strong> {req.requestedTime}</p>
                              <p><strong>Duration:</strong> {req.duration} minutes</p>
                              <p><strong>Reason:</strong> {req.reason}</p>
                            </div>
                          </div>
                        );
                      }
                      
                      if (comm.type === 'clinic-response') {
                        const response = comm.data as typeof selectedAppointment.clinicResponses[0];
                        return (
                          <div key={index} className="p-3 rounded-lg bg-green-50 border-l-4 border-green-400 mr-8">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-green-700">
                                Clinic {response.responseType === 'counter-offer' ? 'Counter Offer' : response.responseType}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(response.respondedAt)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm">
                              {response.responseType === 'counter-offer' && (
                                <div className="mb-2">
                                  <p><strong>Proposed Date:</strong> {response.proposedDate ? formatDate(response.proposedDate) : 'Same as requested'}</p>
                                  <p><strong>Proposed Time:</strong> {response.proposedTime || 'Same as requested'}</p>
                                  <p><strong>Duration:</strong> {response.proposedDuration || selectedAppointment.duration} minutes</p>
                                </div>
                              )}
                              <p className="italic">"{response.message}"</p>
                            </div>
                          </div>
                        );
                      }
                      
                      if (comm.type === 'patient-response') {
                        const response = comm.data as typeof selectedAppointment.patientResponses[0];
                        return (
                          <div key={index} className="p-3 rounded-lg bg-purple-50 border-l-4 border-purple-400 ml-8">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-purple-700">
                                Patient {response.responseType === 'accept' ? 'Accepted' : response.responseType === 'reject' ? 'Rejected' : 'Counter Offer'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(response.respondedAt)}
                              </span>
                            </div>
                            {response.message && (
                              <p className="text-sm mt-2 italic">"{response.message}"</p>
                            )}
                          </div>
                        );
                      }
                      
                      if (comm.type === 'message') {
                        const message = comm.data as typeof selectedAppointment.messages[0];
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg ${
                              message.sender === 'admin'
                                ? 'bg-blue-100 ml-8 border-l-4 border-blue-400'
                                : message.sender === 'patient'
                                ? 'bg-gray-100 mr-8 border-l-4 border-gray-400'
                                : 'bg-green-100 mr-8 border-l-4 border-green-400'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-gray-600 capitalize">
                                {message.sender} Message
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(message.sentAt)}
                              </span>
                            </div>
                            <p className="text-sm mt-1">"{message.message}"</p>
                          </div>
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                );
              })()}
            </div>
            
            <div className="p-6 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {appointments.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}