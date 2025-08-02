// api/src/controllers/analytics.controller.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger.config';

export class AnalyticsController {
  /**
   * GET /api/v1/analytics/dashboard
   * Get analytics dashboard data for admin panel
   */
  static async getDashboardData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { timeRange = '7d' } = req.query;

      // Generate mock dashboard data (replace with real PostHog queries)
      const dashboardData = await AnalyticsController.generateDashboardData(timeRange as string);

      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  }

  /**
   * GET /api/v1/analytics/patient-events
   * Get patient interaction events from PostHog
   */
  static async getPatientEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        email, 
        startDate, 
        endDate, 
        eventType,
        limit = 100 
      } = req.query;

      // This would be a PostHog API call to fetch events
      // For now, we'll return a structured response
      const events = await AnalyticsController.fetchPatientEventsFromPostHog({
        email: email as string,
        startDate: startDate as string,
        endDate: endDate as string,
        eventType: eventType as string,
        limit: parseInt(limit as string)
      });

      res.status(200).json({
        success: true,
        data: {
          events,
          total: events.length,
          filters: {
            email,
            startDate,
            endDate,
            eventType
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching patient events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patient events'
      });
    }
  }

  /**
   * GET /api/v1/analytics/patient-journey
   * Get patient journey analytics by email
   */
  static async getPatientJourney(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email parameter is required'
        });
        return;
      }

      const journeyData = await AnalyticsController.getPatientJourneyData(email as string);

      res.status(200).json({
        success: true,
        data: journeyData
      });
    } catch (error) {
      logger.error('Error fetching patient journey:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patient journey'
      });
    }
  }

  /**
   * GET /api/v1/analytics/patient-dropoffs
   * Get patients who dropped off at various stages
   */
  static async getPatientDropoffs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { stage, timeRange = '7d' } = req.query;

      const dropoffData = await AnalyticsController.getDropoffAnalytics({
        stage: stage as string,
        timeRange: timeRange as string
      });

      res.status(200).json({
        success: true,
        data: dropoffData
      });
    } catch (error) {
      logger.error('Error fetching dropoff analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dropoff analytics'
      });
    }
  }

  /**
   * POST /api/v1/analytics/patient-cohort
   * Get cohort analysis for patient retention
   */
  static async getPatientCohort(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, cohortType = 'signup' } = req.body;

      const cohortData = await AnalyticsController.getCohortAnalysis({
        startDate,
        endDate,
        cohortType
      });

      res.status(200).json({
        success: true,
        data: cohortData
      });
    } catch (error) {
      logger.error('Error fetching cohort analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cohort analysis'
      });
    }
  }

  // Helper methods for PostHog integration
  private static async fetchPatientEventsFromPostHog(params: {
    email?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
    limit: number;
  }) {
    // This would integrate with PostHog's API to fetch actual events
    // For now, returning mock data structure
    return [
      {
        event: 'patient_signup_step1_attempted',
        timestamp: new Date().toISOString(),
        distinctId: params.email || 'unknown',
        properties: {
          email: params.email,
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          step: 1
        }
      },
      {
        event: 'patient_login_completed',
        timestamp: new Date().toISOString(),
        distinctId: params.email || 'unknown',
        properties: {
          email: params.email,
          login_method: 'email_otp',
          returning_user: true
        }
      }
      // More events would be here in real implementation
    ];
  }

  private static async getPatientJourneyData(email: string) {
    // Fetch patient journey from PostHog
    return {
      patient_email: email,
      journey_stages: [
        {
          stage: 'landing_page_visited',
          timestamp: new Date().toISOString(),
          duration_seconds: 45
        },
        {
          stage: 'signup_initiated',
          timestamp: new Date().toISOString(),
          duration_seconds: 120
        },
        {
          stage: 'signup_completed',
          timestamp: new Date().toISOString(),
          duration_seconds: 30
        },
        {
          stage: 'dashboard_accessed',
          timestamp: new Date().toISOString(),
          duration_seconds: 180
        }
      ],
      conversion_events: [
        'patient_signup_completed',
        'patient_login_completed'
      ],
      drop_off_points: [],
      total_session_time: 375,
      last_activity: new Date().toISOString()
    };
  }

  private static async getDropoffAnalytics(params: {
    stage?: string;
    timeRange: string;
  }) {
    return {
      time_range: params.timeRange,
      dropoff_funnel: [
        {
          stage: 'landing_page_visited',
          users_entered: 1000,
          users_completed: 800,
          dropoff_rate: 0.2,
          dropoff_count: 200
        },
        {
          stage: 'signup_step1_attempted',
          users_entered: 800,
          users_completed: 600,
          dropoff_rate: 0.25,
          dropoff_count: 200
        },
        {
          stage: 'signup_step2_attempted',
          users_entered: 600,
          users_completed: 500,
          dropoff_rate: 0.17,
          dropoff_count: 100
        }
      ],
      dropped_off_emails: [
        {
          email: 'user1@example.com',
          drop_stage: 'signup_step1_attempted',
          timestamp: new Date().toISOString(),
          time_spent: 45
        },
        {
          email: 'user2@example.com',
          drop_stage: 'signup_step2_attempted',
          timestamp: new Date().toISOString(),
          time_spent: 120
        }
      ]
    };
  }

  private static async getCohortAnalysis(params: {
    startDate?: string;
    endDate?: string;
    cohortType: string;
  }) {
    return {
      cohort_type: params.cohortType,
      date_range: {
        start: params.startDate,
        end: params.endDate
      },
      cohorts: [
        {
          cohort_date: '2025-01-01',
          initial_users: 100,
          retention: {
            day_1: 85,
            day_7: 65,
            day_30: 45,
            day_90: 30
          }
        },
        {
          cohort_date: '2025-01-08',
          initial_users: 120,
          retention: {
            day_1: 90,
            day_7: 70,
            day_30: 50,
            day_90: 35
          }
        }
      ]
    };
  }

  // Generate dashboard data for admin panel
  private static async generateDashboardData(timeRange: string) {
    // In real implementation, this would query PostHog API
    const mockData = {
      totalSignups: timeRange === '1d' ? 12 : timeRange === '7d' ? 85 : timeRange === '30d' ? 320 : 890,
      activePatients: Math.floor(Math.random() * 50) + 10,
      conversionRate: Math.floor(Math.random() * 30) + 15,
      topLocations: [
        { location: 'Toronto, ON', searches: 145 },
        { location: 'Vancouver, BC', searches: 132 },
        { location: 'Calgary, AB', searches: 98 },
        { location: 'Montreal, QC', searches: 87 },
        { location: 'Ottawa, ON', searches: 65 }
      ],
      dropoffData: {
        landingPage: 1000,
        signupStep1: 800,
        signupStep2: 600,
        searchResults: 450
      },
      recentActivity: [
        {
          email: 'patient1@example.com',
          action: 'Completed signup',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          location: 'Toronto, ON'
        },
        {
          email: 'patient2@example.com',
          action: 'Searched for dentists',
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
          location: 'Vancouver, BC'
        },
        {
          email: 'patient3@example.com',
          action: 'Viewed clinic details',
          timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
          location: 'Calgary, AB'
        },
        {
          email: 'patient4@example.com',
          action: 'Started appointment booking',
          timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
          location: 'Montreal, QC'
        },
        {
          email: 'patient5@example.com',
          action: 'Logged in',
          timestamp: new Date(Date.now() - 35 * 60000).toISOString()
        }
      ]
    };

    return mockData;
  }
}
