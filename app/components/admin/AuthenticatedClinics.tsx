'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { EditAuthModal } from './EditAuthModal';

interface AuthenticatedClinic {
  _id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  services: string[];
  active: boolean;
  isApproved: boolean;
  approvedAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function AuthenticatedClinics() {
  const [clinics, setClinics] = useState<AuthenticatedClinic[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<AuthenticatedClinic | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchAuthenticatedClinics();
  }, [pagination.page]);

  const fetchAuthenticatedClinics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/api/v1/admin/clinics`, {
        params: {
          page: pagination.page,
          limit: 10,
          authStatus: 'setup'
        }
      });
      
      if (response.data.success) {
        setClinics(response.data.data.clinics);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages
        }));
      } else {
        setError('Failed to fetch authenticated clinics');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };  const handleEditAuth = (clinic: AuthenticatedClinic) => {
    setSelectedClinic(clinic);
    setShowEditModal(true);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setSelectedClinic(null);
    fetchAuthenticatedClinics(); // Refresh the list
  };

  const handleToggleActive = async (clinicId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/clinics/${clinicId}/toggle-active`, {
        method: 'PUT'
      });

      if (response.ok) {
        fetchAuthenticatedClinics(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling clinic status:', error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Authenticated Clinics
        </h4>
        <span className="text-sm text-gray-500">
          {pagination.total} total clinics
        </span>
      </div>

      {clinics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No authenticated clinics</h3>
            <p className="mt-1 text-sm text-gray-500">No clinics have authentication set up yet.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {clinics.map((clinic) => (
                <li key={clinic._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {clinic.name}
                        </h3>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            clinic.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {clinic.active ? 'Active' : 'Inactive'}
                          </span>
                          {clinic.isApproved && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Approved
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {clinic.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Address:</span> {clinic.address}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {clinic.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Services:</span> {clinic.services.slice(0, 3).join(', ')}
                            {clinic.services.length > 3 && ` +${clinic.services.length - 3} more`}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Approved:</span> {new Date(clinic.approvedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleToggleActive(clinic._id)}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          clinic.active
                            ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                            : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                        }`}
                      >
                        {clinic.active ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        onClick={() => handleEditAuth(clinic)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit Auth
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination - Same as PendingAuthClinics */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pagination.page === i + 1
                            ? 'z-10 bg-blue-600 text-white focus:z-20'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-600'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Auth Modal */}
      {showEditModal && selectedClinic && (
        <EditAuthModal
          clinic={selectedClinic}
          onClose={() => setShowEditModal(false)}
          onComplete={handleEditComplete}
        />
      )}
    </div>
  );
}
