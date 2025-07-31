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
      body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
      body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
      body('phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
      body('dateOfBirth')
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),
      body('address.street')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Street address is required and must be between 1 and 200 characters'),
      body('address.city')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('City is required and must be between 1 and 100 characters'),
      body('address.state')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('State is required and must be between 1 and 100 characters'),
      body('address.zipCode')
        .trim()
        .isLength({ min: 5, max: 10 })
        .withMessage('Zip code is required and must be between 5 and 10 characters'),
      body('emergencyContact.name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Emergency contact name is required and must be between 2 and 100 characters'),
      body('emergencyContact.phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid emergency contact phone number'),
      body('emergencyContact.relationship')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Emergency contact relationship is required and must be between 1 and 50 characters'),
      body('medicalHistory.allergies')
        .optional()
        .isArray()
        .withMessage('Allergies must be an array'),
      body('medicalHistory.medications')
        .optional()
        .isArray()
        .withMessage('Medications must be an array'),
      body('medicalHistory.conditions')
        .optional()
        .isArray()
        .withMessage('Conditions must be an array'),
      body('medicalHistory.lastDentalVisit')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid last dental visit date')
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
      body('insurance.provider')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Insurance provider must be between 1 and 100 characters'),
      body('insurance.memberId')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Insurance member ID must be between 1 and 50 characters'),
      body('insurance.groupNumber')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Insurance group number must be between 1 and 50 characters')
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
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
      body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
      body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),
      body('address.street')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Street address must be between 1 and 200 characters'),
      body('address.city')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('City must be between 1 and 100 characters'),
      body('address.state')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('State must be between 1 and 100 characters'),
      body('address.zipCode')
        .optional()
        .trim()
        .isLength({ min: 5, max: 10 })
        .withMessage('Zip code must be between 5 and 10 characters'),
      body('emergencyContact.name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Emergency contact name must be between 2 and 100 characters'),
      body('emergencyContact.phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid emergency contact phone number'),
      body('emergencyContact.relationship')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Relationship must be between 1 and 50 characters')
    ];
  }
}
