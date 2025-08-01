import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import logger from '../config/logger.config';

export class NotificationController {
  /**
   * Get notifications for authenticated clinic
   */
  static async getClinicNotifications(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const clinicId = req.clinic._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const notifications = await NotificationService.getNotifications(
        clinicId, 
        'clinic', 
        page, 
        limit, 
        unreadOnly
      );

      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      logger.error('Error fetching clinic notifications:', error);
      next(error);
    }
  }

  /**
   * Get unread notification count for clinic
   */
  static async getUnreadCount(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const clinicId = req.clinic._id;
      const count = await NotificationService.getUnreadCount(clinicId, 'clinic');

      res.status(200).json({
        success: true,
        unreadCount: count
      });
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      next(error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;
      const clinicId = req.clinic._id;

      const notification = await NotificationService.markAsRead(notificationId, clinicId);

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      next(error);
    }
  }

  /**
   * Mark all notifications as read for clinic
   */
  static async markAllAsRead(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const clinicId = req.clinic._id;
      const result = await NotificationService.markAllAsRead(clinicId, 'clinic');

      res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read`
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      next(error);
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { notificationId } = req.params;
      const clinicId = req.clinic._id;

      const deleted = await NotificationService.deleteNotification(notificationId, clinicId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      next(error);
    }
  }

  /**
   * Check email service status
   */
  static async checkEmailStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
      let connectionWorking = false;

      if (configured) {
        connectionWorking = await EmailService.testConnection();
      }

      res.status(200).json({
        success: true,
        emailService: {
          configured,
          connectionWorking,
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          user: configured ? process.env.SMTP_USER : 'Not configured'
        }
      });
    } catch (error) {
      logger.error('Error checking email status:', error);
      next(error);
    }
  }
}