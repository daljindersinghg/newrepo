// components/admin/ViewClinics.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  services: string[];
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    clinics: Clinic[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export function ViewClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchClinics = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/v1/admin/clinics?${params}`);
      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setClinics(data.data.clinics);
        setCurrentPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
        setTotal(data.data.pagination.total);
        setError(null);
      } else {
        setError('Failed to fetch clinics');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClinics(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    fetchClinics(page, searchTerm);
  };

  const handleDelete = async (clinicId: string, clinicName: string) => {
    if (!confirm(`Are you sure you want to delete ${clinicName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/clinics/${clinicId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchClinics(currentPage, searchTerm);
      } else {
        alert('Failed to delete clinic');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  if (loading && clinics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clinics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinics</h2>
          <p className="text-gray-600">{total} total clinics</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search clinics by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Clinics Grid */}
      {clinics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏥</div>
          <p className="text-gray-500">No clinics found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {clinics.map((clinic) => (
            <div key={clinic._id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{clinic.name}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-16 font-medium">Address:</span>
                      <span>{clinic.address}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 font-medium">Phone:</span>
                      <span>{clinic.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-16 font-medium">Email:</span>
                      <span>{clinic.email}</span>
                    </div>
                    {clinic.website && (
                      <div className="flex items-center">
                        <span className="w-16 font-medium">Website:</span>
                        <a href={clinic.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline">
                          {clinic.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-700">Services:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {clinic.services.map((service, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Created: {new Date(clinic.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => handleDelete(clinic._id, clinic.name)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}