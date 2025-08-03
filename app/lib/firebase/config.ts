import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';

// Validate Firebase configuration
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('Missing Firebase environment variables:', missingVars);
  console.warn('Push notifications will be disabled');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Only initialize Firebase if configuration is complete
let firebaseApp: any = null;

try {
  if (missingVars.length === 0) {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase not initialized due to missing configuration');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

if (typeof window !== 'undefined' && firebaseApp) {
  try {
    messaging = getMessaging(firebaseApp);
    console.log('Firebase messaging initialized successfully');
  } catch (error) {
    console.error('Firebase messaging initialization error:', error);
    console.warn('Push notifications will not be available');
  }
}

export { firebaseApp, messaging };

// Utility function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  return firebaseApp !== null && missingVars.length === 0;
};

// Utility function to check if messaging is available
export const isMessagingAvailable = (): boolean => {
  return messaging !== null && isFirebaseConfigured();
};

// Function to get FCM token
export const getMessagingToken = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return null;
  }

  try {
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Error getting messaging token:', error);
    return null;
  }
};

// Function to handle foreground messages
export const onMessageListener = (callback: (payload: MessagePayload) => void): (() => void) => {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return () => {};
  }

  // onMessage returns an unsubscribe function
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    callback(payload);
  });

  return unsubscribe;
};

// Legacy Promise-based function (for backwards compatibility)
export const onMessageListenerPromise = (): Promise<MessagePayload> => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.warn('Firebase messaging not initialized');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      resolve(payload);
    });
  });
};