'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { onMessageListener } from '@/lib/firebase/config';

export function NotificationDebugger({ clinicId }: { clinicId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { isSupported, permission, fcmToken, initializeNotifications } = useNotifications();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    console.log(`[NotificationDebug] ${message}`);
  };

  useEffect(() => {
    addLog(`Starting notification debug for clinic: ${clinicId}`);
    addLog(`Browser supported: ${isSupported}`);
    addLog(`Permission: granted=${permission.granted}, denied=${permission.denied}, default=${permission.default}`);
    addLog(`FCM Token: ${fcmToken ? 'Generated' : 'None'}`);
  }, [isSupported, permission, fcmToken, clinicId]);

  useEffect(() => {
    if (!isSupported) return;

    const handleForegroundMessage = (payload: any) => {
      addLog(`🔔 FOREGROUND MESSAGE RECEIVED!`);
      addLog(`Title: ${payload.notification?.title}`);
      addLog(`Body: ${payload.notification?.body}`);
      addLog(`Data: ${JSON.stringify(payload.data)}`);
      
      // Show browser notification for foreground messages
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'New Notification', {
          body: payload.notification?.body,
          icon: '/NearMe .Ai (350 x 180 px).png',
          tag: `debug-${Date.now()}`,
          requireInteraction: true
        });
      }
    };

    const unsubscribe = onMessageListener(handleForegroundMessage);
    addLog('Foreground message listener setup');

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
        addLog('Foreground message listener cleaned up');
      }
    };
  }, [isSupported]);

  const testInitialization = async () => {
    try {
      addLog('Testing notification initialization...');
      await initializeNotifications(clinicId);
      addLog('✅ Initialization completed');
    } catch (error) {
      addLog(`❌ Initialization failed: ${error}`);
    }
  };

  const requestPermission = async () => {
    try {
      addLog('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      addLog(`Permission result: ${permission}`);
    } catch (error) {
      addLog(`❌ Permission request failed: ${error}`);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-blue-600 text-white p-2 rounded-lg text-xs z-50"
      >
        🔧 Debug Notifications
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 max-w-md max-h-96 overflow-y-auto z-50 shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Notification Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="text-xs">
          <strong>Status:</strong><br />
          Supported: {isSupported ? '✅' : '❌'}<br />
          Permission: {permission.granted ? '✅ Granted' : permission.denied ? '❌ Denied' : '⏳ Default'}<br />
          Token: {fcmToken ? '✅ Generated' : '❌ None'}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={testInitialization}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
          >
            Test Init
          </button>
          <button
            onClick={requestPermission}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded"
          >
            Request Permission
          </button>
        </div>
      </div>

      <div className="text-xs">
        <strong>Logs:</strong>
        <div className="bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="mb-1 font-mono text-xs">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
