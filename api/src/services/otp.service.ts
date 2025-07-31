// api/src/services/otp.service.ts
import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface EmailOTPOptions {
  email: string;
  otp: string;
  patientName: string;
  type: 'signup' | 'login' | 'verification';
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class OTPService {
  private static transporter: nodemailer.Transporter;

  /**
   * Initialize email transporter
   */
  private static initializeTransporter() {
    if (!this.transporter) {
      // Configure based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email configuration (e.g., SendGrid, AWS SES, etc.)
        this.transporter = nodemailer.createTransport({
          service: 'gmail', // or your preferred service
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      } else {
        // Development configuration (e.g., Mailtrap, Ethereal)
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
            pass: process.env.SMTP_PASS || 'ethereal.pass',
          },
        });
      }
    }
  }

  /**
   * Generate a 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Hash OTP for secure storage
   */
  static hashOTP(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Verify OTP against hash
   */
  static verifyOTP(otp: string, hashedOTP: string): boolean {
    const otpHash = this.hashOTP(otp);
    return otpHash === hashedOTP;
  }

  /**
   * Send OTP via email
   */
  static async sendEmailOTP(options: EmailOTPOptions): Promise<boolean> {
    try {
      this.initializeTransporter();

      const { email, otp, patientName, type } = options;

      // Generate email content based on type
      const emailContent = this.generateEmailContent(otp, patientName, type);

      const mailOptions: SendEmailOptions = {
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      };

      const result = await this.sendEmail(mailOptions);
      
      // Log for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📧 OTP Email sent to ${email}: ${otp}`);
        console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(result)}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return false;
    }
  }

  /**
   * Send email using transporter
   */
  private static async sendEmail(options: SendEmailOptions): Promise<any> {
    this.initializeTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Dental Care'}" <${process.env.EMAIL_FROM || 'noreply@dentalcare.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Generate email content based on OTP type
   */
  private static generateEmailContent(
    otp: string, 
    patientName: string, 
    type: 'signup' | 'login' | 'verification'
  ): { subject: string; html: string; text: string } {
    const appName = process.env.APP_NAME || 'Dental Care Platform';
    
    switch (type) {
      case 'signup':
        return {
          subject: `Welcome to ${appName} - Verify Your Email`,
          html: this.getSignupEmailHTML(otp, patientName, appName),
          text: this.getSignupEmailText(otp, patientName, appName),
        };
      
      case 'login':
        return {
          subject: `${appName} - Your Login Code`,
          html: this.getLoginEmailHTML(otp, patientName, appName),
          text: this.getLoginEmailText(otp, patientName, appName),
        };
      
      case 'verification':
        return {
          subject: `${appName} - Verify Your Email`,
          html: this.getVerificationEmailHTML(otp, patientName, appName),
          text: this.getVerificationEmailText(otp, patientName, appName),
        };
      
      default:
        return {
          subject: `${appName} - Your Verification Code`,
          html: this.getDefaultEmailHTML(otp, patientName, appName),
          text: this.getDefaultEmailText(otp, patientName, appName),
        };
    }
  }

  /**
   * Signup email HTML template
   */
  private static getSignupEmailHTML(otp: string, patientName: string, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${appName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${appName}!</h1>
          </div>
          <div class="content">
            <h2>Hi ${patientName},</h2>
            <p>Thank you for signing up! To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 16px;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>Don't share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <p>Once verified, you'll be able to book appointments and access all our dental care services.</p>
            
            <p>Best regards,<br>The ${appName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please don't reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Signup email text template
   */
  private static getSignupEmailText(otp: string, patientName: string, appName: string): string {
    return `
Welcome to ${appName}!

Hi ${patientName},

Thank you for signing up! To complete your registration, please verify your email address using the code below:

Your verification code: ${otp}

Important:
- This code will expire in 10 minutes
- Don't share this code with anyone
- If you didn't request this, please ignore this email

Once verified, you'll be able to book appointments and access all our dental care services.

Best regards,
The ${appName} Team

---
This is an automated message. Please don't reply to this email.
    `.trim();
  }

  /**
   * Login email HTML template
   */
  private static getLoginEmailHTML(otp: string, patientName: string, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${appName} - Login Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 4px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Login to ${appName}</h1>
          </div>
          <div class="content">
            <h2>Hi ${patientName},</h2>
            <p>You requested to log in to your account. Please use the code below to complete your login:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 16px;">Your login code is:</p>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you didn't request this login, please ignore this email</li>
            </ul>
            
            <p>Best regards,<br>The ${appName} Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please don't reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Login email text template
   */
  private static getLoginEmailText(otp: string, patientName: string, appName: string): string {
    return `
Login to ${appName}

Hi ${patientName},

You requested to log in to your account. Please use the code below to complete your login:

Your login code: ${otp}

Security Notice:
- This code will expire in 10 minutes
- Never share this code with anyone
- If you didn't request this login, please ignore this email

Best regards,
The ${appName} Team

---
This is an automated message. Please don't reply to this email.
    `.trim();
  }

  /**
   * Verification email HTML template
   */
  private static getVerificationEmailHTML(otp: string, patientName: string, appName: string): string {
    return this.getSignupEmailHTML(otp, patientName, appName);
  }

  /**
   * Verification email text template
   */
  private static getVerificationEmailText(otp: string, patientName: string, appName: string): string {
    return this.getSignupEmailText(otp, patientName, appName);
  }

  /**
   * Default email HTML template
   */
  private static getDefaultEmailHTML(otp: string, patientName: string, appName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${appName} - Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp-code { font-size: 24px; font-weight: bold; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Hi ${patientName},</h2>
          <p>Your verification code is: <span class="otp-code">${otp}</span></p>
          <p>This code will expire in 10 minutes.</p>
          <p>Best regards,<br>The ${appName} Team</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Default email text template
   */
  private static getDefaultEmailText(otp: string, patientName: string, appName: string): string {
    return `
Hi ${patientName},

Your verification code is: ${otp}

This code will expire in 10 minutes.

Best regards,
The ${appName} Team
    `.trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate OTP format (6 digits)
   */
  static isValidOTPFormat(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }
}
