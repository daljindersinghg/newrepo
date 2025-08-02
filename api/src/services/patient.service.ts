// api/src/services/patient.service.ts (FIXED VERSION)
import { Patient, IPatient } from '../models';
import { OTPService } from './otp.service';
import { AuthService } from './auth.service';
import logger from '../config/logger.config';

export interface PatientSignupStep1Data {
  email: string;
}

export interface PatientSignupStep2Data {
  email: string; // Frontend will pass this from state management
  otp: string;
  name: string;
  phone: string;
  dateOfBirth: Date;
  insuranceProvider?: string;
}

export interface PatientLoginData {
  email: string;
  otp: string;
}

export class PatientService {
  /**
   * Step 1: Send OTP to email only
   */
  static async signupStep1(data: PatientSignupStep1Data): Promise<{ 
    success: boolean; 
    message: string; 
    email?: string;
    step: number;
  }> {
    try {
      const { email } = data;

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
        // Update existing unverified patient with new OTP
        existingPatient.emailOTP = hashedOTP;
        existingPatient.otpExpires = otpExpires;
        existingPatient.signupStep = 1;
        patient = await existingPatient.save();
      } else {
        // Create new patient with just email and OTP
        patient = new Patient({
          email,
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
        patientName: 'New Patient', // Generic name for step 1
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
        email: email, // Return email for frontend state
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
   * Step 2: Verify OTP and complete signup with all details
   */
  static async signupStep2(data: PatientSignupStep2Data): Promise<{
    success: boolean;
    message: string;
    patient?: Omit<IPatient, 'emailOTP' | 'otpExpires'>;
    token?: string;
    step: number;
  }> {
    try {
      const { email, otp, name, phone, dateOfBirth, insuranceProvider } = data;

      // Validate required fields
      if (!email || !otp || !name || !phone || !dateOfBirth) {
        return {
          success: false,
          message: 'All required fields must be provided: email, otp, name, phone, dateOfBirth',
          step: 2
        };
      }

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

      // Update patient with complete information
      patient.name = name.trim();
      patient.phone = phone.trim();
      patient.dateOfBirth = new Date(dateOfBirth);
      patient.isEmailVerified = true;
      patient.signupStep = 'completed';
      patient.emailOTP = undefined;
      patient.otpExpires = undefined;
      patient.otpAttempts = undefined;



      // Add optional insurance data
      if (insuranceProvider) {
        patient.insuranceProvider = insuranceProvider.trim();
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
        patientName: patient.name || 'New Patient',
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
   * Login Step 1: Send login OTP (email only)
   */
  static async loginStep1(email: string): Promise<{
    success: boolean;
    message: string;
    email?: string;
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
        patientName: patient.name || 'Patient',
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
        message: 'Login code sent to your email. Please check your inbox.',
        email: email // Return email for frontend state
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
   * Login Step 2: Verify login OTP
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

  // ... keep all other existing methods unchanged ...
  static async getPatientById(id: string): Promise<IPatient | null> {
    try {
      const patient = await Patient.findById(id).select('-emailOTP -otpExpires -otpAttempts');
      return patient;
    } catch (error) {
      logger.error('Error getting patient by ID:', error);
      return null;
    }
  }

  static async updatePatient(id: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    try {
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

  static async createPatient(patientData: Partial<IPatient>): Promise<IPatient> {
    try {
      const existingPatient = await Patient.findOne({ email: patientData.email });
      if (existingPatient) {
        throw new Error('Patient with this email already exists');
      }

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

  static async getPatientByEmail(email: string): Promise<IPatient | null> {
    try {
      const patient = await Patient.findOne({ email }).select('-emailOTP -otpExpires -otpAttempts');
      return patient;
    } catch (error) {
      logger.error('Error getting patient by email:', error);
      return null;
    }
  }

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