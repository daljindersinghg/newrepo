'use client';

import { usePostHog } from '../providers/PostHogProvider';
import { useEffect, useRef, useCallback } from 'react';

export function useLandingPageTracking() {
  const { track, isLoaded } = usePostHog();
  const startTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);
  const maxScrollDepth = useRef<number>(0);
  const elementsViewed = useRef<Set<string>>(new Set());

  // Track time on page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      track('landing_page_time_spent', {
        time_spent_seconds: timeSpent,
        max_scroll_depth: maxScrollDepth.current,
        elements_viewed: Array.from(elementsViewed.current),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [track]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      scrollDepth.current = scrollPercent;
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercent);

      // Track milestone scroll depths
      if (scrollPercent >= 25 && !elementsViewed.current.has('scroll_25')) {
        elementsViewed.current.add('scroll_25');
        track('scroll_milestone', { depth: 25 });
      }
      if (scrollPercent >= 50 && !elementsViewed.current.has('scroll_50')) {
        elementsViewed.current.add('scroll_50');
        track('scroll_milestone', { depth: 50 });
      }
      if (scrollPercent >= 75 && !elementsViewed.current.has('scroll_75')) {
        elementsViewed.current.add('scroll_75');
        track('scroll_milestone', { depth: 75 });
      }
      if (scrollPercent >= 100 && !elementsViewed.current.has('scroll_100')) {
        elementsViewed.current.add('scroll_100');
        track('scroll_milestone', { depth: 100 });
      }
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [track]);

  // Element visibility tracking
  const trackElementView = useCallback((elementName: string, additionalProps?: Record<string, any>) => {
    if (!elementsViewed.current.has(elementName)) {
      elementsViewed.current.add(elementName);
      track('element_viewed', {
        element_name: elementName,
        scroll_depth: scrollDepth.current,
        time_on_page: Math.round((Date.now() - startTime.current) / 1000),
        ...additionalProps,
      });
    }
  }, [track]);

  // Address search tracking
  const trackAddressSearch = useCallback(() => {
    track('address_search_started', {
      scroll_depth: scrollDepth.current,
      time_on_page: Math.round((Date.now() - startTime.current) / 1000),
    });
  }, [track]);

  const trackAddressSelected = useCallback((address: string, lat: number, lng: number) => {
    track('address_selected', {
      address,
      latitude: lat,
      longitude: lng,
      scroll_depth: scrollDepth.current,
      time_on_page: Math.round((Date.now() - startTime.current) / 1000),
    });
  }, [track]);

  const trackDentistSearchTriggered = useCallback((location: string) => {
    track('dentist_search_triggered', {
      search_location: location,
      scroll_depth: scrollDepth.current,
      time_on_page: Math.round((Date.now() - startTime.current) / 1000),
    });
  }, [track]);

  // CTA tracking
  const trackCTAClick = useCallback((ctaType: string, location: string) => {
    track('cta_clicked', {
      cta_type: ctaType,
      cta_location: location,
      scroll_depth: scrollDepth.current,
      time_on_page: Math.round((Date.now() - startTime.current) / 1000),
    });
  }, [track]);

  // Lead generation tracking
  const trackLeadGenerated = useCallback((source: string) => {
    track('lead_generated', {
      source,
      scroll_depth: scrollDepth.current,
      time_on_page: Math.round((Date.now() - startTime.current) / 1000),
      conversion_time: Math.round((Date.now() - startTime.current) / 1000),
    });
  }, [track]);

  // Interest tracking
  const trackGiftCardInterest = useCallback((source: string) => {
    track('gift_card_interest', {
      source,
      scroll_depth: scrollDepth.current,
      time_on_page: Math.round((Date.now() - startTime.current) / 1000),
    });
  }, [track]);

  return {
    trackElementView,
    trackAddressSearch,
    trackAddressSelected,
    trackDentistSearchTriggered,
    trackCTAClick,
    trackLeadGenerated,
    trackGiftCardInterest,
    isLoaded,
  };
}

// Utility function for throttling
function throttle(func: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  let lastExecTime = 0;
  return function (...args: any[]) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}