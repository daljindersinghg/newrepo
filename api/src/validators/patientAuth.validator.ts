// api/src/validators/patientAuth.validator.ts
import { body, ValidationChain } from 'express-validator';

export class PatientAuthValidator {
  /**
   * Validation for signup step 1
   */
  static signupStep1(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
      body('phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
      body('dateOfBirth')
        .isISO8601()
        .withMessage('Please provide a valid date of birth')
        .custom((value) => {
          const dob = new Date(value);
          const today = new Date();
          const minAge = new Date();
          minAge.setFullYear(today.getFullYear() - 13);
          
          if (dob > minAge) {
            throw new Error('Patient must be at least 13 years old');
          }
          return true;
        })
    ];
  }

  /**
   * Validation for signup step 2
   */
  static signupStep2(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be a 6-digit number'),
      body('insuranceProvider')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Insurance provider must be between 1 and 100 characters')
    ];
  }

  /**
   * Validation for resend OTP
   */
  static resendOTP(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
    ];
  }

  /**
   * Validation for login step 1
   */
  static loginStep1(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
    ];
  }

  /**
   * Validation for login step 2
   */
  static loginStep2(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
      body('otp')
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be a 6-digit number')
    ];
  }

  /**
   * Validation for profile update
   */
  static updateProfile(): ValidationChain[] {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
      body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
      body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth')
        .custom((value) => {
          if (value) {
            const dob = new Date(value);
            const today = new Date();
            const minAge = new Date();
            minAge.setFullYear(today.getFullYear() - 13);
            
            if (dob > minAge) {
              throw new Error('Patient must be at least 13 years old');
            }
          }
          return true;
        }),
      body('insuranceProvider')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Insurance provider must be between 1 and 100 characters')
    ];
  }
}