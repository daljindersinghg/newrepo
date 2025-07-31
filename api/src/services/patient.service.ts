import { Patient, IPatient } from '../models';
import { OTPService } from './otp.service';
import { AuthService } from './auth.service';

export interface PatientSignupStep1Data {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    lastDentalVisit?: Date;
  };
}

export interface PatientSignupStep2Data {
  email: string;
  otp: string;
  insurance?: {
    provider: string;
    memberId: string;
    groupNumber?: string;
  };
}

export interface PatientLoginData {
  email: string;
  otp?: string;
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
      const { email, firstName, lastName, phone, dateOfBirth, address, emergencyContact, medicalHistory } = data;

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
        // Update existing unverified patient with all details
        (existingPatient as any).firstName = firstName;
        (existingPatient as any).lastName = lastName;
        (existingPatient as any).phone = phone;
        (existingPatient as any).dateOfBirth = dateOfBirth;
        (existingPatient as any).address = address;
        (existingPatient as any).emergencyContact = emergencyContact;
        if (medicalHistory) {
          (existingPatient as any).medicalHistory = medicalHistory;
        }
        (existingPatient as any).emailOTP = hashedOTP;
        (existingPatient as any).otpExpires = otpExpires;
        (existingPatient as any).signupStep = 1;
        patient = await existingPatient.save();
      } else {
        // Create new patient with all details
        patient = new Patient({
          email,
          firstName,
          lastName,
          phone,
          dateOfBirth,
          address,
          emergencyContact,
          medicalHistory,
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
        patientName: `${firstName} ${lastName}`,
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
      console.error('Error in signupStep1:', error);
      return {
        success: false,
        message: 'An error occurred during signup. Please try again.',
        step: 1
      };
    }
  }

  /**
   * Step 2: Verify OTP and add optional insurance info
   */
  static async signupStep2(data: PatientSignupStep2Data): Promise<{
    success: boolean;
    message: string;
    patient?: IPatient;
    token?: string;
    step: number;
  }> {
    try {
      const { email, otp, insurance } = data;

      // Find patient
      const patient = await Patient.findOne({ email });
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
        return {
          success: false,
          message: 'Invalid or expired verification code. Please request a new one.',
          step: 2
        };
      }

      // Update patient verification status and optional insurance
      (patient as any).isEmailVerified = true;
      (patient as any).signupStep = 2;
      (patient as any).emailOTP = undefined;
      (patient as any).otpExpires = undefined;

      // Add optional insurance data
      if (insurance) {
        (patient as any).insurance = insurance;
      }

      await patient.save();

      // Generate JWT token
      const token = AuthService.generatePatientToken((patient._id as any).toString());

      // Remove sensitive data from response
      const responsePatient = patient.toObject();
      delete responsePatient.emailOTP;
      delete responsePatient.otpExpires;

      return {
        success: true,
        message: 'Registration completed successfully! Welcome to our platform.',
        patient: responsePatient,
        token,
        step: 2
      };

    } catch (error) {
      console.error('Error in signupStep2:', error);
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
      const otp = OTPService.generateOTP();
      const hashedOTP = OTPService.hashOTP(otp);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update patient with new OTP
      (patient as any).emailOTP = hashedOTP;
      (patient as any).otpExpires = otpExpires;
      await patient.save();

      // Send OTP email
      const emailSent = await OTPService.sendEmailOTP({
        email,
        otp,
        patientName: `${(patient as any).firstName} ${(patient as any).lastName}`,
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
      console.error('Error in resendVerificationOTP:', error);
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
        isEmailVerified: true 
      });

      if (!patient) {
        return {
          success: false,
          message: 'No verified account found with this email. Please sign up first.'
        };
      }

      // Generate OTP
      const otp = OTPService.generateOTP();
      const hashedOTP = OTPService.hashOTP(otp);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update patient with login OTP
      (patient as any).emailOTP = hashedOTP;
      (patient as any).otpExpires = otpExpires;
      await patient.save();

      // Send OTP email
      const emailSent = await OTPService.sendEmailOTP({
        email,
        otp,
        patientName: `${(patient as any).firstName} ${(patient as any).lastName}`,
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
      console.error('Error in loginStep1:', error);
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
    patient?: IPatient;
    token?: string;
  }> {
    try {
      const { email, otp } = data;

      if (!otp) {
        return {
          success: false,
          message: 'OTP is required'
        };
      }

      // Find verified patient
      const patient = await Patient.findOne({ 
        email, 
        isEmailVerified: true 
      });

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
        return {
          success: false,
          message: 'Invalid or expired login code. Please request a new one.'
        };
      }

      // Clear OTP after successful login
      (patient as any).emailOTP = undefined;
      (patient as any).otpExpires = undefined;
      (patient as any).lastLogin = new Date();
      await patient.save();

      // Generate JWT token
      const token = AuthService.generatePatientToken((patient._id as any).toString());

      // Remove sensitive data from response
      const responsePatient = patient.toObject();
      delete responsePatient.emailOTP;
      delete responsePatient.otpExpires;

      return {
        success: true,
        message: 'Login successful!',
        patient: responsePatient,
        token
      };

    } catch (error) {
      console.error('Error in loginStep2:', error);
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
    const patient = await Patient.findById(id).select('-emailOTP -otpExpires');
    return patient;
  }

  /**
   * Update patient profile (for authenticated patients)
   */
  static async updatePatient(id: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    // Remove sensitive fields that shouldn't be updated
    const sanitizedData = { ...updateData };
    delete (sanitizedData as any).email;
    delete (sanitizedData as any).emailOTP;
    delete (sanitizedData as any).otpExpires;
    delete (sanitizedData as any).isEmailVerified;
    delete (sanitizedData as any).signupStep;

    const patient = await Patient.findByIdAndUpdate(
      id,
      sanitizedData,
      { new: true, runValidators: true }
    ).select('-emailOTP -otpExpires');

    return patient;
  }

  /**
   * Get all patients with pagination (admin function)
   */
  static async getPatients(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      Patient.find()
        .select('-emailOTP -otpExpires')
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
  }

  /**
   * Delete patient (admin function)
   */
  static async deletePatient(id: string): Promise<boolean> {
    const patient = await Patient.findByIdAndDelete(id);
    return !!patient;
  }

  /**
   * Find patient by email (admin function)
   */
  static async getPatientByEmail(email: string): Promise<IPatient | null> {
    const patient = await Patient.findOne({ email }).select('-emailOTP -otpExpires');
    return patient;
  }

  /**
   * Search patients by name or email (admin function)
   */
  static async searchPatients(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const searchRegex = new RegExp(query, 'i');
    const filter = {
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex }
      ]
    };

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .select('-emailOTP -otpExpires')
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
  }
}
