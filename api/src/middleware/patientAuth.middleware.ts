// api/src/middleware/patientAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { PatientService } from '../services/patient.service';

interface AuthenticatedRequest extends Request {
  patientId?: string;
  patient?: any;
}

/**
 * Middleware to authenticate patient requests using JWT token
 */
export const authenticatePatient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.patient_token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
      return;
    }

    // Get patient from database
    const patient = await PatientService.getPatientById(decoded.userId);
    if (!patient) {
      res.status(401).json({
        success: false,
        message: 'Patient not found.'
      });
      return;
    }

    // Check if patient's email is verified
    if (!patient.isEmailVerified) {
      res.status(401).json({
        success: false,
        message: 'Email not verified. Please verify your email first.'
      });
      return;
    }

    // Attach patient info to request
    req.patientId = (patient._id as any).toString();
    req.patient = patient;

    next();
  } catch (error) {
    console.error('Error in authenticatePatient middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

/**
 * Optional middleware to authenticate patient requests
 * Sets patient info if token is valid, but doesn't block the request
 */
export const optionalPatientAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies?.patient_token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      // Verify token
      const decoded = AuthService.verifyToken(token);
      if (decoded) {
        // Get patient from database
        const patient = await PatientService.getPatientById(decoded.userId);
        if (patient && patient.isEmailVerified) {
          // Attach patient info to request
          req.patientId = (patient._id as any).toString();
          req.patient = patient;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error in optionalPatientAuth middleware:', error);
    // Don't block the request for optional auth
    next();
  }
};
