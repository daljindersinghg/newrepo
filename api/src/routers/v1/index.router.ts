// api/src/routers/v1/index.router.ts (Updated)
import express from "express";
import pingRouter from "./ping.router";
import adminRouter from "./admin.router";
import patientRouter from "./patient.router";
import patientAuthRouter from "./patientAuth.router";
import publicRouter from "./public.router";
import clinicRouter from "./clinic.router";
import notificationRouter from "./notification.router";
import appointmentRouter from "./appointment.router"; // Add this import
import receiptRouter from "./receipt.router";

const v1Router = express.Router();

// Health check
v1Router.use("/ping", pingRouter);



// Patient authentication endpoints (passwordless OTP-based)
v1Router.use("/patients/auth", patientAuthRouter);

// Public endpoints (no authentication required)
v1Router.use("/public", publicRouter);

// Patient endpoints (would require patient authentication)
v1Router.use("/patient", patientRouter);

// Admin endpoints (requires admin authentication)
v1Router.use("/admin", adminRouter);

// Clinic endpoints (for clinic authentication and profile)
v1Router.use("/clinic", clinicRouter);

// Notification endpoints (for clinics)
v1Router.use("/notifications", notificationRouter);

// Appointment endpoints
v1Router.use("/appointments", appointmentRouter);

// Receipt endpoints (for patients)
v1Router.use("/receipts", receiptRouter);

export default v1Router;