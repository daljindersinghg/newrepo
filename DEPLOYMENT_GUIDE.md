# Deployment Setup Guide

## 🚀 Environment Variables for Vercel Deployment

### Frontend (Vercel Dashboard - Project Settings - Environment Variables)

Add these environment variables to your Vercel project:

```
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBLZhmv7zSDHDedLHAdmzpPCpnr1n0w3zo

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCL5-3z3mYVlJEeDDd2kk_xdTocsCAG9gg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sample-540f6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sample-540f6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sample-540f6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=957737940781
NEXT_PUBLIC_FIREBASE_APP_ID=1:957737940781:web:9770fdf54b4082524e85a4
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XP672JHLSN
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKtHE4-OkZwuL4KqaKoz-XH8fjJJyl_bWayU8zdIY3YTjqJb7Fy2Iitp5obI04omaX3Hyi8BKvFIvsItwoF7uKQ
```

### Backend (API Server Environment Variables)

Add these to your API server hosting environment:

```
MONGODB_URI=mongodb+srv://teamdigiavocado:3HSGYBSjvgZ52qRm@test-1.6cem02a.mongodb.net/?retryWrites=true&w=majority
GOOGLE_PLACES_API_KEY=AIzaSyBLZhmv7zSDHDedLHAdmzpPCpnr1n0w3zo
NODE_ENV=production
JWT_SECRET_KEY=dental-care-admin-super-secret-key-2025-xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
JWT_EXPIRE=10d

# PostHog Analytics Configuration
POSTHOG_API_KEY=phc_xfO6lrP8fiKRzimSlJOtsC6E7UoA1zeXRPfxmp1W7sW
POSTHOG_HOST=https://us.i.posthog.com

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=dentistnearme.ai@gmail.com
SMTP_PASS=gjfjomibgvqlomlz
SMTP_FROM=dentistnearme.ai@gmail.com
EMAIL_USER=dentistnearme.ai@gmail.com
EMAIL_PASSWORD=gjfjomibgvqlomlz

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://653439864824937:GSt3-0lepo0A8EPDwXBr81fzy94@dydxct3vw

# Firebase Configuration for Push Notifications
FIREBASE_PROJECT_ID=sample-540f6
FIREBASE_SERVICE_ACCOUNT_KEY=YOUR_ACTUAL_FIREBASE_SERVICE_ACCOUNT_JSON_HERE
```

## 📋 Deployment Steps

### 1. Frontend (Vercel)
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `newrepo`
3. Go to **Settings** > **Environment Variables**
4. Add all the `NEXT_PUBLIC_*` variables from above
5. **Important**: Update `NEXT_PUBLIC_API_URL` to your actual API domain
6. Redeploy the project

### 2. Backend (API Server)
1. Deploy your API to a hosting service (Railway, Render, DigitalOcean, etc.)
2. Add all the backend environment variables
3. **Important**: Replace `FIREBASE_SERVICE_ACCOUNT_KEY` with your actual Firebase service account JSON
4. Make sure the API is accessible from your frontend domain

### 3. Update API URL
Once your API is deployed, update the frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://your-actual-api-domain.com
```

## 🔧 Testing Deployment

### 1. Check Environment Variables
After deployment, check the browser console at your Vercel URL:
- Should NOT see "Missing Firebase environment variables"
- Should see "✅ Firebase messaging initialized successfully"

### 2. Test Push Notifications
1. Open clinic dashboard
2. Check browser console for notification permissions
3. Test sending a notification from the debug panel

## 🚨 Common Issues

### Issue: "Missing Firebase environment variables"
**Solution**: Ensure all `NEXT_PUBLIC_*` variables are added to Vercel and redeploy

### Issue: "Firebase messaging not initialized"
**Solution**: Check that `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is correctly set

### Issue: API connection errors
**Solution**: Update `NEXT_PUBLIC_API_URL` to your deployed API domain

### Issue: Push notifications not working
**Solution**: Ensure Firebase service account key is properly set in API environment

## 📝 Files Updated for Deployment

1. ✅ `app/.env` - Updated with proper VAPID key and production API URL
2. ✅ `app/public/firebase-messaging-sw.js` - Service worker ready for production
3. ✅ `api/.env` - Configured with Firebase service account placeholder
4. 🔄 Need to update: `NEXT_PUBLIC_API_URL` with actual deployed API domain
5. 🔄 Need to update: `FIREBASE_SERVICE_ACCOUNT_KEY` with actual Firebase service account JSON

## 🎯 Next Steps

1. **Deploy API server** to get the actual API domain
2. **Update Vercel environment variables** with the real API URL
3. **Add Firebase service account key** to API environment
4. **Test notifications** end-to-end

Your notification system is ready for deployment! 🚀
