// api/src/middleware/adminAuth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';

interface AdminRequest extends Request {
  admin?: any;
}

export const adminAuth = async (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET_KEY;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET_KEY not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      const admin = await Admin.findById(decoded.id).select('-password');

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Admin not found.'
        });
      }

      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Optional: Role-based middleware
export const requireRole = (roles: string[]) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required.'
      });
    }

    const hasRole = req.admin.roles.some((role: string) => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};
