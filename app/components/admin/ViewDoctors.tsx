// app/components/admin/ViewDoctors.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  bio?: string;
  status: 'active' | 'pending' | 'suspended';
  verified: boolean;
  clinic: {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    services: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    doctors: Doctor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export function ViewDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDoctors = async (page = 1, search = '', status = '', clinic = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) {
        params.append('search', search);
      }
      if (status) {
        params.append('status', status);
      }
      if (clinic) {
        params.append('clinic', clinic);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors?${params}`);
      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setDoctors(data.data.doctors);
        setCurrentPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
        setTotal(data.data.pagination.total);
        setError(null);
      } else {
        setError('Failed to fetch doctors');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDoctors(1, searchTerm, statusFilter, clinicFilter);
  };

  const handlePageChange = (page: number) => {
    fetchDoctors(page, searchTerm, statusFilter, clinicFilter);
  };

  const handleStatusUpdate = async (doctorId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDoctors(currentPage, searchTerm, statusFilter, clinicFilter);
      } else {
        alert('Failed to update doctor status');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const handleDelete = async (doctorId: string, doctorName: string) => {
    if (!confirm(`Are you sure you want to delete ${doctorName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/doctors/${doctorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDoctors(currentPage, searchTerm, statusFilter, clinicFilter);
      } else {
        alert('Failed to delete doctor');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctors</h2>
          <p className="text-gray-600">Manage registered doctors ({total} total)</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
            <input
              type="text"
              placeholder="Filter by clinic..."
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleSearch} disabled={loading} className="w-full">
              Search
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="