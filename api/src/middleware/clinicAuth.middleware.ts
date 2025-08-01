// api/src/middleware/clinicAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Clinic } from '../models';

interface AuthRequest extends Request {
  clinic?: any;
}

export const clinicAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    // Get token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.clinicToken) {
      token = req.cookies.clinicToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if it's a clinic token
    if (decoded.type !== 'clinic') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.'
      });
    }

    // Get clinic from database
    const clinic = await Clinic.findById(decoded.id).select('-password');
    if (!clinic) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but clinic not found.'
      });
    }

    // Check if clinic is active and auth is set up
    if (!clinic.active || !clinic.authSetup) {
      return res.status(401).json({
        success: false,
        message: 'Clinic account is not active.'
      });
    }

    req.clinic = clinic;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};
