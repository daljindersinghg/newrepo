# PostHog Analytics Dashboard Guide

## Overview
This guide explains how to use PostHog to track and understand patient interactions on your dental booking platform.

## 🚀 Getting Started with PostHog

### 1. Access Your PostHog Dashboard
- Go to [app.posthog.com](https://app.posthog.com)
- Sign in with your account credentials
- Select your project: "DentalCare+ Patient Tracking"

### 2. Key Dashboard Sections
- **📊 Insights**: Custom analytics and reports
- **👥 Persons**: Individual user profiles and journeys
- **🎯 Events**: All tracked events and properties
- **🔄 Funnels**: Conversion analysis
- **📈 Trends**: Usage patterns over time
- **🚨 Alerts**: Automated notifications

## 📊 Understanding What's Being Tracked

### Patient Authentication Events
```javascript
// Signup Process
patient_signup_step1_attempted   // User enters email
patient_signup_step1_success     // OTP sent successfully
patient_signup_step2_attempted   // User completes form
patient_signup_completed         // Registration successful

// Login Process
patient_login_step1_attempted    // User enters email
patient_login_completed          // Login successful
patient_logout                   // User logs out
```

### Patient Journey Events
```javascript
// Discovery & Search
landing_page_viewed              // User visits homepage
location_selected                // Address chosen
dentist_search_initiated         // Search started
previous_search_resumed          // Returning user

// Engagement
patient_page_viewed              // Any page visit
patient_dashboard_tab_clicked    // Dashboard navigation
patient_time_on_page            // Time tracking
```

### Business Events
```javascript
// Clinic Interactions
patient_clinic_viewed            // Clinic details viewed
patient_clinic_called            // Phone button clicked
patient_clinic_directions_clicked // Maps opened

// Appointments
patient_appointment_booking_started  // Booking form opened
patient_appointment_booked          // Appointment confirmed
```

## 🔍 How to Find Specific Information

### 1. Find Patients Who Dropped Off

**Navigate to**: Insights → Create Insight → Funnel

**Step-by-Step**:
1. Click "New Insight" → "Funnel"
2. Add steps:
   - Step 1: `landing_page_viewed`
   - Step 2: `patient_signup_step1_attempted`
   - Step 3: `patient_signup_completed`
   - Step 4: `dentist_search_initiated`
3. Set date range (e.g., "Last 30 days")
4. Click "Calculate"

**What You'll See**:
```
Landing Page:     1,000 users (100%)
Started Signup:     800 users (80%)   ← 200 dropped off
Completed Signup:   600 users (60%)   ← 200 more dropped off
Searched:           450 users (45%)   ← 150 more dropped off
```

### 2. Get Patient Details by Email

**Navigate to**: Persons → Search

**Step-by-Step**:
1. Go to "Persons" tab
2. Use search bar: Enter patient email
3. Click on their profile
4. View their complete journey timeline

**What You'll See**:
- All events for that specific patient
- Session duration and frequency
- Last activity timestamp
- Drop-off points
- Conversion events

### 3. Track Geographic Patterns

**Navigate to**: Insights → Create Insight → Trends

**Step-by-Step**:
1. Create new Trends insight
2. Event: `location_selected`
3. Break down by: Properties → `address`
4. Limit to top 20 locations
5. Set date range

**What You'll See**:
- Most popular search locations
- Geographic concentration of users
- Regional demand patterns

## 📈 Key Business Intelligence Queries

### 1. Daily Active Patients
```
Event: patient_session_started
Chart Type: Trends
Date Range: Last 30 days
Frequency: Daily
```

### 2. Conversion Funnel Analysis
```
Funnel Steps:
1. landing_page_viewed
2. location_selected
3. dentist_search_initiated
4. patient_clinic_viewed
5. patient_appointment_booked
```

### 3. Patient Retention Cohorts
```
Navigate to: Insights → Retention
Cohort by: patient_signup_completed
Return event: patient_login_completed
Period: Daily/Weekly
```

### 4. Feature Usage Heatmap
```
Event: patient_dashboard_tab_clicked
Break down by: tab_name
Chart: Bar chart
Date range: Last 7 days
```

## 🎯 Advanced Analytics

### 1. Create Custom Properties Dashboard

**Patient Acquisition Dashboard**:
1. Total signups (last 30 days)
2. Signup conversion rate
3. Top acquisition sources
4. Geographic distribution

**Patient Engagement Dashboard**:
1. Average session duration
2. Pages per session
3. Return user percentage
4. Feature adoption rates

### 2. Set Up Alerts

**Navigate to**: Alerts → Create Alert

**Useful Alerts**:
- **Drop in signups**: If daily signups < 10
- **High error rate**: If error events > 50/day
- **Low conversion**: If funnel conversion < 20%

### 3. Export Data

**For Further Analysis**:
1. Go to any insight
2. Click "..." menu
3. Select "Export to CSV"
4. Use in Excel/Google Sheets

## 🔧 Custom Queries for Your Business

### Find Patients Who Left During Signup
```sql
-- In PostHog SQL Editor
SELECT DISTINCT person.email
FROM events
WHERE event = 'patient_signup_step1_attempted'
AND person.id NOT IN (
  SELECT person.id 
  FROM events 
  WHERE event = 'patient_signup_completed'
)
AND timestamp > now() - interval 7 day
```

### Analyze Search-to-Booking Conversion
```sql
-- Search behavior analysis
SELECT 
  properties.$current_url as page,
  COUNT(*) as searches,
  COUNT(DISTINCT person.id) as unique_users
FROM events
WHERE event = 'dentist_search_initiated'
GROUP BY properties.$current_url
ORDER BY searches DESC
```

## 📊 Key Metrics to Monitor Daily

### 1. Health Metrics (Check Every Morning)
- **Active Users**: How many patients used the platform yesterday?
- **New Signups**: How many new patients registered?
- **Conversion Rate**: % of visitors who searched for dentists
- **Error Rate**: Any technical issues affecting users?

### 2. Business Metrics (Check Weekly)
- **Patient Lifetime Value**: How engaged are returning patients?
- **Geographic Trends**: Which areas have highest demand?
- **Feature Adoption**: Are patients using dashboard features?
- **Booking Conversion**: % of searches that lead to appointments

### 3. Growth Metrics (Check Monthly)
- **Cohort Retention**: Are patients coming back?
- **Funnel Optimization**: Where can we reduce drop-offs?
- **Feature Performance**: Which features drive most engagement?

## 🚨 Common Issues & Solutions

### Problem: No Events Showing Up
**Solution**:
1. Check if PostHog is properly initialized
2. Verify API key in environment variables
3. Check browser console for errors
4. Ensure events are being sent from frontend

### Problem: Duplicate Events
**Solution**:
1. Check if tracking code is called multiple times
2. Use distinct_id consistently
3. Implement event deduplication

### Problem: Missing User Properties
**Solution**:
1. Ensure `posthog.identify()` is called after login
2. Add user properties during signup
3. Update properties when user information changes

## 📱 Mobile Dashboard Access

**PostHog Mobile App**:
1. Download PostHog app from App Store/Play Store
2. Sign in with your credentials
3. View key metrics on-the-go
4. Set up push notifications for alerts

## 🎓 Best Practices

### 1. Regular Monitoring Schedule
- **Daily**: Check active users and error rates
- **Weekly**: Review conversion funnels
- **Monthly**: Analyze cohort retention and feature adoption

### 2. Data-Driven Decisions
- Use A/B testing for major changes
- Track before and after metrics
- Focus on actionable insights

### 3. Privacy Compliance
- Respect user opt-out preferences
- Anonymize sensitive data
- Follow GDPR guidelines

This guide provides the foundation for understanding your patient behavior through PostHog. Start with the basic funnels and gradually move to more advanced analysis as you become comfortable with the platform!
