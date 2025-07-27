// components/results/EmailCapture.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface EmailCaptureProps {
  onSubmit: (email: string) => void;
  doctorCount: number;
  location: string;
}

export function EmailCapture({ onSubmit, doctorCount, location }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(email);
  };

  const handleSkip = () => {
    onSubmit(''); // Empty email means skipped
  };

  // Show skip option after 5 seconds
  useState(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 5000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        {/* Gift Card Visual */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            View {doctorCount} Dentists
          </h2>
          <p className="text-gray-600">
            Enter your email to see verified dentists in {location} and get your $50 gift card info
          </p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address (Optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              'View Dentist Results'
            )}
          </Button>
        </form>

        {/* Benefits */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Get $50 gift card after your first appointment
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Instant booking with verified dentists
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No spam, just dental appointment updates
          </div>
        </div>

        {/* Skip Option (after 5 seconds) */}
        {showSkip && (
          <div className="mt-4 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Continue without email
            </button>
          </div>
        )}

        {/* Privacy Note */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          We respect your privacy. Your email is only used for appointment confirmations and gift card delivery.
        </p>
      </div>
    </div>
  );
}