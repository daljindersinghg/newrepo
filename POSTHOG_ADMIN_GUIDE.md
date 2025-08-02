# PostHog Admin Dashboard - Quick Reference Guide

## 🎯 What You Can Track Now

Your dental booking platform now tracks every patient interaction. Here's how to use this data effectively.

## 📊 Access Your Analytics

### Option 1: PostHog Web Dashboard
1. Go to [app.posthog.com](https://app.posthog.com)
2. Sign in and select your project
3. Use the insights below to understand patient behavior

### Option 2: Your Custom API Endpoints
```bash
# Get patient events by email
curl "http://localhost:3001/api/v1/admin/analytics/patient-events?email=patient@example.com"

# Get patient journey
curl "http://localhost:3001/api/v1/admin/analytics/patient-journey?email=patient@example.com"

# Get drop-off analysis
curl "http://localhost:3001/api/v1/admin/analytics/patient-dropoffs"

# Get retention cohorts
curl -X POST "http://localhost:3001/api/v1/admin/analytics/patient-cohort" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2025-01-01","endDate":"2025-01-31"}'
```

## 🔍 Key Insights to Create in PostHog

### 1. Patient Signup Funnel (High Priority)
**Purpose**: Find where patients drop off during registration

**Setup**:
- Go to Insights → New Insight → Funnel
- Add these steps:
  1. `patient_signup_step1_attempted`
  2. `patient_signup_step2_attempted` 
  3. `patient_signup_completed`
- Set timeframe: Last 30 days

**What to Look For**:
- Step 1→2 drop: Email delivery issues
- Step 2→3 drop: Form too complex or errors

### 2. Search to Booking Conversion (Business Critical)
**Purpose**: Measure how many searches lead to appointments

**Setup**:
- Funnel with steps:
  1. `dentist_search_initiated`
  2. `patient_clinic_viewed`
  3. `patient_appointment_booked`

**What to Look For**:
- Low clinic viewing: Poor search results
- Low booking rate: Contact/booking process issues

### 3. Patient Return Rate (Retention)
**Purpose**: Understand if patients come back

**Setup**:
- Go to Insights → Retention
- First time: `patient_signup_completed`
- Return event: `patient_login_completed`
- Period: Weekly

### 4. Geographic Demand (Business Intelligence)
**Purpose**: See where your patients are located

**Setup**:
- Trends insight
- Event: `location_selected`
- Break down by: `address` property
- Chart type: Map (if available) or Bar chart

## 🚨 Daily Monitoring Checklist

### Every Morning (5 minutes)
1. **Active Patients**: Check if usage is normal
   - Event: `patient_session_started`
   - Date: Yesterday
   - Compare to previous day

2. **New Signups**: Track growth
   - Event: `patient_signup_completed`
   - Date: Yesterday
   - Set alert if < 5 signups/day

3. **Error Check**: Look for technical issues
   - Event: `patient_error_encountered`
   - Date: Yesterday
   - Investigate if > 10 errors

### Weekly Review (15 minutes)
1. **Funnel Performance**: Check conversion rates
2. **Top Search Locations**: Understand demand
3. **Feature Usage**: Which dashboard tabs are used most
4. **Patient Journey**: Review individual user flows

## 📧 Find Specific Patient Information

### By Email Address
1. Go to PostHog → Persons
2. Search for: `email@example.com`
3. Click on the person
4. See their complete journey timeline

### By Behavior Pattern
1. Go to Insights → Cohorts
2. Create cohort: "Patients who searched but didn't book"
3. Conditions:
   - Performed: `dentist_search_initiated`
   - Did NOT perform: `patient_appointment_booked`
   - In last 30 days

## 🎨 Understanding Event Properties

### Each Event Includes:
```json
{
  "event": "patient_signup_completed",
  "timestamp": "2025-01-15T10:30:00Z",
  "email": "patient@example.com",
  "properties": {
    "name": "John Doe",
    "phone": "+1234567890",
    "signup_method": "email_otp",
    "ip_address": "192.168.1.1",
    "user_agent": "Chrome/91.0..."
  }
}
```

### Key Properties to Filter By:
- **email**: Identify specific patients
- **ip_address**: Geographic analysis
- **user_agent**: Device/browser insights
- **step**: Track multi-step processes
- **coordinates**: Location-based analysis

## 🔧 Practical Use Cases

### Use Case 1: "Why did this patient stop using our platform?"
1. Search patient by email in Persons
2. Look at their event timeline
3. Find last activity and context
4. Common patterns:
   - Stopped after search → Poor results
   - Stopped after clinic view → Contact issues
   - Stopped during booking → Form problems

### Use Case 2: "Which locations need more dentists?"
1. Create Trends insight
2. Event: `dentist_search_initiated`
3. Break down by: `address` property
4. Sort by volume
5. High search volume + low booking rate = supply gap

### Use Case 3: "Is our new feature working?"
1. Before/after comparison
2. Events: Feature-specific events
3. Time period: Before and after feature launch
4. Metrics: Usage rate and user satisfaction

## 📈 Setting Up Alerts

### Critical Alerts to Set Up:
1. **Daily signups drop below 5**
2. **Error rate exceeds 50/day**
3. **Search-to-booking conversion below 10%**
4. **No activity for 2+ hours during business hours**

### How to Set Up Alerts:
1. Go to PostHog → Alerts
2. Create new alert
3. Set condition and threshold
4. Choose notification method (email/Slack)

## 🎯 Quick Wins

### Week 1: Set up basic monitoring
- Create signup funnel
- Monitor daily active users
- Set up error alerts

### Week 2: Analyze patient behavior
- Review individual patient journeys
- Identify common drop-off points
- Create geographic demand map

### Week 3: Optimize based on data
- A/B test signup flow improvements
- Improve high-drop-off pages
- Contact patients who dropped off

### Week 4: Advanced analysis
- Cohort retention analysis
- Feature usage optimization
- Predictive modeling for patient lifetime value

## 💡 Pro Tips

1. **Start Simple**: Focus on signup and search funnels first
2. **Daily Habit**: Check key metrics every morning
3. **Patient-Centric**: Always trace back to individual patient experience
4. **Action-Oriented**: Every insight should lead to a specific action
5. **Iterative**: Improve tracking as you learn what matters most

## 🆘 Troubleshooting

### Problem: No data showing
- Check environment variables (POSTHOG_API_KEY)
- Verify network connectivity
- Look for JavaScript errors in browser console

### Problem: Duplicate events
- Check if tracking code runs multiple times
- Implement event deduplication
- Use consistent user identification

### Problem: Missing patient information
- Ensure `posthog.identify()` is called after login
- Verify user properties are passed correctly
- Check API integration for server-side events

This guide gives you everything you need to start understanding your patient behavior immediately. Focus on the high-priority insights first, then gradually expand your analysis as you become more comfortable with the data.
