// components/auth/AuthModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { useAppConfig } from '@/hooks/useAppConfig';

export function AuthModal() {
  const { authModal, hideAuthModal } = useAuth();
  const [currentAction, setCurrentAction] = useState<'login' | 'signup'>('login');
  const { giftCard } = useAppConfig();

  useEffect(() => {
    setCurrentAction(authModal.action);
  }, [authModal.action]);

  if (!authModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-xl border border-gray-200">
        {/* Close Button */}
        <button
          onClick={hideAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
          title="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center p-8 border-b border-gray-100">
          <div className="mx-auto h-16 w-auto flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {currentAction === 'login' ? 'Welcome Back!' : 'Join DentNearMe'}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentAction === 'login' 
              ? 'Sign in to manage your appointments and profile' 
              : 'Create your account to start booking with verified dentists'
            }
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-50 mx-8 mt-6 mb-4 rounded-xl p-1">
          <button
            onClick={() => setCurrentAction('login')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              currentAction === 'login'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setCurrentAction('signup')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              currentAction === 'signup'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Content */}
        <div className="px-8 pb-6">
          {currentAction === 'login' ? (
            <LoginForm onSwitchToSignup={() => setCurrentAction('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setCurrentAction('login')} />
          )}
        </div>

        {/* Benefits Reminder */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100 p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Member Benefits
          </h3>
          <div className="space-y-3">
            <div className="flex items-start text-sm text-blue-800">
              <svg className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{giftCard.full}</span> after your first appointment
            </div>
            <div className="flex items-start text-sm text-blue-800">
              <svg className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Instant booking</span> with verified dentists
            </div>
            <div className="flex items-start text-sm text-blue-800">
              <svg className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Manage appointments</span> all in one place
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}