// api/src/routers/v1/index.router.ts (Updated)
import express from "express";
import pingRouter from "./ping.router";
import adminRouter from "./admin.router";
import patientRouter from "./patient.router";
import patientAuthRouter from "./patientAuth.router";
import publicRouter from "./public.router";
import authRouter from "./auth.router";
import appointmentRouter from "./appointment.router"; // Add this import

const v1Router = express.Router();

// Health check
v1Router.use("/ping", pingRouter);

// Authentication endpoints
v1Router.use("/auth", authRouter);

// Patient authentication endpoints (passwordless OTP-based)
v1Router.use("/patients/auth", patientAuthRouter);

// Public endpoints (no authentication required)
v1Router.use("/public", publicRouter);

// Patient endpoints (would require patient authentication)
v1Router.use("/patient", patientRouter);

// Admin endpoints (requires admin authentication)
v1Router.use("/admin", adminRouter);

// Appointment and availability endpoints
v1Router.use("/appointments", appointmentRouter);

// You could also add these as direct routes for better organization:
// v1Router.use("/availability", appointmentRouter); // For availability-specific routes
// v1Router.use("/clinics", appointmentRouter); // For clinic-specific routes

export default v1Router;