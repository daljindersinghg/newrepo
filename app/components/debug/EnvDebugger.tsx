'use client';

import { useEffect } from 'react';

export function EnvDebugger() {
  useEffect(() => {
    console.log('🔍 Environment Variables Debug:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing');
    console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
    console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Missing');
    
    // Check if all Firebase vars exist
    const firebaseVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];
    
    const missing = firebaseVars.filter(key => !process.env[key]);
    console.log('Missing Firebase vars:', missing);
  }, []);

  return null; // This component doesn't render anything
}
