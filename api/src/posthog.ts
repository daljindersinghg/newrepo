// src/posthog.ts

import dotenv from 'dotenv';
import { PostHog } from 'posthog-node';
dotenv.config();

// Check if PostHog is properly configured
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com';

if (!POSTHOG_API_KEY) {
  console.warn('⚠️ PostHog API key not found. Analytics will be disabled.');
}

export const posthog = POSTHOG_API_KEY 
  ? new PostHog(POSTHOG_API_KEY, { host: POSTHOG_HOST })
  : null;

// Helper function for patient tracking
export const trackPatientEvent = (
  distinctId: string,
  event: string,
  properties: Record<string, any> = {},
  email?: string
) => {
  try {
    if (!posthog) {
      console.warn('PostHog not configured, skipping event:', event);
      return;
    }
    
    posthog.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        email,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('PostHog tracking error:', error);
  }
};

// Helper function to identify patient
export const identifyPatient = (
  distinctId: string,
  email: string,
  properties: Record<string, any> = {}
) => {
  try {
    if (!posthog) {
      console.warn('PostHog not configured, skipping identify for:', email);
      return;
    }
    
    posthog.identify({
      distinctId,
      properties: {
        email,
        ...properties,
        first_seen: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('PostHog identify error:', error);
  }
};
