
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { SharedHeader } from '@/components/shared/SharedHeader';

export function Header() {
  const { showAuthModal } = useAuth();
  const { patientInfo, isAuthenticated, logout } = usePatientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    showAuthModal('login');
  };

  const handleSignUp = () => {
    showAuthModal('signup');
  };

  // Get first name from full name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0] || fullName;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <SharedHeader 
          showDentistLogin={true} 
          showPatientAuth={true}
          className="sticky top-0 z-50" 
        />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
                <img 
                  src="/NearMe .Ai (350 x 180 px).png" 
                  alt="DentNearMe" 
                  className="h-8 w-auto"
                />
                <h1 className="text-2xl font-bold text-blue-600">DentNearMe</h1>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
                aria-label="Open mobile menu"
                title="Open mobile menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                  How it Works
                </a>
                <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                  Features
                </a>
                <a href="#about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                  About
                </a>
                
                {/* Clinic Login for Mobile */}
                <div className="border-t border-gray-200 pt-4">
                  <Link 
                    href="/clinic" 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                  >
                    Dentist Login
                  </Link>
                </div>
                
                {/* Mobile Auth Section */}
                {isAuthenticated && patientInfo ? (
                  <div className="border-t border-gray-200 pt-4 pb-3">
                    <div className="flex items-center px-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {getInitials(patientInfo.name)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">{patientInfo.name}</div>
                        <div className="text-sm font-medium text-gray-500">{patientInfo.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                  
                    
                      <Link href="/patient/appointments" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600">
                        My Appointments
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 pb-3 space-y-2">
                    <Button
                      onClick={handleSignIn}
                      variant="outline"
                      className="w-full mx-3"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleSignUp}
                      className="w-full mx-3 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Click outside to close dropdowns */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </header>
    </>
  );
}