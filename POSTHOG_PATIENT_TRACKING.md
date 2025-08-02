# Patient Interaction Tracking with PostHog - Implementation Summary

## Overview
This implementation provides comprehensive patient behavior tracking using PostHog to monitor patient interactions, identify drop-offs, and track user journeys by email.

## 🔧 Backend Implementation

### 1. PostHog Service (`/api/src/posthog.ts`)
- **Enabled PostHog**: Uncommented and configured PostHog for server-side tracking
- **Helper Functions**:
  - `trackPatientEvent()`: Track any patient event with email identification
  - `identifyPatient()`: Identify and associate patient properties with email

### 2. Authentication Tracking (`/api/src/controllers/patientAuth.controller.ts`)
**Signup Process Tracking**:
- `patient_signup_step1_attempted` - When user enters email
- `patient_signup_step1_success/failed` - OTP send result
- `patient_signup_step2_attempted` - When completing registration
- `patient_signup_step2_validation_failed` - Missing required fields
- `patient_signup_completed` - Successful registration with patient identification

**Login Process Tracking**:
- `patient_login_step1_attempted` - Login email submitted
- `patient_login_step1_success/failed` - OTP send result
- `patient_login_step2_attempted` - OTP verification attempt
- `patient_login_completed` - Successful login
- `patient_logout` - User logout with session duration

### 3. Analytics API (`/api/src/controllers/analytics.controller.ts`)
**New Endpoints**:
- `GET /api/v1/admin/analytics/patient-events` - Get patient events by email/date
- `GET /api/v1/admin/analytics/patient-journey` - Individual patient journey
- `GET /api/v1/admin/analytics/patient-dropoffs` - Drop-off analysis
- `POST /api/v1/admin/analytics/patient-cohort` - Cohort retention analysis

### 4. Event Definitions (`/api/src/config/posthog.events.ts`)
**Structured Event Names**: 50+ predefined events covering entire patient journey
**Drop-off Points**: 9 critical stages monitored for abandonment
**Type Safety**: TypeScript interfaces for all event data structures

## 🎯 Frontend Implementation

### 1. Patient Tracking Hook (`/app/hooks/usePatientTracking.tsx`)
**Comprehensive Tracking Functions**:
- `trackEvent()` - Generic event tracking with patient context
- `trackPageView()` - Page visits with time tracking
- `trackFormEvent()` - Form interactions (started/completed/abandoned)
- `trackSearch()` - Search behavior and results
- `trackClinicInteraction()` - Clinic viewing/calling/booking
- `trackAppointmentEvent()` - Appointment lifecycle events
- `trackDropOff()` - User abandonment tracking
- `trackError()` - Error and issue tracking

### 2. Page Tracking Hook (`usePageTracking()`)
**Automatic Page Monitoring**:
- Tracks page visits on component mount
- Monitors time spent on each page
- Detects drop-offs via beforeunload and visibility change events

### 3. Dashboard Tracking (`/app/components/patient/PatientDashboardLayout.tsx`)
**User Interaction Tracking**:
- Tab navigation between dashboard sections
- Session duration calculation
- Logout behavior tracking

### 4. Search Tracking (`/app/components/landing/EnhancedSearchHero.tsx`)
**Search Behavior Monitoring**:
- Location selection tracking with coordinates
- Search initiation with detailed parameters
- Previous search resumption tracking

## 📊 What Gets Tracked

### Patient Journey Events
1. **Landing Page** → Location selection → Search initiation
2. **Authentication** → Email entry → OTP verification → Registration completion
3. **Dashboard Access** → Tab navigation → Feature usage
4. **Clinic Discovery** → Search → View details → Contact/Book
5. **Appointments** → Booking → Confirmation → Management

### Drop-off Identification
**By Email**: Track exactly where each patient drops off:
- Landing page without search
- Started signup but didn't complete
- Completed signup but never logged in
- Logged in but never searched
- Searched but never contacted clinic
- Started booking but didn't complete

### Key Metrics Captured
- **Time spent** on each page/section
- **Conversion rates** at each funnel stage
- **Return user behavior** and engagement patterns
- **Search patterns** and location preferences
- **Error encounters** and technical issues

## 🎯 Business Intelligence Queries

### Find Patients Who Left
```javascript
// Patients who dropped off at signup
posthog.getEvents({
  event: 'patient_signup_step1_attempted',
  where: 'not exists(patient_signup_completed)'
})

// Patients who searched but never booked
posthog.getEvents({
  event: 'dentist_search_initiated',
  where: 'not exists(patient_appointment_booked)'
})
```

### Patient Return Analysis
```javascript
// Identify returning vs new patients
posthog.getEvents({
  event: 'patient_login_completed',
  properties: { returning_user: true }
})
```

### Conversion Funnel
1. **Landing Page** → Search Initiated (%)
2. **Search** → Clinic Contacted (%)
3. **Contact** → Appointment Booked (%)
4. **Booking** → Appointment Completed (%)

## 🚀 Usage Examples

### Track Patient Actions
```typescript
const { trackEvent, trackClinicInteraction } = usePatientTracking();

// Track clinic contact
trackClinicInteraction('called', {
  clinic_id: '123',
  clinic_name: 'Downtown Dental',
  call_duration: 120
});

// Track form abandonment
trackFormEvent('appointment_booking', 'abandoned', {
  completion_percentage: 75,
  last_step: 'insurance_details'
});
```

### Monitor Page Performance
```typescript
// Automatic page tracking
usePageTracking('clinic_details', {
  clinic_id: '123',
  came_from: 'search_results'
});
```

## 📈 Analytics Dashboard Potential

With this tracking implementation, you can build dashboards showing:

1. **Patient Acquisition Funnel** with email-level detail
2. **Drop-off Heatmaps** by page and action
3. **Cohort Analysis** for patient retention
4. **Geographic Search Patterns** for clinic placement
5. **Feature Usage Analytics** for product optimization
6. **Customer Journey Visualization** for UX improvements

## 🔐 Privacy & Compliance

- **Email-based identification** for precise user tracking
- **GDPR-compliant** event structure with user consent
- **Data retention** policies configurable in PostHog
- **Opt-out mechanisms** available for privacy-conscious users

This comprehensive implementation provides deep insights into patient behavior while maintaining user privacy and enabling data-driven optimization of the dental booking platform.
