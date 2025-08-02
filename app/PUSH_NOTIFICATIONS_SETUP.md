# Firebase Push Notifications Setup for Clinic Appointments

This implementation provides comprehensive push notification support for clinic appointment management using Firebase Cloud Messaging (FCM).

## Features

- 🔔 **Real-time Push Notifications** for appointment events
- 📱 **Cross-platform Support** (Web, Mobile browsers)
- 🎯 **Smart Notification Types** (New appointments, cancellations, reschedules, reminders)
- ⚙️ **Customizable Settings** per clinic
- 🔒 **Secure Token Management** with automatic refresh
- 📊 **Notification Analytics** and tracking

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Cloud Messaging** in the Firebase console
4. Generate a Web App configuration
5. Create a **VAPID key** in Project Settings > Cloud Messaging

### 2. Environment Variables

Update your `.env` file with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 3. Install Dependencies

```bash
npm install firebase
```

### 4. Backend API Endpoints

Create these API endpoints on your backend server:

#### POST `/api/notifications/token`
Save FCM tokens for clinics
```json
{
  "token": "fcm_token_here",
  "clinicId": "clinic_123",
  "platform": "web",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### DELETE `/api/notifications/token`
Remove FCM tokens
```json
{
  "token": "fcm_token_here",
  "clinicId": "clinic_123"
}
```

#### POST `/api/notifications/send`
Send push notifications via Firebase Admin SDK
```json
{
  "clinicId": "clinic_123",
  "notification": {
    "title": "New Appointment Request",
    "body": "John Doe has requested an appointment",
    "data": { ... }
  },
  "appointmentData": { ... }
}
```

#### POST `/api/notifications/schedule`
Schedule delayed notifications
```json
{
  "appointmentId": "appt_123",
  "clinicId": "clinic_123",
  "scheduledFor": "2024-01-02T10:00:00.000Z",
  "type": "reminder"
}
```

### 5. Component Integration

#### In Clinic Dashboard Layout:
```tsx
import { NotificationProvider } from '@/providers/NotificationProvider';
import { NotificationPermissionBanner } from '@/components/notifications/NotificationPermissionBanner';

function ClinicDashboard({ clinicId }: { clinicId: string }) {
  return (
    <NotificationProvider clinicId={clinicId}>
      <NotificationPermissionBanner clinicId={clinicId} />
      {/* Your dashboard content */}
    </NotificationProvider>
  );
}
```

#### In Settings Page:
```tsx
import { NotificationSettings } from '@/components/clinic/NotificationSettings';

function SettingsPage({ clinicId }: { clinicId: string }) {
  return (
    <NotificationProvider clinicId={clinicId}>
      <NotificationSettings clinicId={clinicId} />
    </NotificationProvider>
  );
}
```

### 6. Appointment System Integration

```tsx
import { appointmentNotifications } from '@/lib/utils/appointmentNotifications';

// When a new appointment is created
await appointmentNotifications.onAppointmentCreated({
  id: 'appt_123',
  patientName: 'John Doe',
  patientEmail: 'john@example.com',
  clinicId: 'clinic_123',
  dentistName: 'Dr. Smith',
  appointmentDate: '2024-01-15',
  appointmentTime: '10:00',
  service: 'Dental Cleaning',
  status: 'pending'
});

// When an appointment is cancelled
await appointmentNotifications.onAppointmentCancelled(appointmentData);

// When an appointment is rescheduled
await appointmentNotifications.onAppointmentRescheduled(
  appointmentData, 
  oldDate, 
  oldTime
);
```

## File Structure

```
├── lib/
│   ├── firebase/
│   │   └── config.ts                 # Firebase configuration
│   ├── services/
│   │   └── notificationService.ts    # Core notification service
│   └── utils/
│       └── appointmentNotifications.ts # Appointment-specific notifications
├── hooks/
│   └── useNotifications.ts           # React hook for notifications
├── providers/
│   └── NotificationProvider.tsx      # React context provider
├── components/
│   ├── notifications/
│   │   └── NotificationPermissionBanner.tsx
│   └── clinic/
│       └── NotificationSettings.tsx  # Settings component
└── public/
    └── firebase-messaging-sw.js      # Service worker for background notifications
```

## Notification Types

1. **New Appointment** - When patients book new appointments
2. **Cancellation** - When appointments are cancelled
3. **Reschedule** - When appointments are rescheduled
4. **Reminder** - 24-hour advance reminders

## Security Considerations

- 🔐 FCM tokens are stored securely on the server
- 🚫 Tokens are automatically cleaned up when notifications are disabled
- 🕒 Business hours filtering prevents spam notifications
- 🔍 All notification interactions are tracked for analytics

## Testing

1. Enable notifications in clinic settings
2. Use the "Test Browser Notification" button
3. Verify service worker registration in browser DevTools
4. Check notification permission status

## Troubleshooting

### Common Issues:

1. **Notifications not appearing**
   - Check browser notification permissions
   - Verify service worker is registered
   - Check Firebase configuration

2. **Service worker not registering**
   - Ensure `firebase-messaging-sw.js` is in public directory
   - Check for JavaScript errors in console
   - Verify HTTPS is being used (required for service workers)

3. **FCM token not generating**
   - Verify VAPID key is correct
   - Check Firebase project configuration
   - Ensure all environment variables are set

### Debug Mode:

Enable debug logging by setting:
```javascript
// In browser console
localStorage.debug = 'firebase:*';
```

## Browser Support

- ✅ Chrome/Chromium browsers
- ✅ Firefox
- ✅ Safari (with limitations)
- ✅ Edge
- ❌ iOS Safari (limited support)

## Next Steps

1. **Server Implementation**: Implement the backend API endpoints
2. **Firebase Admin Setup**: Configure Firebase Admin SDK on your server
3. **Styling Customization**: Customize notification appearance
4. **Analytics Integration**: Add notification analytics tracking
5. **Mobile App**: Extend to React Native for mobile apps

## Support

For Firebase-specific issues, refer to the [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging/js/client).