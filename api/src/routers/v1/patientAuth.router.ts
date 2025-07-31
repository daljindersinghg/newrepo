// api/src/routers/v1/patientAuth.router.ts
import { Router } from 'express';
import { PatientAuthController } from '../../controllers/patientAuth.controller';
import { PatientAuthValidator } from '../../validators/patientAuth.validator';
import { authenticatePatient } from '../../middleware/patientAuth.middleware';
import { handleValidationErrors } from '../../middleware/validation.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/signup/step1', 
  PatientAuthValidator.signupStep1(),
  handleValidationErrors,
  PatientAuthController.signupStep1
);

router.post('/signup/step2', 
  PatientAuthValidator.signupStep2(),
  handleValidationErrors,
  PatientAuthController.signupStep2
);

router.post('/resend-otp', 
  PatientAuthValidator.resendOTP(),
  handleValidationErrors,
  PatientAuthController.resendOTP
);

router.post('/login/step1', 
  PatientAuthValidator.loginStep1(),
  handleValidationErrors,
  PatientAuthController.loginStep1
);

router.post('/login/step2', 
  PatientAuthValidator.loginStep2(),
  handleValidationErrors,
  PatientAuthController.loginStep2
);

// Protected routes (authentication required)
router.post('/logout', authenticatePatient, PatientAuthController.logout);
router.get('/me', authenticatePatient, PatientAuthController.getProfile);
router.put('/profile', 
  authenticatePatient,
  PatientAuthValidator.updateProfile(),
  handleValidationErrors,
  PatientAuthController.updateProfile
);

export default router;
