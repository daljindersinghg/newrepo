'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { SharedHeader } from '@/components/shared/SharedHeader';

export function Header() {
  const { showAuthModal } = useAuth();
  const { patientInfo, isAuthenticated, logout } = usePatientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = () => showAuthModal('login');
  const handleSignUp = () => showAuthModal('signup');

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <SharedHeader
          showDentistLogin
          showPatientAuth
          className="sticky top-0 z-50"
        />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white shadow">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="DentNearMe"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-blue-600">DentNearMe</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(open => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="space-y-2 border-t p-4 bg-gray-50">
        

            {isAuthenticated && patientInfo ? (
              <>
                <div className="flex items-center space-x-3 py-2">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {getInitials(patientInfo.name)}
                  </div>
                  <div>
                    <p className="font-medium truncate">{patientInfo.name}</p>
                    <p className="text-sm text-gray-500 truncate">{patientInfo.email}</p>
                  </div>
                </div>

            
                <Link
                  href="/patient/appointments"
                  className="block py-2 px-4 hover:bg-white rounded"
                >
                  📅 Appointments
                </Link>
           
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 rounded"
                >
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    handleSignIn();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    handleSignUp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white"
                >
                  Sign Up
                </Button>
              </>
            )}
          </nav>
        )}
      </header>
    </>
  );
}
