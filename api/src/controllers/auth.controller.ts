// api/src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../config/logger.config';

export class AuthController {
  /**
   * User signup
   */
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, email, password, phone, dateOfBirth, gender } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'First name, last name, email, and password are required'
        });
        return;
      }

      // Validate password strength
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
        return;
      }

      const result = await AuthService.signup({
        firstName,
        lastName,
        email,
        password,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error: any) {
      logger.error('Signup error:', error);
      
      if (error.message.includes('already exists')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages
        });
        return;
      }

      next(error);
    }
  }

  /**
   * User login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      const result = await AuthService.login({ email, password });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      
      if (error.message.includes('Invalid email or password')) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore - userId is set by auth middleware
      const userId = req.userId;
      
      const user = await AuthService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore - userId is set by auth middleware
      const userId = req.userId;
      const updateData = req.body;

      const user = await AuthService.updateProfile(userId, updateData);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error: any) {
      logger.error('Update profile error:', error);
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: messages
        });
        return;
      }

      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore - userId is set by auth middleware
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
        return;
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      logger.error('Change password error:', error);
      
      if (error.message.includes('Current password is incorrect')) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }

      next(error);
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      const resetToken = await AuthService.generatePasswordResetToken(email);

      // In a real application, you would send an email with the reset link
      // For now, we'll just return success (don't expose the token in production)
      res.json({
        success: true,
        message: 'Password reset instructions have been sent to your email',
        // Only include token in development
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (error: any) {
      logger.error('Password reset request error:', error);
      
      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If an account with this email exists, password reset instructions have been sent'
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Reset token and new password are required'
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
        return;
      }

      await AuthService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error: any) {
      logger.error('Password reset error:', error);
      
      if (error.message.includes('Token is invalid or has expired')) {
        res.status(400).json({
          success: false,
          message: 'Reset token is invalid or has expired'
        });
        return;
      }

      next(error);
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      await AuthService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error: any) {
      logger.error('Email verification error:', error);
      
      if (error.message.includes('Invalid verification token')) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
        return;
      }

      next(error);
    }
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore - userId is set by auth middleware
      const userId = req.userId;
      
      const newToken = await AuthService.refreshToken(userId);

      res.json({
        success: true,
        data: { token: newToken }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      next(error);
    }
  }

  /**
   * Logout (client-side token removal)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}
