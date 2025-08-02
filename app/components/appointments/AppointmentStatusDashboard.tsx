'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAppointmentStatus, AppointmentStatus } from '@/hooks/useAppointmentStatus';
import AppointmentStatusBadge from './AppointmentStatusBadge';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  History,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface AppointmentStatusDashboardProps {
  appointments: any[];
  userType: 'patient' | 'clinic';
  onAppointmentUpdate?: (appointmentId: string, newStatus: AppointmentStatus) => void;
  className?: string;
}

export function AppointmentStatusDashboard({
  appointments,
  userType,
  onAppointmentUpdate,
  className = ""
}: AppointmentStatusDashboardProps) {
  const {
    isUpdating,
    error,
    updateAppointmentStatus,
    getValidTransitions,
    getStatusInfo,
    clearError
  } = useAppointmentStatus();

  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [expandedTimelines, setExpandedTimelines] = useState<Set<string>>(new Set());

  // Get status statistics
  const statusStats = appointments.reduce((acc, appointment) => {
    const status = appointment.status;
    acc[status] = (acc[status] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => 
    statusFilter === 'all' || appointment.status === statusFilter
  );

  const handleStatusUpdate = async (appointmentId: string, currentStatus: AppointmentStatus, newStatus: AppointmentStatus) => {
    const appointment = appointments.find(a => a.id === appointmentId || a._id === appointmentId);
    if (!appointment) return;

    const result = await updateAppointmentStatus(
      appointmentId,
      currentStatus,
      newStatus,
      userType,
      appointment
    );

    if (result.success && onAppointmentUpdate) {
      onAppointmentUpdate(appointmentId, newStatus);
    }
  };

  const toggleTimeline = (appointmentId: string) => {
    const newExpanded = new Set(expandedTimelines);
    if (newExpanded.has(appointmentId)) {
      newExpanded.delete(appointmentId);
    } else {
      newExpanded.add(appointmentId);
    }
    setExpandedTimelines(newExpanded);
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const datetime = new Date(`${date}T${time}`);
      return datetime.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return `${date} at ${time}`;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Appointment Status Overview</h2>
          <div className="text-sm text-gray-500">
            Total: {statusStats.total || 0} appointments
          </div>
        </div>

        {/* Status Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
          {Object.entries(statusStats).filter(([key]) => key !== 'total').map(([status, count]) => {
            const statusInfo = getStatusInfo(status as AppointmentStatus);
            return (
              <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">

                <div className={`text-xs font-medium text-${statusInfo.color}-600`}>
                  {statusInfo.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({statusStats.total || 0})
          </Button>
          {Object.keys(statusStats).filter(key => key !== 'total').map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status as AppointmentStatus)}
            >
              {getStatusInfo(status as AppointmentStatus).label} ({statusStats[status]})
            </Button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="divide-y divide-gray-200">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No appointments found for the selected filter.
          </div>
        ) : (
          filteredAppointments.map((appointment) => {
            const appointmentId = appointment.id || appointment._id;
            const isExpanded = expandedTimelines.has(appointmentId);
            const validTransitions = getValidTransitions(appointment.status, userType);

            return (
              <div key={appointmentId} className="p-6">
                {/* Appointment Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patientName || appointment.clinic?.name}
                      </h3>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDateTime(
                          appointment.appointmentDate || appointment.originalRequest?.requestedDate,
                          appointment.appointmentTime || appointment.originalRequest?.requestedTime
                        )}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {appointment.service || appointment.type}
                      </div>
                      {appointment.estimatedDuration && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.estimatedDuration} min
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTimeline(appointmentId)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Action Buttons */}
                {validTransitions.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {validTransitions.map((newStatus) => {
                        const statusInfo = getStatusInfo(newStatus);
                        return (
                          <Button
                            key={newStatus}
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(appointmentId, appointment.status, newStatus)}
                            disabled={isUpdating}
                            className="flex items-center"
                          >
                            <span className="mr-2">{statusInfo.icon}</span>
                            {isUpdating ? 'Updating...' : `Mark as ${statusInfo.label}`}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {isExpanded && appointment.statusHistory && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Status History</h4>
                    <div className="space-y-3">
                      {appointment.statusHistory.map((update: any, index: number) => {
                        const statusInfo = getStatusInfo(update.newStatus);
                        return (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${statusInfo.color}-100 flex items-center justify-center`}>
                              <span className="text-sm">{statusInfo.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{statusInfo.label}</span>
                                <span className="text-xs text-gray-500">
                                  by {update.updatedBy}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(update.timestamp).toLocaleString()}
                              </p>
                              {update.notes && (
                                <p className="text-sm text-gray-500 mt-1">{update.notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}