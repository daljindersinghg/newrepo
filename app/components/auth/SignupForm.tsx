// components/auth/SignupForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

interface SignupData {
  email: string;
  otp: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  insuranceProvider?: string;
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signup, hideAuthModal } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    otp: '',
    name: '',
    phone: '',
    dateOfBirth: '',
    insuranceProvider: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateStep1 = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.otp.trim()) {
      setError('Please enter the OTP code');
      return false;
    }

    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }

    if (!formData.dateOfBirth) {
      setError('Please enter your date of birth');
      return false;
    }

    return true;
  };

  const handleSendOTP = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/v1/patients/auth/signup/step1', {

        email: formData.email.toLowerCase().trim()
      });

      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtpSent(false);
    setError(null);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/v1/patients/auth/resend-otp', {
        email: formData.email.toLowerCase().trim()
      });

      if (response.data.success) {
        setError(null);
        // Could show a success message here
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/v1/patients/auth/signup/step2', {
        email: formData.email.toLowerCase().trim(),
        otp: formData.otp.trim(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth,
        insuranceProvider: formData.insuranceProvider || undefined
      });

      if (response.data.success) {
        // Store user info in localStorage using returned patient data
        const userInfo = {
          _id: response.data.patient?._id, // Store patient ID
          name: response.data.patient?.name || formData.name.trim(),
          email: response.data.patient?.email || formData.email.toLowerCase().trim(),
          phone: response.data.patient?.phone || formData.phone.trim(),
          isAuthenticated: true,
          signupCompletedAt: new Date().toISOString()
        };
        localStorage.setItem('patientInfo', JSON.stringify(userInfo));
        
        // Close the modal first, then reload
        hideAuthModal();
        
        // Small delay to ensure modal closes before reload
        setTimeout(() => {
          window.location.reload(); // Refresh to update auth state
        }, 100);
      } else {
        setError(response.data.message || 'Failed to create account');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = formData.email;
  const isStep2Valid = formData.otp && formData.name && formData.phone && formData.dateOfBirth;

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-600">Email</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-600">Details</span>
          </div>
        </div>
      </div>

      <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}>
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter your email</h3>
              <p className="text-sm text-gray-600">We'll send you a verification code to get started</p>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email address"
              />
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your email is secure and never shared
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete your profile</h3>
              <p className="text-sm text-gray-600">Just a few more details to get you started</p>
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                readOnly
                value={formData.email}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed text-gray-600"
              />
            </div>

            {/* OTP */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50 font-medium"
                >
                  Resend Code
                </button>
              </div>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={formData.otp}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-wider"
                placeholder="000000"
                maxLength={6}
              />
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Check your email for the 6-digit code
              </p>
            </div>

            {/* Name and Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Insurance Provider (Optional) */}
            <div>
              <label htmlFor="insuranceProvider" className="block text-sm font-semibold text-gray-700 mb-2">
                Insurance Provider <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="insuranceProvider"
                name="insuranceProvider"
                type="text"
                value={formData.insuranceProvider}
                onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Blue Cross, Aetna, etc."
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mt-6 flex items-start">
            <svg className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className={`mt-8 ${step === 2 ? "flex space-x-3" : ""}`}>
          {step === 2 && (
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="flex-1 py-3 rounded-xl border-gray-300 hover:bg-gray-50"
            >
              Back
            </Button>
          )}

          <Button
            type={step === 1 ? "button" : "submit"}
            onClick={step === 1 ? handleSendOTP : undefined}
            disabled={step === 1 ? (!isStep1Valid || isLoading) : (!isStep2Valid || isLoading)}
            className={`${step === 2 ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {step === 1 ? 'Sending Code...' : 'Creating Account...'}
              </div>
            ) : step === 1 ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Verification Code
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Create Account
              </>
            )}
          </Button>
        </div>

        {/* Switch to Login */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 font-semibold transition-colors"
          >
            Sign in here
          </button>
        </p>
      </form>
    </div>
  );
}