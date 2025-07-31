// api/src/controllers/patientAuth.controller.ts (FIXED VERSION)
import { Request, Response } from 'express';
import { 
  PatientService, 
  PatientSignupStep1Data, 
  PatientSignupStep2Data, 
  PatientLoginData 
} from '../services/patient.service';
import logger from '../config/logger.config';

export class PatientAuthController {
  /**
   * POST /api/v1/patients/auth/signup/step1
   * Send OTP to email only
   */
  static async signupStep1(req: Request, res: Response): Promise<void> {
    try {
      const { email }: PatientSignupStep1Data = req.body;

      console.log('TCL ~ :20 ~ PatientAuthController ~ signupStep1 ~ email::==', email)


      // Validate required fields
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
          step: 1
        });
        return;
      }

      const result = await PatientService.signupStep1({
        email: email.toLowerCase().trim()
      });

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      logger.error('Error in signupStep1:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        step: 1
      });
    }
  }

  /**
   * POST /api/v1/patients/auth/signup/step2
   * Verify OTP and complete registration with all details
   */
  static async signupStep2(req: Request, res: Response): Promise<void> {
    try {
      const { 
        email, 
        otp, 
        name, 
        phone, 
        dateOfBirth, 
        insuranceProvider 
      }: PatientSignupStep2Data = req.body;

      // Validate required fields
      if (!email || !otp || !name || !phone || !dateOfBirth) {
        res.status(400).json({
          success: false,
          message: 'All required fields must be provided: email, otp, name, phone, dateOfBirth',
          step: 2
        });
        return;
      }

      const result = await PatientService.signupStep2({
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
        name: name.trim(),
        phone: phone.trim(),
        dateOfBirth: new Date(dateOfBirth),
        insuranceProvider
      });

      const statusCode = result.success ? 200 : 400;
      
      if (result.success && result.token) {
        // Set JWT token in HTTP-only cookie
        res.cookie('patient_token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      res.status(statusCode).json(result);
    } catch (error) {
      logger.error('Error in signupStep2:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        step: 2
      });
    }
  }

  /**
   * POST /api/v1/patients/auth/resend-otp
   * Resend verification OTP
   */
  static async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const result = await PatientService.resendVerificationOTP(email.toLowerCase().trim());

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      logger.error('Error in resendOTP:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/v1/patients/auth/login/step1
   * Send login OTP to patient email
   */
  static async loginStep1(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const result = await PatientService.loginStep1(email.toLowerCase().trim());

      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (error) {
      logger.error('Error in loginStep1:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/v1/patients/auth/login/step2
   * Verify login OTP and authenticate patient
   */
  static async loginStep2(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp }: PatientLoginData = req.body;

      if (!email || !otp) {
        res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
        return;
      }

      const result = await PatientService.loginStep2({
        email: email.toLowerCase().trim(),
        otp: otp.trim()
      });

      const statusCode = result.success ? 200 : 400;
      
      if (result.success && result.token) {
        // Set JWT token in HTTP-only cookie
        res.cookie('patient_token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      res.status(statusCode).json(result);
    } catch (error) {
      logger.error('Error in loginStep2:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * POST /api/v1/patients/auth/logout
   * Logout patient by clearing the token cookie
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear the patient token cookie
      res.clearCookie('patient_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Error in logout:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * GET /api/v1/patients/auth/me
   * Get current patient profile (requires authentication)
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // Patient ID should be set by authentication middleware
      const patientId = (req as any).patientId;

      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const patient = await PatientService.getPatientById(patientId);

      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        patient
      });
    } catch (error) {
      logger.error('Error in getProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * PUT /api/v1/patients/auth/profile
   * Update patient profile (requires authentication)
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // Patient ID should be set by authentication middleware
      const patientId = (req as any).patientId;

      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const updateData = req.body;

      // Remove any sensitive fields that shouldn't be updated via this endpoint
      delete updateData.email;
      delete updateData.emailOTP;
      delete updateData.otpExpires;
      delete updateData.isEmailVerified;
      delete updateData.signupStep;

      const updatedPatient = await PatientService.updatePatient(patientId, updateData);

      if (!updatedPatient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        patient: updatedPatient
      });
    } catch (error) {
      logger.error('Error in updateProfile:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}