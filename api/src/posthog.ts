// src/posthog.ts

import dotenv from 'dotenv';
import { PostHog } from 'posthog-node';
dotenv.config();

export const posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
});

// Helper function for patient tracking
export const trackPatientEvent = (
  distinctId: string,
  event: string,
  properties: Record<string, any> = {},
  email?: string
) => {
  try {
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
