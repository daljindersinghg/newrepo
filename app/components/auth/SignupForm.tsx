// components/auth/SignupForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';

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
  const { signup } = useAuth();
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
      const response = await fetch('/api/v1/patients/auth/signup/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError('Failed to send OTP. Please try again.');
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
      const response = await fetch('/api/v1/patients/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setError(null);
        // Could show a success message here
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
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
      const response = await fetch('/api/v1/patients/auth/signup/step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          otp: formData.otp.trim(),
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          dateOfBirth: formData.dateOfBirth,
          insuranceProvider: formData.insuranceProvider || undefined
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success is handled by the response (JWT cookie is set)
        window.location.reload(); // Refresh to update auth state
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (err: any) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = formData.email;
  const isStep2Valid = formData.otp && formData.name && formData.phone && formData.dateOfBirth;

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
        </div>
      </div>

      <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}>
        {step === 1 && (
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              <p className="mt-1 text-xs text-gray-500">We'll send you a verification code</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                readOnly
                value={formData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* OTP */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code *
                </label>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">Check your email for the verification code</p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Insurance Provider (Optional) */}
            <div>
              <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider (Optional)
              </label>
              <input
                id="insuranceProvider"
                name="insuranceProvider"
                type="text"
                value={formData.insuranceProvider}
                onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your insurance provider"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm mt-4">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className={`mt-6 ${step === 2 ? "flex space-x-4" : ""}`}>
          {step === 2 && (
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
          )}

          <Button
            type={step === 1 ? "button" : "submit"}
            onClick={step === 1 ? handleSendOTP : undefined}
            disabled={step === 1 ? (!isStep1Valid || isLoading) : (!isStep2Valid || isLoading)}
            className={`${step === 2 ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {step === 1 ? 'Sending code...' : 'Creating account...'}
              </div>
            ) : step === 1 ? (
              'Send Verification Code'
            ) : (
              'Create Account'
            )}
          </Button>
        </div>

        {/* Switch to Login */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign in here
          </button>
        </p>
      </form>
    </div>
  );
}