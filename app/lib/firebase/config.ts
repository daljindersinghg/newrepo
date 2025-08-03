// NOTIFICATIONS DISABLED - All Firebase messaging functionality commented out

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

// Debug: Log all Firebase environment variables
console.log('🔧 Firebase Environment Variables Check (NOTIFICATIONS DISABLED):');
console.log('🚫 Notifications are disabled across the application');

/*
// DISABLED - Firebase initialization
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
*/

// DISABLED - Firebase messaging
const firebaseApp: any = null;
const messaging: any = null;

console.log('🚫 Firebase messaging is disabled');

export { firebaseApp, messaging };

// Utility function to check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  console.log('🚫 Firebase is disabled - returning false');
  return false;
};

// Utility function to check if messaging is available
export const isMessagingAvailable = (): boolean => {
  console.log('🚫 Messaging is disabled - returning false');
  return false;
};

// Function to get FCM token - DISABLED
export const getMessagingToken = async (): Promise<string | null> => {
  console.log('🚫 FCM token disabled - returning null');
  return null;
};

// Function to handle foreground messages - DISABLED
export const onMessageListener = (callback: (payload: any) => void): (() => void) => {
  console.log('🚫 Message listener disabled - returning empty function');
  return () => {};
};

// Legacy Promise-based function (for backwards compatibility) - DISABLED
export const onMessageListenerPromise = (): Promise<any> => {
  console.log('🚫 Message listener promise disabled - returning resolved promise');
  return Promise.resolve(null);
};