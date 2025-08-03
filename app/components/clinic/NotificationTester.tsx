'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationTester() {
  const [testResult, setTestResult] = useState<string>('');
  const { isSupported, permission, fcmToken, initializeNotifications } = useNotifications();

  const runDiagnostics = async () => {
    const results = [];
    
    // Check if notifications are supported
    results.push(`🔍 Browser Support: ${isSupported ? '✅ Supported' : '❌ Not Supported'}`);
    
    // Check permission status
    results.push(`🔒 Permission: ${permission.granted ? '✅ Granted' : permission.denied ? '❌ Denied' : '⚠️ Default'}`);
    
    // Check if service worker is registered
    try {
      const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
      results.push(`🔧 Service Worker: ${registration ? '✅ Registered' : '❌ Not Registered'}`);
    } catch (error) {
      results.push(`🔧 Service Worker: ❌ Error - ${error.message}`);
    }
    
    // Check FCM token
    results.push(`🎫 FCM Token: ${fcmToken ? '✅ Available' : '❌ Missing'}`);
    
    // Check if we can show notifications
    if (permission.granted) {
      try {
        new Notification('Test Notification', {
          body: 'This is a test notification from your clinic dashboard',
          icon: '/logo.png'
        });
        results.push(`🔔 Test Notification: ✅ Sent Successfully`);
      } catch (error) {
        results.push(`🔔 Test Notification: ❌ Failed - ${error.message}`);
      }
    } else {
      results.push(`🔔 Test Notification: ⚠️ Cannot send - no permission`);
    }
    
    setTestResult(results.join('\n'));
  };

  const requestPermissionAndTest = async () => {
    try {
      await initializeNotifications('test-clinic-123');
      setTestResult('✅ Notification setup completed! Running diagnostics...');
      setTimeout(runDiagnostics, 1000);
    } catch (error) {
      setTestResult(`❌ Failed to initialize: ${error.message}`);
    }
  };

  const sendTestNotification = () => {
    if (permission.granted) {
      try {
        new Notification('🦷 Clinic Test Notification', {
          body: 'New appointment booked! This is how notifications will appear.',
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'test-notification',
          requireInteraction: true
        });
        setTestResult('✅ Test notification sent!');
      } catch (error) {
        setTestResult(`❌ Failed to send test notification: ${error.message}`);
      }
    } else {
      setTestResult('❌ Cannot send notification - permission not granted');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">🔔 Notification System Tester</h3>
      
      <div className="space-y-3 mb-4">
        <Button onClick={runDiagnostics} variant="outline" className="w-full">
          🔍 Run Diagnostics
        </Button>
        
        <Button onClick={requestPermissionAndTest} className="w-full">
          🔧 Setup Notifications
        </Button>
        
        <Button onClick={sendTestNotification} variant="outline" className="w-full">
          🔔 Send Test Notification
        </Button>
      </div>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Current Status:</strong></p>
        <p>Supported: {isSupported ? 'Yes' : 'No'}</p>
        <p>Permission: {permission.granted ? 'Granted' : permission.denied ? 'Denied' : 'Default'}</p>
        <p>FCM Token: {fcmToken ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
