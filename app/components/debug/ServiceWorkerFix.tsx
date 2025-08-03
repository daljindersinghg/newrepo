'use client';

import { useState } from 'react';
import { useRuntimeErrorDetector } from '@/hooks/useRuntimeErrorDetector';

export function ServiceWorkerFix() {
  const [isFixing, setIsFixing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const { hasRuntimeError, errorDetails, clearError } = useRuntimeErrorDetector();

  // Only show the fix component if there's actually a runtime error
  if (!hasRuntimeError) {
    return null;
  }

  const fixConnectionIssues = async () => {
    setIsFixing(true);
    setStatus('Starting connection fix...');

    try {
      // Step 1: Clear existing service workers
      setStatus('Clearing existing service workers...');
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        setStatus(`Cleared ${registrations.length} service worker(s)`);
      }

      // Step 2: Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Re-register the service worker
      setStatus('Re-registering Firebase service worker...');
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        // Wait for it to become active
        await new Promise<void>((resolve) => {
          if (registration.active) {
            resolve();
          } else {
            registration.addEventListener('statechange', () => {
              if (registration.active?.state === 'activated') {
                resolve();
              }
            });
          }
        });
        
        setStatus('Service worker registered successfully');
      }

      // Step 4: Clear any messaging caches
      setStatus('Clearing Firebase messaging cache...');
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('firebase') || cacheName.includes('fcm')) {
            await caches.delete(cacheName);
          }
        }
      }

      setStatus('✅ Connection fix completed! Please refresh the page.');
      
      // Clear the error state
      clearError();
      
      // Auto-refresh after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Fix failed:', error);
      setStatus(`❌ Fix failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFixing(false);
    }
  };

  const quickRefresh = () => {
    setStatus('Refreshing page...');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white shadow-lg border border-red-200 rounded-lg p-4 max-w-sm">
        <div className="flex items-center mb-3">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <h3 className="font-semibold text-gray-800">Connection Issue Detected</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          <strong>Error:</strong> {errorDetails}
          <br />
          <br />
          This is usually caused by service worker conflicts or Chrome extension interference.
        </p>

        {status && (
          <div className="mb-4 p-2 bg-gray-50 rounded text-xs font-mono">
            {status}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={fixConnectionIssues}
            disabled={isFixing}
            className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isFixing ? 'Fixing...' : 'Fix Connection'}
          </button>
          
          <button
            onClick={quickRefresh}
            className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          💡 You can also try opening in incognito mode to check for extension conflicts.
        </div>
      </div>
    </div>
  );
}
