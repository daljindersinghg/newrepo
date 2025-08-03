'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

interface AutoNotificationsProps {
  clinicId?: string;
  patientId?: string;
  enabled?: boolean;
  silent?: boolean; // Don't show any UI
}

/**
 * Auto-initialize notifications component
 * Add this to any page where you want notifications enabled by default
 */
export function AutoNotifications({ 
  clinicId, 
  patientId, 
  enabled = true, 
  silent = true 
}: AutoNotificationsProps) {
  const { 
    isSupported, 
    permission, 
    initializeNotifications,
    fcmToken 
  } = useNotifications();

  useEffect(() => {
    if (!enabled || !isSupported) return;

    const autoInitialize = async () => {
      try {
        // Only auto-initialize if not already done and permission not denied
        if (!permission.denied && !fcmToken) {
          console.log('Auto-initializing notifications...');
          
          // For clinic pages
          if (clinicId) {
            await initializeNotifications(clinicId);
            if (!silent) {
              console.log('Notifications auto-enabled for clinic:', clinicId);
            }
          }
          
          // For patient pages - use a default identifier
          if (patientId) {
            await initializeNotifications(`patient_${patientId}`);
            if (!silent) {
              console.log('Notifications auto-enabled for patient:', patientId);
            }
          }
          
          // For general pages - use a default identifier
          if (!clinicId && !patientId) {
            await initializeNotifications('general_user');
            if (!silent) {
              console.log('Notifications auto-enabled for general user');
            }
          }
        }
      } catch (error) {
        if (!silent) {
          console.warn('Auto-initialization of notifications failed:', error);
        }
        // Silently fail - don't show errors to user for auto-enable
      }
    };

    // Delay auto-initialization to avoid blocking page load
    const timer = setTimeout(autoInitialize, 1000);
    
    return () => clearTimeout(timer);
  }, [enabled, isSupported, permission.denied, fcmToken, clinicId, patientId, initializeNotifications, silent]);

  // This component doesn't render anything visible
  if (silent) {
    return null;
  }

  // Optional: Show a subtle indicator when notifications are being initialized
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isSupported && !permission.granted && !permission.denied && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
            <span>Enabling notifications...</span>
          </div>
        </div>
      )}
      
      {permission.granted && fcmToken && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm text-sm text-green-800">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Notifications enabled</span>
          </div>
        </div>
      )}
    </div>
  );
}
