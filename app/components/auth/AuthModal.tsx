// components/auth/AuthModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthModal() {
  const { authModal, hideAuthModal } = useAuth();
  const [currentAction, setCurrentAction] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    setCurrentAction(authModal.action);
  }, [authModal.action]);

  if (!authModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-white/20">
        {/* Close Button */}
        <button
          onClick={hideAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center p-6 border-b border-gray-200/50">
          <div className="mx-auto h-12 w-auto flex items-center justify-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600">DentalCare+</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentAction === 'login' ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-gray-600">
            {currentAction === 'login' 
              ? 'Sign in to book your dental appointment' 
              : 'Join thousands of satisfied patients'
            }
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100/70 m-6 rounded-lg p-1 backdrop-blur-sm">
          <button
            onClick={() => setCurrentAction('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentAction === 'login'
                ? 'bg-white/90 text-blue-600 shadow-sm backdrop-blur-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setCurrentAction('signup')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentAction === 'signup'
                ? 'bg-white/90 text-blue-600 shadow-sm backdrop-blur-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          {currentAction === 'login' ? (
            <LoginForm onSwitchToSignup={() => setCurrentAction('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setCurrentAction('login')} />
          )}
        </div>

        {/* Benefits Reminder */}
        <div className="bg-blue-50/80 backdrop-blur-sm border-t border-blue-100/50 p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Why sign up?</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-blue-800">
              <svg className="w-4 h-4 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Get $50 gift card after your first appointment
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <svg className="w-4 h-4 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant booking with verified dentists
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <svg className="w-4 h-4 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Manage all your appointments in one place
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}