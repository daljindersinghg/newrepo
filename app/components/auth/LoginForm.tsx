// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

interface LoginData {
  email: string;
  otp: string;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (field: keyof LoginData, value: string) => {
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

  const handleSendOTP = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/patients/auth/login/step1', {
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
        setError(data.message || 'Failed to send login code');
      }
    } catch (err: any) {
      setError('Failed to send login code. Please try again.');
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
      const response = await fetch('/api/v1/patients/auth/login/step1', {
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
        setError(data.message || 'Failed to resend login code');
      }
    } catch (err: any) {
      setError('Failed to resend login code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      setError('Please enter the login code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/patients/auth/login/step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          otp: formData.otp.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success is handled by the response (JWT cookie is set)
        window.location.reload(); // Refresh to update auth state
      } else {
        setError(data.message || 'Invalid login code');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = formData.email;
  const isStep2Valid = formData.otp;

  return (
    <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()} className="space-y-4">
      {step === 1 && (
        <>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
            <p className="mt-1 text-xs text-gray-500">We'll send you a login code</p>
          </div>
        </>
      )}

      {step === 2 && (
        <>
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
                Login Code
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
            <p className="mt-1 text-xs text-gray-500">Check your email for the login code</p>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className={step === 2 ? "flex space-x-4" : ""}>
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
          className={`${step === 2 ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white py-2.5`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {step === 1 ? 'Sending code...' : 'Signing in...'}
            </div>
          ) : step === 1 ? (
            'Send Login Code'
          ) : (
            'Sign In'
          )}
        </Button>
      </div>

      {/* Switch to Signup */}
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign up now
        </button>
      </p>
    </form>
  );
}