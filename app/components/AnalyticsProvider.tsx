'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';

// Separate component that uses useSearchParams
function PostHogTracker() {
  const pathname = usePathname();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!apiKey) return;

    // Simple initialization
    posthog.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      disable_session_recording: true,
      disable_surveys: true,
      autocapture: false,
    });

    // Track time spent on landing page
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      posthog.capture('time_on_landing_page', {
        seconds: timeSpent,
        minutes: Math.round(timeSpent / 60),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track route changes
  useEffect(() => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture('$pageview', {
        path: pathname,
      });
    }
  }, [pathname]);

  return null;
}

// Main provider component
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <PostHogTracker />
      </Suspense>
    </>
  );
}

// Simple hook for tracking events
export function useSimpleTracking() {
  const track = (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture(event, properties);
    }
  };

  return { track };
}