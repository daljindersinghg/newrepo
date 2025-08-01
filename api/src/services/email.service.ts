import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import logger from '../config/logger.config';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static createTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    this.transporter = nodemailer.createTransporter(config);
    return this.transporter;
  }

  private static generateAppointmentConfirmationEmail(
    patientName: string,
    clinicName: string,
    appointmentDate: Date,
    appointmentTime: string,
    duration: number,
    appointmentType: string
  ): EmailTemplate {
    const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(new Date(`2000-01-01T${appointmentTime}`), 'h:mm a');

    return {
      subject: `Appointment Confirmed - ${clinicName}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Appointment Confirmed! ✅</h1>
              </div>
              
              <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                <p style="margin-top: 0;">Hi ${patientName},</p>
                
                <p>Great news! Your appointment with <strong>${clinicName}</strong> has been confirmed.</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #10b981;">Appointment Details</h3>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${formattedTime}</p>
                  <p><strong>Duration:</strong> ${duration} minutes</p>
                  <p><strong>Type:</strong> ${appointmentType}</p>
                  <p><strong>Clinic:</strong> ${clinicName}</p>
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Please note:</strong> Arrive 15 minutes early for check-in.</p>
                </div>
                
                <p>If you need to reschedule or cancel, please contact the clinic as soon as possible.</p>
                
                <p>See you soon!</p>
                <p>The ${clinicName} Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Appointment Confirmed - ${clinicName}

Hi ${patientName},

Great news! Your appointment with ${clinicName} has been confirmed.

Appointment Details:
- Date: ${formattedDate}
- Time: ${formattedTime}
- Duration: ${duration} minutes
- Type: ${appointmentType}
- Clinic: ${clinicName}

Please note: Arrive 15 minutes early for check-in.

If you need to reschedule or cancel, please contact the clinic as soon as possible.

See you soon!
The ${clinicName} Team
      `
    };
  }

  private static generateAlternativeTimeEmail(
    patientName: string,
    clinicName: string,
    originalDate: Date,
    originalTime: string,
    proposedDate: Date,
    proposedTime: string,
    duration: number,
    message: string
  ): EmailTemplate {
    const originalFormatted = format(originalDate, 'EEEE, MMMM d, yyyy');
    const originalTimeFormatted = format(new Date(`2000-01-01T${originalTime}`), 'h:mm a');
    const proposedFormatted = format(proposedDate, 'EEEE, MMMM d, yyyy');
    const proposedTimeFormatted = format(new Date(`2000-01-01T${proposedTime}`), 'h:mm a');

    return {
      subject: `Alternative Time Suggested - ${clinicName}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Alternative Time Suggested 🔄</h1>
              </div>
              
              <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                <p style="margin-top: 0;">Hi ${patientName},</p>
                
                <p>Thank you for your appointment request with <strong>${clinicName}</strong>.</p>
                
                <p>We're unable to accommodate your originally requested time, but we'd like to suggest an alternative that works better for our schedule.</p>
                
                <div style="display: flex; gap: 20px; margin: 20px 0;">
                  <div style="flex: 1; background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <h4 style="margin-top: 0; color: #dc2626;">Original Request</h4>
                    <p><strong>Date:</strong> ${originalFormatted}</p>
                    <p><strong>Time:</strong> ${originalTimeFormatted}</p>
                  </div>
                  
                  <div style="flex: 1; background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <h4 style="margin-top: 0; color: #16a34a;">Suggested Alternative</h4>
                    <p><strong>Date:</strong> ${proposedFormatted}</p>
                    <p><strong>Time:</strong> ${proposedTimeFormatted}</p>
                    <p><strong>Duration:</strong> ${duration} minutes</p>
                  </div>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0;">
                  <h4 style="margin-top: 0;">Message from ${clinicName}:</h4>
                  <p style="font-style: italic; margin-bottom: 0;">"${message}"</p>
                </div>
                
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>What's next?</strong> Please log into your account to accept or decline this alternative time, or suggest a different time that works for you.</p>
                </div>
                
                <p>We look forward to seeing you soon!</p>
                <p>The ${clinicName} Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Alternative Time Suggested - ${clinicName}

Hi ${patientName},

Thank you for your appointment request with ${clinicName}.

We're unable to accommodate your originally requested time, but we'd like to suggest an alternative.

Original Request:
- Date: ${originalFormatted}
- Time: ${originalTimeFormatted}

Suggested Alternative:
- Date: ${proposedFormatted}
- Time: ${proposedTimeFormatted}
- Duration: ${duration} minutes

Message from ${clinicName}: "${message}"

What's next? Please log into your account to accept or decline this alternative time, or suggest a different time that works for you.

We look forward to seeing you soon!
The ${clinicName} Team
      `
    };
  }

  private static generateDeclinedEmail(
    patientName: string,
    clinicName: string,
    originalDate: Date,
    originalTime: string,
    reason: string
  ): EmailTemplate {
    const formattedDate = format(originalDate, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(new Date(`2000-01-01T${originalTime}`), 'h:mm a');

    return {
      subject: `Appointment Request Update - ${clinicName}`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Appointment Request Update</h1>
              </div>
              
              <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
                <p style="margin-top: 0;">Hi ${patientName},</p>
                
                <p>Thank you for your interest in scheduling an appointment with <strong>${clinicName}</strong>.</p>
                
                <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #dc2626;">Requested Appointment</h4>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${formattedTime}</p>
                </div>
                
                <p>Unfortunately, we're unable to accommodate your requested appointment time.</p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0;">
                  <h4 style="margin-top: 0;">Message from ${clinicName}:</h4>
                  <p style="font-style: italic; margin-bottom: 0;">"${reason}"</p>
                </div>
                
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Don't give up!</strong> Please feel free to submit a new appointment request with different dates and times that work for you. We're here to help find a time that works for both of us.</p>
                </div>
                
                <p>Thank you for your understanding.</p>
                <p>The ${clinicName} Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Appointment Request Update - ${clinicName}

Hi ${patientName},

Thank you for your interest in scheduling an appointment with ${clinicName}.

Requested Appointment:
- Date: ${formattedDate}
- Time: ${formattedTime}

Unfortunately, we're unable to accommodate your requested appointment time.

Message from ${clinicName}: "${reason}"

Don't give up! Please feel free to submit a new appointment request with different dates and times that work for you. We're here to help find a time that works for both of us.

Thank you for your understanding.
The ${clinicName} Team
      `
    };
  }

  static async sendAppointmentConfirmation(
    patientEmail: string,
    patientName: string,
    clinicName: string,
    appointmentDate: Date,
    appointmentTime: string,
    duration: number,
    appointmentType: string
  ): Promise<void> {
    try {
      const transporter = this.createTransporter();
      const template = this.generateAppointmentConfirmationEmail(
        patientName,
        clinicName,
        appointmentDate,
        appointmentTime,
        duration,
        appointmentType
      );

      const mailOptions = {
        from: `"${clinicName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Appointment confirmation email sent to ${patientEmail}`);
    } catch (error) {
      logger.error('Error sending appointment confirmation email:', error);
      throw error;
    }
  }

  static async sendAlternativeTime(
    patientEmail: string,
    patientName: string,
    clinicName: string,
    originalDate: Date,
    originalTime: string,
    proposedDate: Date,
    proposedTime: string,
    duration: number,
    message: string
  ): Promise<void> {
    try {
      const transporter = this.createTransporter();
      const template = this.generateAlternativeTimeEmail(
        patientName,
        clinicName,
        originalDate,
        originalTime,
        proposedDate,
        proposedTime,
        duration,
        message
      );

      const mailOptions = {
        from: `"${clinicName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Alternative time email sent to ${patientEmail}`);
    } catch (error) {
      logger.error('Error sending alternative time email:', error);
      throw error;
    }
  }

  static async sendAppointmentDeclined(
    patientEmail: string,
    patientName: string,
    clinicName: string,
    originalDate: Date,
    originalTime: string,
    reason: string
  ): Promise<void> {
    try {
      const transporter = this.createTransporter();
      const template = this.generateDeclinedEmail(
        patientName,
        clinicName,
        originalDate,
        originalTime,
        reason
      );

      const mailOptions = {
        from: `"${clinicName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Appointment declined email sent to ${patientEmail}`);
    } catch (error) {
      logger.error('Error sending appointment declined email:', error);
      throw error;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const transporter = this.createTransporter();
      await transporter.verify();
      logger.info('Email service connection verified successfully');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}