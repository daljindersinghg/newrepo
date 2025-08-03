'use client';

import { useEffect, useState } from 'react';

export function useRuntimeErrorDetector() {
  const [hasRuntimeError, setHasRuntimeError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    const originalError = window.console.error;
    const originalWarn = window.console.warn;

    // Monitor for the specific runtime error
    const errorHandler = (...args: any[]) => {
      const message = args.join(' ');
      
      if (message.includes('Could not establish connection') || 
          message.includes('Receiving end does not exist') ||
          message.includes('runtime.lastError')) {
        setHasRuntimeError(true);
        setErrorDetails(message);
      }
      
      originalError.apply(console, args);
    };

    const warnHandler = (...args: any[]) => {
      const message = args.join(' ');
      
      if (message.includes('Could not establish connection') || 
          message.includes('Receiving end does not exist')) {
        setHasRuntimeError(true);
        setErrorDetails(message);
      }
      
      originalWarn.apply(console, args);
    };

    // Override console methods
    window.console.error = errorHandler;
    window.console.warn = warnHandler;

    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      if (message.includes('Could not establish connection') || 
          message.includes('Receiving end does not exist')) {
        setHasRuntimeError(true);
        setErrorDetails(message);
      }
    };

    // Listen for Chrome extension errors
    const handleChromeRuntimeError = () => {
      if ((window as any).chrome?.runtime?.lastError) {
        const error = (window as any).chrome.runtime.lastError;
        setHasRuntimeError(true);
        setErrorDetails(error.message || 'Chrome runtime error detected');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Check for chrome runtime errors periodically
    const chromeErrorInterval = setInterval(handleChromeRuntimeError, 1000);

    return () => {
      window.console.error = originalError;
      window.console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(chromeErrorInterval);
    };
  }, []);

  const clearError = () => {
    setHasRuntimeError(false);
    setErrorDetails('');
  };

  return {
    hasRuntimeError,
    errorDetails,
    clearError
  };
}
