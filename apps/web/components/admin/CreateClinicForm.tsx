// components/admin/CreateClinicForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  services: string[];
  acceptedInsurance: string[];
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  location: {
    latitude: number | null;
    longitude: number | null;
  };
}

const defaultHours = {
  monday: '9:00 AM - 5:00 PM',
  tuesday: '9:00 AM - 5:00 PM',
  wednesday: '9:00 AM - 5:00 PM',
  thursday: '9:00 AM - 5:00 PM',
  friday: '9:00 AM - 5:00 PM',
  saturday: 'Closed',
  sunday: 'Closed'
};

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
  'Principal',
  'Lincoln Financial',
  'Sun Life',
  'Canada Life',
  'Manulife',
  'Green Shield Canada'
];

export function CreateClinicForm() {
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    services: [],
    acceptedInsurance: [],
    hours: defaultHours,
    location: {
      latitude: null,
      longitude: null
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleInputChange = (field: keyof ClinicFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        //@ts-ignore
        ...prev[parentField as keyof ClinicFormData],
        [childField]: value
      }
    }));
  };

  const handleArrayToggle = (field: 'services' | 'acceptedInsurance', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleAddressLookup = async () => {
    if (!formData.address) return;
    
    try {
      // Simple geocoding using Google Maps API (you'll need to implement this)
      // For now, we'll set dummy coordinates
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      }));
    } catch (error) {
      console.error('Geocoding failed:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.address && formData.phone && formData.email);
      case 2:
        return formData.services.length > 0;
      case 3:
        return true; // Hours are optional
      case 4:
        return formData.acceptedInsurance.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/clinics`, {
        ...formData,
        location: formData.location.latitude && formData.location.longitude ? {
          type: 'Point',
          coordinates: [formData.location.longitude, formData.location.latitude]
        } : undefined
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (response.status >= 200 && response.status < 300) {
        setMessage({ type: 'success', text: 'Clinic created successfully!' });
        // Reset form
        setFormData({
          name: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          services: [],
          acceptedInsurance: [],
          hours: defaultHours,
          location: { latitude: null, longitude: null }
        });
        setCurrentStep(1);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create clinic' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="Downtown Dental Clinic"
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
                  placeholder="info@clinic.com"
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
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.clinic.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Address *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, City, State, ZIP"
                />
                <Button
                  type="button"
                  onClick={handleAddressLookup}
                  variant="outline"
                  className="px-4 py-2"
                >
                  📍 Locate
                </Button>
              </div>
              {formData.location.latitude && formData.location.longitude && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Location coordinates: {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
            <p className="text-gray-600 mb-6">Select all services your clinic provides</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={() => handleArrayToggle('services', service)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm text-gray-700">{service}</span>
                </label>
              ))}
            </div>
            
            {formData.services.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Services ({formData.services.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service) => (
                    <span key={service} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
            <p className="text-gray-600 mb-6">Set your clinic's operating hours for each day</p>
            
            <div className="space-y-4">
              {Object.entries(formData.hours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </div>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => handleNestedInputChange('hours', day, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="9:00 AM - 5:00 PM or 'Closed'"
                  />
                </div>
              ))}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Use format like "9:00 AM - 5:00 PM" or simply "Closed" for days you're not open.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Accepted</h3>
            <p className="text-gray-600 mb-6">Select all insurance plans your clinic accepts</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {insuranceOptions.map((insurance) => (
                <label key={insurance} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptedInsurance.includes(insurance)}
                    onChange={() => handleArrayToggle('acceptedInsurance', insurance)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm text-gray-700">{insurance}</span>
                </label>
              ))}
            </div>
            
            {formData.acceptedInsurance.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Accepted Insurance ({formData.acceptedInsurance.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.acceptedInsurance.map((insurance) => (
                    <span key={insurance} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                      {insurance}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Clinic</h2>
          <p className="text-gray-600 mt-1">Register a new dental clinic on the platform</p>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 m-6 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              variant="outline"
              className="px-6 py-2"
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
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

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !validateStep(currentStep)}
                className="px-8 py-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Clinic'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}