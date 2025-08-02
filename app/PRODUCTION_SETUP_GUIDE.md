# Production Setup Guide - Firebase Push Notifications

This guide walks you through setting up Firebase Cloud Messaging push notifications for production deployment.

## 🚀 Production Checklist

### Phase 1: Firebase Project Setup

#### 1.1 Create Firebase Project
```bash
# Go to Firebase Console
https://console.firebase.google.com/

# Create new project or use existing
1. Click "Create a project" or select existing
2. Enter project name (e.g., "dentnearme-prod")
3. Enable Google Analytics (recommended)
4. Wait for project creation
```

#### 1.2 Enable Cloud Messaging
```bash
# In Firebase Console:
1. Go to Project Overview
2. Click "Build" → "Cloud Messaging"
3. Click "Get started" if not already enabled
```

#### 1.3 Generate Web App Config
```bash
# In Firebase Console:
1. Click gear icon → "Project settings"
2. Scroll to "Your apps" section
3. Click web icon (</>) to add web app
4. Register app with nickname (e.g., "DentNearMe Web")
5. Copy the firebaseConfig object
```

#### 1.4 Generate VAPID Key
```bash
# In Firebase Console → Project Settings:
1. Go to "Cloud Messaging" tab
2. Scroll to "Web configuration"
3. Click "Generate key pair" under "Web push certificates"
4. Copy the key pair (this is your VAPID key)
```

### Phase 2: Environment Configuration

#### 2.1 Production Environment Variables
Create/update your `.env.production` file:

```env
# Firebase Configuration - PRODUCTION
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your_actual_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dentnearme-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dentnearme-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dentnearme-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BCd1234...your_actual_vapid_key

# API Configuration
NEXT_PUBLIC_API_URL=https://api.dentnearme.com
```

#### 2.2 Deployment Platform Setup

**For Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_FIREBASE_VAPID_KEY
vercel env add NEXT_PUBLIC_API_URL
```

**For Netlify:**
```bash
# In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add each NEXT_PUBLIC_* variable
3. Redeploy the site
```

### Phase 3: Backend API Implementation

#### 3.1 Install Firebase Admin SDK (Backend)
```bash
# In your backend project
npm install firebase-admin
```

#### 3.2 Firebase Admin Configuration
```javascript
// config/firebase-admin.js
const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

module.exports = admin;
```

#### 3.3 Required API Endpoints

**POST `/api/notifications/token`** - Save FCM tokens
```javascript
// routes/notifications/token.js
const admin = require('../../config/firebase-admin');
const db = require('../../config/database'); // Your database config

app.post('/api/notifications/token', async (req, res) => {
  try {
    const { token, clinicId, platform, userAgent } = req.body;
    
    // Validate token with Firebase
    await admin.messaging().send({
      token,
      data: { test: 'validation' }
    }, true); // dry run
    
    // Save to database
    await db.query(
      'INSERT INTO fcm_tokens (token, clinic_id, platform, user_agent, created_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE updated_at = NOW()',
      [token, clinicId, platform, userAgent]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Token save error:', error);
    res.status(400).json({ error: 'Invalid token' });
  }
});
```

**DELETE `/api/notifications/token`** - Remove FCM tokens
```javascript
app.delete('/api/notifications/token', async (req, res) => {
  try {
    const { token, clinicId } = req.body;
    
    await db.query(
      'DELETE FROM fcm_tokens WHERE token = ? AND clinic_id = ?',
      [token, clinicId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Token deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

**POST `/api/notifications/send`** - Send notifications
```javascript
app.post('/api/notifications/send', async (req, res) => {
  try {
    const { clinicId, notification, appointmentData } = req.body;
    
    // Get all tokens for this clinic
    const tokens = await db.query(
      'SELECT token FROM fcm_tokens WHERE clinic_id = ? AND active = 1',
      [clinicId]
    );
    
    if (tokens.length === 0) {
      return res.json({ success: true, sent: 0 });
    }
    
    // Prepare FCM message
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: '/NearMe .Ai (350 x 180 px).png'
      },
      data: {
        ...notification.data,
        click_action: notification.data.url
      },
      tokens: tokens.map(t => t.token)
    };
    
    // Send multicast message
    const response = await admin.messaging().sendMulticast(message);
    
    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx].token);
        }
      });
      
      // Remove invalid tokens
      if (failedTokens.length > 0) {
        await db.query(
          'DELETE FROM fcm_tokens WHERE token IN (?)',
          [failedTokens]
        );
      }
    }
    
    res.json({ 
      success: true, 
      sent: response.successCount,
      failed: response.failureCount 
    });
    
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

#### 3.4 Database Schema
```sql
-- FCM Tokens table
CREATE TABLE fcm_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(500) UNIQUE NOT NULL,
  clinic_id VARCHAR(100) NOT NULL,
  platform VARCHAR(50) DEFAULT 'web',
  user_agent TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_clinic_id (clinic_id),
  INDEX idx_active (active)
);

-- Notification logs (optional, for analytics)
CREATE TABLE notification_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clinic_id VARCHAR(100) NOT NULL,
  appointment_id VARCHAR(100),
  notification_type VARCHAR(50),
  title VARCHAR(255),
  body TEXT,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_clinic_id (clinic_id),
  INDEX idx_appointment_id (appointment_id)
);
```

### Phase 4: Frontend Deployment

#### 4.1 Build Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable service worker
  async headers() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### 4.2 Service Worker Path Fix
Update the service worker to work in production:

```javascript
// public/firebase-messaging-sw.js - UPDATE THE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyC...your_actual_key_here",
  authDomain: "dentnearme-prod.firebaseapp.com", 
  projectId: "dentnearme-prod",
  storageBucket: "dentnearme-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

#### 4.3 Production Build & Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
npm run build && netlify deploy --prod --dir=.next
```

### Phase 5: Testing & Verification

#### 5.1 Production Testing Checklist
```bash
✅ Firebase project is in production mode
✅ All environment variables are set correctly
✅ Service worker registers successfully
✅ FCM tokens are generated and saved
✅ Notifications appear in browser
✅ Background notifications work when app is closed
✅ Notification clicks navigate correctly
✅ Invalid tokens are cleaned up automatically
```

#### 5.2 Test Notification Script
```javascript
// test-notifications.js
const admin = require('./config/firebase-admin');

async function testNotification() {
  const message = {
    notification: {
      title: 'Test Notification',
      body: 'This is a test from production!'
    },
    token: 'your_test_token_here'
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Test notification sent:', response);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testNotification();
```

### Phase 6: Monitoring & Analytics

#### 6.1 Firebase Analytics
```bash
# In Firebase Console:
1. Go to Analytics → Events
2. Monitor notification_received events
3. Track notification_click events
```

#### 6.2 Error Monitoring
```javascript
// Add to your error tracking (e.g., Sentry)
import * as Sentry from '@sentry/nextjs';

// In notification service
catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'notifications',
      action: 'send_notification'
    }
  });
}
```

### Phase 7: Security & Performance

#### 7.1 Security Best Practices
```bash
✅ Use HTTPS everywhere (required for service workers)
✅ Validate all FCM tokens before saving
✅ Rate limit notification endpoints
✅ Sanitize notification content
✅ Use environment variables for all secrets
✅ Regularly clean up invalid tokens
```

#### 7.2 Performance Optimization
```javascript
// Batch token operations
const batchSize = 500; // FCM limit
const tokenBatches = [];
for (let i = 0; i < tokens.length; i += batchSize) {
  tokenBatches.push(tokens.slice(i, i + batchSize));
}

// Send to each batch
for (const batch of tokenBatches) {
  await admin.messaging().sendMulticast({
    ...message,
    tokens: batch
  });
}
```

### Phase 8: Maintenance

#### 8.1 Regular Tasks
```bash
# Weekly: Clean up invalid tokens
DELETE FROM fcm_tokens WHERE updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

# Monthly: Review notification analytics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sent,
  SUM(failed_count) as total_failed
FROM notification_logs 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at);
```

#### 8.2 Troubleshooting Common Issues

**Issue: Notifications not appearing**
```bash
1. Check browser notification permissions
2. Verify service worker registration
3. Check Firebase configuration
4. Validate FCM token generation
```

**Issue: Service worker not loading**
```bash
1. Ensure HTTPS is used
2. Check service worker path (/firebase-messaging-sw.js)
3. Verify Cache-Control headers
4. Check for JavaScript errors
```

**Issue: High failure rate**
```bash
1. Clean up invalid tokens regularly
2. Check Firebase quota limits
3. Validate message payload size
4. Review error logs for patterns
```

## 🎯 Go-Live Checklist

```bash
□ Firebase project configured for production
□ All environment variables set
□ Backend APIs deployed and tested
□ Database tables created
□ Frontend deployed with correct config
□ Service worker accessible at /firebase-messaging-sw.js
□ Test notifications working end-to-end
□ Error monitoring configured
□ Analytics tracking enabled
□ Documentation updated for team
```

## 📞 Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs/cloud-messaging
- **FCM Troubleshooting**: https://firebase.google.com/docs/cloud-messaging/js/client
- **Service Worker Guide**: https://developers.google.com/web/fundamentals/primers/service-workers

Your push notification system is now ready for production! 🚀