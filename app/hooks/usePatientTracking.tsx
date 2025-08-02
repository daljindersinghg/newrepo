'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { usePatientAuth } from './usePatientAuth';

interface PatientTrackingEvent {
  action: string;
  properties?: Record<string, any>;
}

export function usePatientTracking() {
  const { patientInfo } = usePatientAuth();

  // Initialize patient tracking when patient info is available
  useEffect(() => {
    if (patientInfo?.email && patientInfo?.isAuthenticated) {
      // Identify the patient in PostHog
      posthog.identify(patientInfo.email, {
        email: patientInfo.email,
        name: patientInfo.name,
        phone: patientInfo.phone,
        patient_id: patientInfo._id,
        is_authenticated: true,
        last_seen: new Date().toISOString()
      });

      // Track patient session start
      posthog.capture('patient_session_started', {
        email: patientInfo.email,
        patient_id: patientInfo._id,
        session_type: 'authenticated'
      });
    }
  }, [patientInfo]);

  // Track patient events
  const trackEvent = (event: string, properties: Record<string, any> = {}) => {
    if (typeof window === 'undefined') return;

    const eventProperties = {
      ...properties,
      email: patientInfo?.email,
      patient_id: patientInfo?._id,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_path: window.location.pathname
    };

    posthog.capture(event, eventProperties);
  };

  // Track page views
  const trackPageView = (pageName: string, additionalProperties: Record<string, any> = {}) => {
    trackEvent('patient_page_viewed', {
      page_name: pageName,
      ...additionalProperties
    });
  };

  // Track form interactions
  const trackFormEvent = (formName: string, action: 'started' | 'completed' | 'abandoned', data: Record<string, any> = {}) => {
    trackEvent(`patient_form_${action}`, {
      form_name: formName,
      ...data
    });
  };

  // Track search interactions
  const trackSearch = (searchType: string, query: string, results?: any[]) => {
    trackEvent('patient_search_performed', {
      search_type: searchType,
      query,
      results_count: results?.length || 0,
      has_results: (results?.length || 0) > 0
    });
  };

  // Track clinic interactions
  const trackClinicInteraction = (action: string, clinicData: Record<string, any> = {}) => {
    trackEvent(`patient_clinic_${action}`, {
      clinic_id: clinicData.id,
      clinic_name: clinicData.name,
      clinic_address: clinicData.address,
      ...clinicData
    });
  };

  // Track appointment interactions
  const trackAppointmentEvent = (action: string, appointmentData: Record<string, any> = {}) => {
    trackEvent(`patient_appointment_${action}`, {
      appointment_id: appointmentData.id,
      clinic_id: appointmentData.clinicId,
      appointment_date: appointmentData.date,
      appointment_time: appointmentData.time,
      ...appointmentData
    });
  };

  // Track user journey milestones
  const trackMilestone = (milestone: string, data: Record<string, any> = {}) => {
    trackEvent('patient_milestone_reached', {
      milestone,
      ...data
    });
  };

  // Track time spent on page
  const trackTimeOnPage = (pageName: string) => {
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('patient_time_on_page', {
        page_name: pageName,
        time_spent_seconds: timeSpent,
        time_spent_minutes: Math.round(timeSpent / 60)
      });
    };
  };

  // Track patient drop-off (when they leave)
  const trackDropOff = (currentStep: string, data: Record<string, any> = {}) => {
    trackEvent('patient_dropped_off', {
      drop_off_step: currentStep,
      ...data
    });
  };

  // Track errors
  const trackError = (errorType: string, errorMessage: string, context: Record<string, any> = {}) => {
    trackEvent('patient_error_encountered', {
      error_type: errorType,
      error_message: errorMessage,
      ...context
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackFormEvent,
    trackSearch,
    trackClinicInteraction,
    trackAppointmentEvent,
    trackMilestone,
    trackTimeOnPage,
    trackDropOff,
    trackError,
    patientInfo
  };
}

// Hook for tracking page visits and drop-offs
export function usePageTracking(pageName: string, additionalData: Record<string, any> = {}) {
  const { trackPageView, trackTimeOnPage, trackDropOff } = usePatientTracking();

  useEffect(() => {
    // Track page view
    trackPageView(pageName, additionalData);

    // Set up time tracking
    const stopTimeTracking = trackTimeOnPage(pageName);

    // Track drop-off on page unload
    const handleBeforeUnload = () => {
      trackDropOff(pageName, {
        ...additionalData,
        unload_type: 'before_unload'
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackDropOff(pageName, {
          ...additionalData,
          unload_type: 'visibility_hidden'
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimeTracking();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pageName]);
}
