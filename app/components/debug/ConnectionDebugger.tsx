'use client';

import { useState, useEffect } from 'react';
import { isFirebaseConfigured, isMessagingAvailable } from '@/lib/firebase/config';

export function ConnectionDebugger() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {};

    try {
      // Check basic browser support
      results.notificationSupport = 'Notification' in window;
      results.serviceWorkerSupport = 'serviceWorker' in navigator;
      results.pushManagerSupport = 'PushManager' in window;

      // Check Firebase configuration
      results.firebaseConfigured = isFirebaseConfigured();
      results.messagingAvailable = isMessagingAvailable();

      // Check notification permission
      results.notificationPermission = Notification.permission;

      // Check service worker registration
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration('/');
          results.serviceWorkerRegistered = !!registration;
          results.serviceWorkerScope = registration?.scope || 'None';
          results.serviceWorkerState = registration?.active?.state || 'None';
        } catch (err) {
          results.serviceWorkerError = err instanceof Error ? err.message : 'Unknown error';
        }
      }

      // Check for Chrome extension conflicts
      results.chromeExtensions = await checkChromeExtensions();

      // Check for multiple Firebase apps
      results.firebaseApps = await checkFirebaseApps();

      // Check console errors
      results.consoleErrors = await checkConsoleErrors();

      setDiagnostics(results);
    } catch (err) {
      console.error('Diagnostics failed:', err);
      results.diagnosticsError = err instanceof Error ? err.message : 'Unknown error';
      setDiagnostics(results);
    } finally {
      setIsRunning(false);
    }
  };

  const checkChromeExtensions = async () => {
    try {
      // Try to detect if chrome extensions are interfering
      const hasExtensions = (window as any).chrome && (window as any).chrome.runtime;
      return {
        detected: hasExtensions,
        warning: hasExtensions ? 'Chrome extensions detected - may cause interference' : 'No Chrome extensions detected'
      };
    } catch (err) {
      return { error: 'Could not check Chrome extensions' };
    }
  };

  const checkFirebaseApps = async () => {
    try {
      const firebase = (window as any).firebase;
      if (firebase && firebase.apps) {
        return {
          count: firebase.apps.length,
          warning: firebase.apps.length > 1 ? 'Multiple Firebase apps detected' : 'Single Firebase app'
        };
      }
      return { status: 'Firebase not in global scope' };
    } catch (err) {
      return { error: 'Could not check Firebase apps' };
    }
  };

  const checkConsoleErrors = async () => {
    try {
      // Check for common error patterns
      const errors = [];
      
      // Monitor console for specific errors
      const originalError = console.error;
      const errorMessages: string[] = [];
      
      console.error = (...args) => {
        errorMessages.push(args.join(' '));
        originalError.apply(console, args);
      };

      // Restore after a short delay
      setTimeout(() => {
        console.error = originalError;
      }, 1000);

      return {
        recentErrors: errorMessages,
        monitoring: 'Monitoring for 1 second...'
      };
    } catch (err) {
      return { error: 'Could not monitor console errors' };
    }
  };

  const clearServiceWorkers = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        alert(`Cleared ${registrations.length} service worker(s). Please refresh the page.`);
      }
    } catch (err) {
      console.error('Failed to clear service workers:', err);
      alert('Failed to clear service workers: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const reloadServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await registration.update();
        alert('Service worker reloaded successfully');
      }
    } catch (err) {
      console.error('Failed to reload service worker:', err);
      alert('Failed to reload service worker: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Connection Diagnostics</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
        
        <button
          onClick={clearServiceWorkers}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Service Workers
        </button>
        
        <button
          onClick={reloadServiceWorker}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Reload Service Worker
        </button>
      </div>

      <div className="space-y-4">
        <DiagnosticSection title="Browser Support" data={{
          'Notification API': diagnostics.notificationSupport ? '✅ Supported' : '❌ Not Supported',
          'Service Worker': diagnostics.serviceWorkerSupport ? '✅ Supported' : '❌ Not Supported',
          'Push Manager': diagnostics.pushManagerSupport ? '✅ Supported' : '❌ Not Supported',
          'Permission Status': diagnostics.notificationPermission || 'Unknown'
        }} />

        <DiagnosticSection title="Firebase Configuration" data={{
          'Firebase Configured': diagnostics.firebaseConfigured ? '✅ Yes' : '❌ No',
          'Messaging Available': diagnostics.messagingAvailable ? '✅ Yes' : '❌ No',
          'Firebase Apps': diagnostics.firebaseApps?.count ? `${diagnostics.firebaseApps.count} app(s)` : 'Unknown'
        }} />

        <DiagnosticSection title="Service Worker Status" data={{
          'Registered': diagnostics.serviceWorkerRegistered ? '✅ Yes' : '❌ No',
          'Scope': diagnostics.serviceWorkerScope || 'Unknown',
          'State': diagnostics.serviceWorkerState || 'Unknown',
          'Error': diagnostics.serviceWorkerError || 'None'
        }} />

        <DiagnosticSection title="Chrome Extensions" data={{
          'Extensions Detected': diagnostics.chromeExtensions?.detected ? '⚠️ Yes' : '✅ No',
          'Warning': diagnostics.chromeExtensions?.warning || 'None'
        }} />

        {diagnostics.consoleErrors && (
          <DiagnosticSection title="Recent Console Errors" data={{
            'Error Count': diagnostics.consoleErrors.recentErrors?.length || 0,
            'Recent Errors': diagnostics.consoleErrors.recentErrors?.join(', ') || 'None detected'
          }} />
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Common Solutions:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• If Chrome extensions are detected, try disabling them temporarily</li>
          <li>• If multiple Firebase apps exist, check for duplicate Firebase initialization</li>
          <li>• If service worker isn't registered, refresh the page and check console</li>
          <li>• The "Could not establish connection" error often resolves after clearing service workers</li>
          <li>• Try opening in an incognito window to rule out extension conflicts</li>
        </ul>
      </div>
    </div>
  );
}

interface DiagnosticSectionProps {
  title: string;
  data: Record<string, any>;
}

function DiagnosticSection({ title, data }: DiagnosticSectionProps) {
  return (
    <div className="border border-gray-200 rounded p-4">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-600">{key}:</span>
            <span className="font-mono text-sm">
              {typeof value === 'boolean' ? (value ? '✅ True' : '❌ False') : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
