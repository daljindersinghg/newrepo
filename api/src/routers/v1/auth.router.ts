// api/src/routers/v1/auth.router.ts
import express from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const authRouter = express.Router();

// Public routes
authRouter.post('/signup', AuthController.signup);
authRouter.post('/login', AuthController.login);
authRouter.post('/forgot-password', AuthController.requestPasswordReset);
authRouter.post('/reset-password', AuthController.resetPassword);
authRouter.get('/verify-email/:token', AuthController.verifyEmail);

// Protected routes (require authentication)
authRouter.use(authenticate); // Apply auth middleware to all routes below

authRouter.get('/profile', AuthController.getProfile);
authRouter.put('/profile', AuthController.updateProfile);
authRouter.post('/change-password', AuthController.changePassword);
authRouter.post('/refresh-token', AuthController.refreshToken);
authRouter.post('/logout', AuthController.logout);

export default authRouter;
