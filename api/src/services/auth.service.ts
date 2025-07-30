// api/src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models';

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  user: Omit<IUser, 'password'>;
  token: string;
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * Generate JWT token
   */
  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    });
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
   * User signup
   */
  static async signup(signupData: SignupData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: signupData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User({
        ...signupData,
        emailVerificationToken: crypto.randomBytes(32).toString('hex')
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user._id as string);

      // Return user without password
      const userWithoutPassword = await User.findById(user._id).select('-password');

      return {
        user: userWithoutPassword!,
        token
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * User login
   */
  static async login(loginData: LoginData): Promise<AuthResult> {
    try {
      // Find user and include password for comparison
      const user = await User.findOne({ 
        email: loginData.email,
        isActive: true 
      }).select('+password');

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(loginData.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id as string);

      // Return user without password
      const userWithoutPassword = await User.findById(user._id).select('-password');

      return {
        user: userWithoutPassword!,
        token
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).select('-password');
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      // Remove fields that shouldn't be updated this way
      const { password, email, isEmailVerified, ...allowedUpdates } = updateData;

      const user = await User.findByIdAndUpdate(
        userId,
        allowedUpdates,
        { new: true, runValidators: true }
      ).select('-password');

      return user;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  static async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        throw new Error('No user found with this email address');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.save();

      return resetToken;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
        isActive: true
      }).select('+passwordResetToken +passwordResetExpires');

      if (!user) {
        throw new Error('Token is invalid or has expired');
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      const user = await User.findOne({ 
        emailVerificationToken: token,
        isActive: true 
      }).select('+emailVerificationToken');

      if (!user) {
        throw new Error('Invalid verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;

      await user.save();
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(userId: string): Promise<string> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return this.generateToken(userId);
    } catch (error: any) {
      throw error;
    }
  }
}
