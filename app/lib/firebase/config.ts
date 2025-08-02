import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(firebaseApp);
  } catch (error) {
    console.error('Firebase messaging initialization error:', error);
  }
}

export { firebaseApp, messaging };

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