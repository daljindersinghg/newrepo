// components/admin/ViewClinics.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  services: string[];
  acceptedInsurance?: string[];
  active?: boolean;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
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

const serviceOptions = [
  'General Dentistry',
  'Teeth Cleaning',
  'Orthodontics',
  'Oral Surgery',
  'Cosmetic Dentistry',
  'Periodontics',
  'Endodontics',
  'Pediatric Dentistry',
  'Prosthodontics',
  'Emergency Dental Care',
  'Dental Implants',
  'Root Canal Treatment',
  'Teeth Whitening',
  'Dental Crowns',
  'Dental Bridges',
  'Dentures'
];

const insuranceOptions = [
  'Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'MetLife',
  'Delta Dental',
  'Humana',
  'United Healthcare',
  'Guardian',
  'Aflac',
  'Principal'
];

export function ViewClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  const fetchClinics = async (page = 1, search = '', activeFilter?: boolean) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (search) {
        params.append('search', search);
      }

      if (activeFilter !== undefined) {
        params.append('active', activeFilter.toString());
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics?${params}`);
      const data: ApiResponse = response.data;

      if (data.success) {
        setClinics(data.data.clinics);
        setCurrentPage(data.data.pagination.page);
        setTotalPages(data.data.pagination.pages);
        setTotal(data.data.pagination.total);
        setError(null);
      } else {
        setError('Failed to fetch clinics');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics(1, '', showActiveOnly);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClinics(1, searchTerm, showActiveOnly);
  };

  const handlePageChange = (page: number) => {
    fetchClinics(page, searchTerm, showActiveOnly);
  };

  const handleActiveFilterChange = (activeOnly: boolean) => {
    setShowActiveOnly(activeOnly);
    setCurrentPage(1);
    fetchClinics(1, searchTerm, activeOnly);
  };

  const handleEdit = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedClinic: Clinic) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics/${updatedClinic._id}`,
        updatedClinic,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        setClinics(prev => prev.map(clinic => 
          clinic._id === updatedClinic._id ? updatedClinic : clinic
        ));
        setIsEditModalOpen(false);
        setEditingClinic(null);
      } else {
        throw new Error(response.data.message || 'Failed to update clinic');
      }
    } catch (error: any) {
      console.error('Error updating clinic:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update clinic');
    }
  };

  const handleDelete = async (clinicId: string, clinicName: string) => {
    if (!confirm(`Are you sure you want to delete ${clinicName}?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics/${clinicId}`
      );

      if (response.status === 200 || response.status === 204) {
        fetchClinics(currentPage, searchTerm, showActiveOnly);
      } else {
        alert(response.data.message || 'Failed to delete clinic');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Network error. Please try again.');
    }
  };

  const handleToggleActive = async (clinicId: string, clinicName: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${clinicName}?`)) {
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics/${clinicId}/toggle-active`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 && response.data.success) {
        // Update the local state
        setClinics(prev => prev.map(clinic => 
          clinic._id === clinicId ? { ...clinic, active: !currentStatus } : clinic
        ));
      } else {
        alert(response.data.message || `Failed to ${action} clinic`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Network error. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-900">Manage Clinics</h2>
          <p className="text-gray-600">{total} total clinics</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Active Status Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <div className="flex gap-2">
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => handleActiveFilterChange(true)}
              >
                Active Only
              </Button>
              <Button
                variant={!showActiveOnly ? "default" : "outline"}
                size="sm"
                onClick={() => handleActiveFilterChange(false)}
              >
                All Clinics
              </Button>
            </div>
          </div>
          
          {/* Search */}
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
                    <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                      clinic.active !== false ? 
                        'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                    }`}>
                      {clinic.active !== false ? 'Active' : 'Inactive'}
                    </span>
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

                  {/* Hours */}
                  {clinic.hours && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-700">Hours:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                        {Object.entries(clinic.hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between bg-gray-50 px-2 py-1 rounded">
                            <span className="capitalize font-medium">{day}:</span>
                            <span>{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Created: {new Date(clinic.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(clinic)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => handleDelete(clinic._id, clinic.name)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(clinic._id, clinic.name, clinic.active !== false)}
                    className={clinic.active !== false ? 
                      "text-orange-600 border-orange-300 hover:bg-orange-50" : 
                      "text-green-600 border-green-300 hover:bg-green-50"
                    }
                  >
                    {clinic.active !== false ? 'Deactivate' : 'Activate'}
                  </Button>
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

      {/* Edit Modal */}
      {editingClinic && isEditModalOpen && (
        <EditClinicModal
          clinic={editingClinic}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingClinic(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

// Edit Modal Component
function EditClinicModal({ clinic, isOpen, onClose, onSave }: {
  clinic: Clinic;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClinic: Clinic) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Clinic>(clinic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setFormData(clinic);
  }, [clinic]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof Clinic, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  const handleArrayToggle = (field: 'services' | 'acceptedInsurance', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...(prev[field] || []), value]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating clinic:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services?.includes(service) || false}
                    onChange={() => handleArrayToggle('services', service)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
            
            <div className="space-y-3">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </div>
                  <input
                    type="text"
                    value={formData.hours?.[day] || ''}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    placeholder="9:00 AM - 5:00 PM or 'Closed'"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Accepted</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {insuranceOptions.map((insurance) => (
                <label key={insurance} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptedInsurance?.includes(insurance) || false}
                    onChange={() => handleArrayToggle('acceptedInsurance', insurance)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm text-gray-700">{insurance}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Clinic</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <Button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i + 1}
                className={`w-3 h-3 rounded-full ${
                  i + 1 === currentStep
                    ? 'bg-blue-600'
                    : i + 1 < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}