'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff, X, AlertCircle, CheckCircle } from 'lucide-react';

interface NotificationPermissionBannerProps {
  clinicId: string;
  onPermissionGranted?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function NotificationPermissionBanner({
  clinicId,
  onPermissionGranted,
  onDismiss,
  className = ""
}: NotificationPermissionBannerProps) {
  const {
    isSupported,
    permission,
    isLoading,
    error,
    initializeNotifications,
    requestPermission
  } = useNotifications();

  const [isDismissed, setIsDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if banner should be shown
  const shouldShowBanner = 
    isSupported && 
    !isDismissed && 
    !permission.granted && 
    !permission.denied;

  useEffect(() => {
    if (permission.granted && onPermissionGranted) {
      onPermissionGranted();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [permission.granted, onPermissionGranted]);

  const handleEnableNotifications = async () => {
    try {
      await initializeNotifications(clinicId);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Failed to request permission:', error);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!shouldShowBanner) {
    return null;
  }

  if (showSuccess) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Notifications Enabled!
            </h3>
            <p className="text-sm text-green-700 mt-1">
              You'll now receive push notifications for new appointments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Bell className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            Stay Updated with Push Notifications
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Get instant notifications when patients book new appointments or make changes to existing ones.
          </p>
          
          {error && (
            <div className="mt-2 flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          <div className="mt-3 flex items-center space-x-3">
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enabling...
                </div>
              ) : (
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </div>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="text-gray-600 border-gray-300"
            >
              Maybe Later
            </Button>
          </div>

          <div className="mt-2 text-xs text-blue-600">
            💡 Tip: You can always enable notifications later in your clinic settings.
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="ml-3 text-blue-400 hover:text-blue-600 transition-colors"
          aria-label="Dismiss notification banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function NotificationPermissionCard({
  clinicId,
  onPermissionGranted,
  className = ""
}: Omit<NotificationPermissionBannerProps, 'onDismiss'>) {
  const {
    isSupported,
    permission,
    isLoading,
    initializeNotifications
  } = useNotifications();

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (permission.granted && onPermissionGranted) {
      onPermissionGranted();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [permission.granted, onPermissionGranted]);

  const handleEnableNotifications = async () => {
    try {
      await initializeNotifications(clinicId);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (permission.granted) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              Notifications Active
            </h3>
            <p className="text-sm text-gray-500">
              You'll receive appointment alerts
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission.denied) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <BellOff className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              Notifications Blocked
            </h3>
            <p className="text-sm text-gray-500">
              Enable in browser settings to receive alerts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">
              Enable Notifications
            </h3>
            <p className="text-sm text-gray-500">
              Get instant appointment alerts
            </p>
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Enable'
          )}
        </Button>
      </div>
    </div>
  );
}