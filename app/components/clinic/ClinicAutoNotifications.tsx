'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { AUTO_ENABLE_CLINIC_NOTIFICATIONS } from '@/lib/config/app-config';

interface ClinicAutoNotificationsProps {
  clinicId: string;
  autoEnable?: boolean;
}

/**
 * Specialized component for auto-enabling notifications for clinics
 * More aggressive than the general AutoNotifications component
 */
export function ClinicAutoNotifications({ 
  clinicId, 
  autoEnable = AUTO_ENABLE_CLINIC_NOTIFICATIONS 
}: ClinicAutoNotificationsProps) {
  const { 
    isSupported, 
    permission, 
    initializeNotifications,
    fcmToken 
  } = useNotifications();

  useEffect(() => {
    if (!autoEnable || !isSupported || !clinicId) return;

    const enableClinicNotifications = async () => {
      try {
        // More aggressive auto-enabling for clinics
        if (!fcmToken && !permission.denied) {
          console.log('Auto-enabling notifications for clinic:', clinicId);
          
          // Try to initialize notifications automatically
          await initializeNotifications(clinicId);
          
          console.log('✅ Clinic notifications enabled automatically');
        } else if (fcmToken) {
          console.log('✅ Clinic notifications already enabled');
        } else if (permission.denied) {
          console.log('⚠️ Clinic notifications denied by user');
        }
      } catch (error) {
        console.warn('Failed to auto-enable clinic notifications:', error);
        // Don't show errors to clinic users for auto-enable attempts
      }
    };

    // Try immediately when component mounts
    enableClinicNotifications();
    
    // Also try again after a short delay in case of timing issues
    const retryTimer = setTimeout(enableClinicNotifications, 2000);
    
    return () => clearTimeout(retryTimer);
  }, [autoEnable, isSupported, clinicId, fcmToken, permission.denied, initializeNotifications]);

  // This component is invisible - just handles auto-enabling
  return null;
}
