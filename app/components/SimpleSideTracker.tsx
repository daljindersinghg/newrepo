'use client';


import { useEffect } from 'react';
import { useSimpleTracking } from './AnalyticsProvider';

export function SimpleTracker() {
  const { track } = useSimpleTracking();

  useEffect(() => {
    // Track landing page load
    track('landing_page_loaded');

    // Simple scroll tracking - just track if they scroll at all
    let hasScrolled = false;
    const handleScroll = () => {
      if (!hasScrolled) {
        hasScrolled = true;
        track('user_scrolled');
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [track]);

  return null; // This component renders nothing
}