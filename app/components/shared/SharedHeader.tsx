'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { usePatientAuth } from '@/hooks/usePatientAuth';

interface SharedHeaderProps {
  showDentistLogin?: boolean;
  showPatientAuth?: boolean;
  customContent?: React.ReactNode;
  className?: string;
}

export function SharedHeader({ 
  showDentistLogin = false, 
  showPatientAuth = false, 
  customContent,
  className = ""
}: SharedHeaderProps) {
  const { showAuthModal } = useAuth();
  const { patientInfo, isAuthenticated, logout } = usePatientAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

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
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
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

          {/* Custom Content or Navigation */}
          <div className="flex items-center space-x-4">
            {customContent}
            
            {/* Dentist Login */}
            {showDentistLogin && (
              <Link 
                href="/clinic/login" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Dentist Login
              </Link>
            )}

            {/* Patient Auth */}
            {showPatientAuth && (
              <>
                {isAuthenticated && patientInfo ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-medium text-sm">
                          {getInitials(patientInfo.name)}
                        </span>
                      </div>
                      <span>{getFirstName(patientInfo.name)}</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                          <div className="font-medium text-gray-900">{patientInfo.name}</div>
                          <div>{patientInfo.email}</div>
                        </div>
                        <Link href="/patient/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Dashboard
                        </Link>
                        <Link href="/patient/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Profile
                        </Link>
                        <Link href="/patient/appointments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          My Appointments
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={handleSignIn}
                      variant="outline"
                      className="text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleSignUp}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
