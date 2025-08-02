
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { SharedHeader } from '@/components/shared/SharedHeader';
import { useRouter } from 'next/navigation';

export function Header() {
  const { showAuthModal } = useAuth();
  const { patientInfo, isAuthenticated, logout } = usePatientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleSignIn = () => {
    showAuthModal('login');
  };

  const handleSignUp = () => {
    showAuthModal('signup');
  };


  // Get initials for avatar
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!mobileMenuOpen) return;

      switch (event.key) {
        case 'Escape':
          setMobileMenuOpen(false);
          menuButtonRef.current?.focus();
          break;
        case 'Tab':
          // Let natural tab order work but ensure focus stays within menu
          const focusableElements = mobileMenuRef.current?.querySelectorAll(
            'a[href], button, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (event.shiftKey && document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus first menu item when opened
      setTimeout(() => {
        const firstFocusable = mobileMenuRef.current?.querySelector(
          'a[href], button'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

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
                ref={menuButtonRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative p-3 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                aria-expanded={mobileMenuOpen.toString()}
                aria-controls="mobile-menu"
                type="button"
              >
                <svg className="h-6 w-6 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div 
            className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
              mobileMenuOpen 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
            id="mobile-menu" 
            role="menu" 
            aria-orientation="vertical"
            ref={mobileMenuRef}
          >
            <div className="px-4 pt-4 pb-6 space-y-2 border-t border-gray-200 bg-gray-50 transform transition-transform duration-300 ease-in-out">
            
                
                {/* Clinic Login for Mobile */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Link 
                    href="/clinic" 
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                    role="menuitem"
                    tabIndex={0}
                  >
                    🦷 Dentist Login
                  </Link>
                </div>
                
                {/* Mobile Auth Section */}
                {isAuthenticated && patientInfo ? (
                  <div className="border-t border-gray-200 pt-4 pb-4 mt-4">
                    <div className="flex items-center px-4 py-3 bg-white rounded-lg mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {getInitials(patientInfo.name)}
                        </span>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <div className="text-base font-medium text-gray-800 truncate">{patientInfo.name}</div>
                        <div className="text-sm font-medium text-gray-500 truncate">{patientInfo.email}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link 
                        href="/patient/dashboard" 
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                        role="menuitem"
                        tabIndex={0}
                      >
                        📊 Dashboard
                      </Link>
                      <Link 
                        href="/patient/appointments" 
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                        role="menuitem"
                        tabIndex={0}
                      >
                        📅 My Appointments
                      </Link>
                      <Link 
                        href="/patient/profile" 
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
                        role="menuitem"
                        tabIndex={0}
                      >
                        👤 Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px]"
                        role="menuitem"
                        tabIndex={0}
                        type="button"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 pb-4 mt-4 space-y-3">
                    <Button
                      onClick={() => {
                        handleSignIn();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                      type="button"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleSignUp}
                      className="w-full h-12 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                      type="button"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* Click outside to close dropdowns */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden transition-opacity duration-300 ease-in-out"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>
    </>
  );
}