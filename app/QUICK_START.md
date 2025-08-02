# 🚀 Quick Start - Firebase Push Notifications

Get push notifications working in **5 minutes**! Follow this guide for the fastest setup.

## Prerequisites

1. **Firebase account** (free)
2. **HTTPS domain** (required for push notifications)
3. **Modern browser** (Chrome, Firefox, Edge, Safari)

## Step 1: Firebase Setup (2 minutes)

### 1.1 Create Firebase Project
```bash
# Go to: https://console.firebase.google.com/
# Click "Create a project" → Enter name → Continue
```

### 1.2 Get Configuration
```bash
# In Firebase Console:
1. Click gear icon → "Project settings"
2. Scroll to "Your apps" → Click web icon (</>)
3. Register app → Copy config object
4. Go to "Cloud Messaging" tab → Generate VAPID key
```

## Step 2: Install & Configure (1 minute)

```bash
# Install Firebase
npm install firebase

# Run auto-setup script
node scripts/setup-notifications.js
```

**Or manually update `.env`:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

## Step 3: Add to Your App (1 minute)

### Option A: In Clinic Dashboard
```tsx
import { NotificationProvider } from '@/providers/NotificationProvider';
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';

function ClinicDashboard() {
  const clinicId = "your_clinic_id"; // Get from your auth system
  
  return (
    <NotificationProvider clinicId={clinicId}>
      <NotificationPermissionBanner clinicId={clinicId} />
      {/* Your existing dashboard */}
    </NotificationProvider>
  );
}
```

### Option B: In Settings Page
```tsx
import { NotificationSettings } from '@/components/clinic/NotificationSettings';

function SettingsPage() {
  const clinicId = "your_clinic_id";
  
  return (
    <NotificationProvider clinicId={clinicId}>
      <NotificationSettings clinicId={clinicId} />
    </NotificationProvider>
  );
}
```

## Step 4: Test (1 minute)

```bash
# 1. Start your dev server
npm run dev

# 2. Open browser → Go to your clinic dashboard
# 3. Click "Enable Notifications" 
# 4. Allow browser permission
# 5. Check browser console for FCM token

# 6. Test with curl (replace TOKEN):
curl -X POST "https://fcm.googleapis.com/fcm/send" \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "FCM_TOKEN_FROM_CONSOLE",
    "notification": {
      "title": "Test!",
      "body": "Push notifications working! 🎉"
    }
  }'
```

## Step 5: Integrate with Appointments

```tsx
import { appointmentNotifications } from '@/lib/utils/appointmentNotifications';

// When appointment is created
async function createAppointment(appointmentData) {
  // Your existing appointment creation logic
  
  // Send notification
  await appointmentNotifications.onAppointmentCreated({
    id: 'appt_123',
    patientName: 'John Doe',
    clinicId: 'clinic_123', 
    appointmentDate: '2024-01-15',
    appointmentTime: '10:00',
    service: 'Cleaning'
  });
}
```

## 🎯 You're Done!

Your basic push notification system is now working. Users will get notifications for:
- ✅ New appointment requests
- ✅ Appointment cancellations  
- ✅ Appointment changes

## Next Steps

1. **Production Setup**: See `PRODUCTION_SETUP_GUIDE.md` for backend APIs
2. **Customization**: Modify notification messages and styling
3. **Analytics**: Add notification tracking and metrics

## Troubleshooting

**❌ Notifications not showing?**
- Check browser allows notifications for your site
- Verify HTTPS is enabled
- Check browser console for errors

**❌ Service worker not loading?**
- Ensure `firebase-messaging-sw.js` is in `/public/`
- Check file has correct Firebase config
- Verify HTTPS (required for service workers)

**❌ FCM token not generating?**
- Verify all Firebase config variables are set
- Check VAPID key is correct
- Ensure Firebase project has Cloud Messaging enabled

---

**Need help?** Check the detailed guides:
- 📖 `PRODUCTION_SETUP_GUIDE.md` - Complete production setup
- 📖 `PUSH_NOTIFICATIONS_SETUP.md` - Technical documentation