// api/src/services/patient.service.ts
import { Patient, IPatient } from '../models';
import { OTPService } from './otp.service';
import { AuthService } from './auth.service';
import logger from '../config/logger.config';

export interface PatientSignupStep1Data {
  email: string;
  name: string;
  phone: string;
  dateOfBirth: Date;
}

export interface PatientSignupStep2Data {
  email: string;
  otp: string;
  insuranceProvider?: string;
}

export interface PatientLoginData {
  email: string;
  otp: string;
}

export class PatientService {
  /**
   * Step 1: Initialize patient signup with email verification
   */
  static async signupStep1(data: PatientSignupStep1Data): Promise<{ 
    success: boolean; 
    message: string; 
    patientId?: string; 
    step: number;
  }> {
    try {
      const { email, name, phone, dateOfBirth } = data;

      // Validate email format
      if (!OTPService.isValidEmail(email)) {
        return {
          success: false,
          message: 'Invalid email format',
          step: 1
        };
      }

      // Check if patient already exists and is verified
      const existingPatient = await Patient.findOne({ email });
      if (existingPatient && existingPatient.isEmailVerified) {
        return {
          success: false,
          message: 'Patient with this email already exists and is verified. Please login instead.',
          step: 1
        };
      }

      // Generate OTP
      const otp = OTPService.generateOTP();
      const hashedOTP = OTPService.hashOTP(otp);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      let patient: IPatient;

      if (existingPatient && !existingPatient.isEmailVerified) {
        // Update existing unverified patient
        existingPatient.name = name;
        existingPatient.phone = phone;
        existingPatient.dateOfBirth = dateOfBirth;
        existingPatient.emailOTP = hashedOTP;
        existingPatient.otpExpires = otpExpires;
        existingPatient.signupStep = 1;
        patient = await existingPatient.save();
      } else {
        // Create new patient
        patient = new Patient({
          email,
          name,
          phone,
          dateOfBirth,
          emailOTP: hashedOTP,
          otpExpires,
          signupStep: 1,
          isEmailVerified: false
        });
        await patient.save();
      }

      // Send OTP email
      const emailSent = await OTPService.sendEmailOTP({
        email,
        otp,
        patientName: name,
        type: 'signup'
      });

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again.',
          step: 1
        };
      }

      return {
        success: true,
        message: 'Verification code sent to your email. Please check your inbox.',
        patientId: (patient._id as any).toString(),
        step: 1
      };

    } catch (error) {
      logger.error('Error in signupStep1:', error);
      return {
        success: false,
        message: 'An error occurred during signup. Please try again.',
        step: 1
      };
    }
  }

  /**
   * Step 2: Verify OTP and complete signup
   */
  static async signupStep2(data: PatientSignupStep2Data): Promise<{
    success: boolean;
    message: string;
    patient?: Omit<IPatient, 'emailOTP' | 'otpExpires'>;
    token?: string;
    step: number;
  }> {
    try {
      const { email, otp, insuranceProvider } = data;

      // Find patient
      const patient = await Patient.findOne({ email }).select('+emailOTP +otpExpires +otpAttempts');
      if (!patient) {
        return {
          success: false,
          message: 'Patient not found. Please start the signup process again.',
          step: 2
        };
      }

      // Check if already verified
      if (patient.isEmailVerified) {
        return {
          success: false,
          message: 'Email already verified. Please login instead.',
          step: 2
        };
      }

      // Validate OTP format
      if (!OTPService.isValidOTPFormat(otp)) {
        return {
          success: false,
          message: 'Invalid OTP format. Please enter a 6-digit code.',
          step: 2
        };
      }

      // Verify OTP
      if (!patient.isOTPValid(otp)) {
        await patient.save(); // Save the incremented attempt count
        return {
          success: false,
          message: 'Invalid or expired verification code. Please request a new one.',
          step: 2
        };
      }

      // Update patient verification status
      patient.isEmailVerified = true;
      patient.signupStep = 'completed';
      patient.emailOTP = undefined;
      patient.otpExpires = undefined;
      patient.otpAttempts = undefined;

      // Add optional insurance data
      if (insuranceProvider) {
        patient.insuranceProvider = insuranceProvider;
      }

      await patient.save();

      // Generate JWT token
      const token = AuthService.generatePatientToken((patient._id as any).toString());

      // Remove sensitive data from response
      const responsePatient = patient.toObject();
      delete responsePatient.emailOTP;
      delete responsePatient.otpExpires;
      delete responsePatient.otpAttempts;

      return {
        success: true,
        message: 'Registration completed successfully! Welcome to our platform.',
        patient: responsePatient,
        token,
        step: 2
      };

    } catch (error) {
      logger.error('Error in signupStep2:', error);
      return {
        success: false,
        message: 'An error occurred during verification. Please try again.',
        step: 2
      };
    }
  }

  /**
   * Resend verification OTP
   */
  static async resendVerificationOTP(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Find unverified patient
      const patient = await Patient.findOne({ 
        email, 
        isEmailVerified: false 
      });

      if (!patient) {
        return {
          success: false,
          message: 'Patient not found or already verified.'
        };
      }

      // Generate new OTP
      const otp = patient.generateEmailOTP();
      await patient.save();

      // Send OTP email
      const emailSent = await OTPService.sendEmailOTP({
        email,
        otp,
        patientName: patient.name,
        type: 'verification'
      });

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again.'
        };
      }

      return {
        success: true,
        message: 'New verification code sent to your email.'
      };

    } catch (error) {
      logger.error('Error in resendVerificationOTP:', error);
      return {
        success: false,
        message: 'An error occurred. Please try again.'
      };
    }
  }

  /**
   * Step 1: Send login OTP
   */
  static async loginStep1(email: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Validate email format
      if (!OTPService.isValidEmail(email)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Find verified patient
      const patient = await Patient.findOne({ 
        email, 
        isEmailVerified: true,
        isActive: true
      });

      if (!patient) {
        return {
          success: false,
          message: 'No verified account found with this email. Please sign up first.'
        };
      }

      // Generate OTP
      const otp = patient.generateEmailOTP();
      await patient.save();

      // Send OTP email
      const emailSent = await OTPService.sendEmailOTP({
        email,
        otp,
        patientName: patient.name,
        type: 'login'
      });

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send login code. Please try again.'
        };
      }

      return {
        success: true,
        message: 'Login code sent to your email. Please check your inbox.'
      };

    } catch (error) {
      logger.error('Error in loginStep1:', error);
      return {
        success: false,
        message: 'An error occurred. Please try again.'
      };
    }
  }

  /**
   * Step 2: Verify login OTP and authenticate
   */
  static async loginStep2(data: PatientLoginData): Promise<{
    success: boolean;
    message: string;
    patient?: Omit<IPatient, 'emailOTP' | 'otpExpires'>;
    token?: string;
  }> {
    try {
      const { email, otp } = data;

      // Find verified patient
      const patient = await Patient.findOne({ 
        email, 
        isEmailVerified: true,
        isActive: true
      }).select('+emailOTP +otpExpires +otpAttempts');

      if (!patient) {
        return {
          success: false,
          message: 'No verified account found with this email.'
        };
      }

      // Validate OTP format
      if (!OTPService.isValidOTPFormat(otp)) {
        return {
          success: false,
          message: 'Invalid OTP format. Please enter a 6-digit code.'
        };
      }

      // Verify OTP
      if (!patient.isOTPValid(otp)) {
        await patient.save(); // Save the incremented attempt count
        return {
          success: false,
          message: 'Invalid or expired login code. Please request a new one.'
        };
      }

      // Clear OTP after successful login
      patient.emailOTP = undefined;
      patient.otpExpires = undefined;
      patient.otpAttempts = undefined;
      await patient.save();

      // Generate JWT token
      const token = AuthService.generatePatientToken((patient._id as any).toString());

      // Remove sensitive data from response
      const responsePatient = patient.toObject();
      delete responsePatient.emailOTP;
      delete responsePatient.otpExpires;
      delete responsePatient.otpAttempts;

      return {
        success: true,
        message: 'Login successful!',
        patient: responsePatient,
        token
      };

    } catch (error) {
      logger.error('Error in loginStep2:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.'
      };
    }
  }

  /**
   * Get patient by ID (for authenticated requests)
   */
  static async getPatientById(id: string): Promise<IPatient | null> {
    try {
      const patient = await Patient.findById(id).select('-emailOTP -otpExpires -otpAttempts');
      return patient;
    } catch (error) {
      logger.error('Error getting patient by ID:', error);
      return null;
    }
  }

  /**
   * Update patient profile (for authenticated patients)
   */
  static async updatePatient(id: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    try {
      // Remove sensitive fields that shouldn't be updated
      const sanitizedData = { ...updateData };
      delete (sanitizedData as any).email;
      delete (sanitizedData as any).emailOTP;
      delete (sanitizedData as any).otpExpires;
      delete (sanitizedData as any).otpAttempts;
      delete (sanitizedData as any).isEmailVerified;
      delete (sanitizedData as any).signupStep;

      const patient = await Patient.findByIdAndUpdate(
        id,
        sanitizedData,
        { new: true, runValidators: true }
      ).select('-emailOTP -otpExpires -otpAttempts');

      return patient;
    } catch (error) {
      logger.error('Error updating patient:', error);
      throw error;
    }
  }

  /**
   * Create a new patient (admin function)
   */
  static async createPatient(patientData: Partial<IPatient>): Promise<IPatient> {
    try {
      // Check if patient already exists
      const existingPatient = await Patient.findOne({ email: patientData.email });
      if (existingPatient) {
        throw new Error('Patient with this email already exists');
      }

      // Create new patient (admin created patients are automatically verified)
      const patient = new Patient({
        ...patientData,
        isEmailVerified: true,
        signupStep: 'completed'
      });
      await patient.save();

      logger.info(`New patient created by admin: ${patient._id}`);
      return patient;
    } catch (error) {
      logger.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Get all patients with pagination (admin function)
   */
  static async getPatients(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [patients, total] = await Promise.all([
        Patient.find()
          .select('-emailOTP -otpExpires -otpAttempts')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Patient.countDocuments()
      ]);

      return {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting patients:', error);
      throw error;
    }
  }

  /**
   * Delete patient (admin function)
   */
  static async deletePatient(id: string): Promise<boolean> {
    try {
      const patient = await Patient.findByIdAndDelete(id);
      
      if (patient) {
        logger.info(`Patient deleted: ${id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting patient:', error);
      throw error;
    }
  }

  /**
   * Find patient by email (admin function)
   */
  static async getPatientByEmail(email: string): Promise<IPatient | null> {
    try {
      const patient = await Patient.findOne({ email }).select('-emailOTP -otpExpires -otpAttempts');
      return patient;
    } catch (error) {
      logger.error('Error getting patient by email:', error);
      return null;
    }
  }

  /**
   * Search patients by name or email (admin function)
   */
  static async searchPatients(query: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const searchRegex = new RegExp(query, 'i');
      const filter = {
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      };

      const [patients, total] = await Promise.all([
        Patient.find(filter)
          .select('-emailOTP -otpExpires -otpAttempts')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Patient.countDocuments(filter)
      ]);

      return {
        patients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error searching patients:', error);
      throw error;
    }
  }
}