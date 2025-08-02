// api/src/config/posthog.events.ts

// Define all patient tracking events for consistency
export const PATIENT_EVENTS = {
  // Authentication Events
  SIGNUP_STEP1_ATTEMPTED: 'patient_signup_step1_attempted',
  SIGNUP_STEP1_SUCCESS: 'patient_signup_step1_success',
  SIGNUP_STEP1_FAILED: 'patient_signup_step1_failed',
  SIGNUP_STEP2_ATTEMPTED: 'patient_signup_step2_attempted',
  SIGNUP_STEP2_VALIDATION_FAILED: 'patient_signup_step2_validation_failed',
  SIGNUP_COMPLETED: 'patient_signup_completed',
  SIGNUP_STEP2_FAILED: 'patient_signup_step2_failed',
  
  LOGIN_STEP1_ATTEMPTED: 'patient_login_step1_attempted',
  LOGIN_STEP1_SUCCESS: 'patient_login_step1_success',
  LOGIN_STEP1_FAILED: 'patient_login_step1_failed',
  LOGIN_STEP2_ATTEMPTED: 'patient_login_step2_attempted',
  LOGIN_STEP2_VALIDATION_FAILED: 'patient_login_step2_validation_failed',
  LOGIN_COMPLETED: 'patient_login_completed',
  LOGIN_STEP2_FAILED: 'patient_login_step2_failed',
  
  LOGOUT: 'patient_logout',

  // Session Events
  SESSION_STARTED: 'patient_session_started',
  TIME_ON_PAGE: 'patient_time_on_page',
  PAGE_VIEWED: 'patient_page_viewed',

  // Dashboard Events
  DASHBOARD_TAB_CLICKED: 'patient_dashboard_tab_clicked',
  
  // Search & Discovery Events
  LANDING_PAGE_VIEWED: 'landing_page_viewed',
  LOCATION_SELECTED: 'location_selected',
  SEARCH_PERFORMED: 'patient_search_performed',
  DENTIST_SEARCH_INITIATED: 'dentist_search_initiated',
  PREVIOUS_SEARCH_RESUMED: 'previous_search_resumed',
  CLINIC_SEARCH_INITIATED: 'patient_clinic_search_initiated',

  // Clinic Interaction Events
  CLINIC_VIEWED: 'patient_clinic_viewed',
  CLINIC_DETAILS_VIEWED: 'patient_clinic_details_viewed',
  CLINIC_CALLED: 'patient_clinic_called',
  CLINIC_DIRECTIONS_CLICKED: 'patient_clinic_directions_clicked',
  CLINIC_WEBSITE_VISITED: 'patient_clinic_website_visited',

  // Appointment Events
  APPOINTMENT_BOOKING_STARTED: 'patient_appointment_booking_started',
  APPOINTMENT_TIME_SELECTED: 'patient_appointment_time_selected',
  APPOINTMENT_BOOKED: 'patient_appointment_booked',
  APPOINTMENT_CANCELLED: 'patient_appointment_cancelled',
  APPOINTMENT_RESCHEDULED: 'patient_appointment_rescheduled',
  APPOINTMENT_REMINDER_VIEWED: 'patient_appointment_reminder_viewed',

  // Form Events
  FORM_STARTED: 'patient_form_started',
  FORM_COMPLETED: 'patient_form_completed',
  FORM_ABANDONED: 'patient_form_abandoned',

  // Milestone Events
  MILESTONE_REACHED: 'patient_milestone_reached',

  // Drop-off Events
  DROPPED_OFF: 'patient_dropped_off',

  // Error Events
  ERROR_ENCOUNTERED: 'patient_error_encountered'
} as const;

// Define patient journey stages for funnel analysis
export const PATIENT_JOURNEY_STAGES = {
  AWARENESS: 'awareness',
  INTEREST: 'interest',
  CONSIDERATION: 'consideration',
  INTENT: 'intent',
  EVALUATION: 'evaluation',
  PURCHASE: 'purchase',
  RETENTION: 'retention',
  ADVOCACY: 'advocacy'
} as const;

// Define drop-off points to monitor
export const DROP_OFF_POINTS = {
  LANDING_PAGE: 'landing_page',
  SIGNUP_STEP1: 'signup_step1',
  SIGNUP_STEP2: 'signup_step2',
  EMAIL_VERIFICATION: 'email_verification',
  PROFILE_COMPLETION: 'profile_completion',
  SEARCH_RESULTS: 'search_results',
  CLINIC_DETAILS: 'clinic_details',
  APPOINTMENT_FORM: 'appointment_form',
  APPOINTMENT_CONFIRMATION: 'appointment_confirmation'
} as const;

// Properties that should be included with every event
export const COMMON_EVENT_PROPERTIES = {
  timestamp: () => new Date().toISOString(),
  environment: () => process.env.NODE_ENV || 'development',
  platform: 'web',
  source: 'dental_care_app'
} as const;

// Patient properties for identification
export interface PatientProperties {
  email: string;
  name?: string;
  phone?: string;
  patient_id?: string;
  signup_date?: string;
  signup_method?: string;
  has_insurance?: boolean;
  insurance_provider?: string;
  location?: {
    city?: string;
    province?: string;
    country?: string;
  };
  preferences?: {
    preferred_appointment_time?: string;
    communication_method?: string;
  };
}

// Event data structures for type safety
export interface AuthenticationEventData {
  email: string;
  step: number;
  ip_address?: string;
  user_agent?: string;
  success?: boolean;
  error_message?: string;
  login_method?: string;
  signup_method?: string;
}

export interface SearchEventData {
  search_type: string;
  query: string;
  results_count?: number;
  has_results?: boolean;
  filters_applied?: Record<string, any>;
  search_location?: {
    address: string;
    lat: number;
    lng: number;
    place_id?: string;
  };
}

export interface ClinicEventData {
  clinic_id?: string;
  clinic_name?: string;
  clinic_address?: string;
  clinic_phone?: string;
  clinic_rating?: number;
  action_type?: string;
}

export interface AppointmentEventData {
  appointment_id?: string;
  clinic_id?: string;
  appointment_date?: string;
  appointment_time?: string;
  service_type?: string;
  booking_channel?: string;
  status?: string;
}

// Helper functions for event tracking
export const createEventProperties = (
  baseProperties: Record<string, any> = {},
  email?: string
): Record<string, any> => {
  return {
    timestamp: new Date().toISOString(),
    ...baseProperties,
    email,
    environment: process.env.NODE_ENV || 'development',
    platform: COMMON_EVENT_PROPERTIES.platform,
    source: COMMON_EVENT_PROPERTIES.source
  };
};

export const getDropOffStage = (currentPage: string): string => {
  const stageMap: Record<string, string> = {
    '/': DROP_OFF_POINTS.LANDING_PAGE,
    '/auth/signup': DROP_OFF_POINTS.SIGNUP_STEP1,
    '/auth/verify': DROP_OFF_POINTS.EMAIL_VERIFICATION,
    '/patient/dashboard': DROP_OFF_POINTS.PROFILE_COMPLETION,
    '/results': DROP_OFF_POINTS.SEARCH_RESULTS,
    '/clinic': DROP_OFF_POINTS.CLINIC_DETAILS,
    '/appointments': DROP_OFF_POINTS.APPOINTMENT_FORM
  };

  return stageMap[currentPage] || 'unknown_page';
};
