// api/src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// interface AuthResult {
//   user: any;
//   token: string;
// }

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Generate JWT token
   */
  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET as any, {
      expiresIn: this.JWT_EXPIRES_IN
    } as any);
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate JWT token for patients (public method for patient service)
   */
  static generatePatientToken(patientId: string): string {
    return this.generateToken(patientId);
  }

  /**
   * Generate JWT token for clinics (public method for clinic service)
   */
  static generateClinicToken(clinicId: string): string {
    return this.generateToken(clinicId);
  }

  /**
   * Generate JWT token for admins (public method for admin service)
   */
  static generateAdminToken(adminId: string): string {
    return this.generateToken(adminId);
  }

  /**
   * Refresh token for any user type
   */
  static async refreshToken(userId: string): Promise<string> {
    try {
      // Simply generate a new token with the same userId
      return this.generateToken(userId);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Generate password reset token (for clinics and admins)
   */
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash password reset token
   */
  static hashPasswordResetToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate email verification token (for clinics)
   */
  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}