import express from 'express';
import { NotificationController } from '../../controllers/notification.controller';
import { clinicAuth } from '../../middleware/clinicAuth.middleware';

const notificationRouter = express.Router();

// All notification routes require clinic authentication
notificationRouter.use(clinicAuth);

// Get notifications for authenticated clinic
notificationRouter.get('/', NotificationController.getClinicNotifications);

// Get unread notification count
notificationRouter.get('/unread-count', NotificationController.getUnreadCount);

// Mark notification as read
notificationRouter.patch('/:notificationId/read', NotificationController.markAsRead);

// Mark all notifications as read
notificationRouter.patch('/mark-all-read', NotificationController.markAllAsRead);

// Delete notification
notificationRouter.delete('/:notificationId', NotificationController.deleteNotification);

export default notificationRouter;