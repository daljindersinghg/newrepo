// api/src/routers/v1/admin.router.ts
import express from "express";
import { AdminController } from "../../controllers/admin.controller";
import { ClinicController } from "../../controllers/clinic.controller";
import { AnalyticsController } from "../../controllers/analytics.controller";


const adminRouter = express.Router();

// ============ PUBLIC ROUTES (NO AUTH) ============
// Admin Authentication - these don't require auth
adminRouter.post("/", AdminController.createAdmin);
adminRouter.post("/login", AdminController.loginAdmin);
adminRouter.post("/logout", AdminController.logoutAdmin);

// ============ PROTECTED ROUTES (REQUIRE AUTH) ============
// Apply admin authentication to all routes below
// adminRouter.use(adminAuth);

// Clinic Management - SPECIFIC routes first
adminRouter.get("/clinics", ClinicController.getClinics);
adminRouter.post("/clinics", ClinicController.createClinic);

// Google Places endpoints (most specific first)
adminRouter.post("/clinics/google-places", ClinicController.createClinicFromGooglePlace);
adminRouter.get("/google-places/search", ClinicController.searchGooglePlaces);
adminRouter.post("/clinics/bulk-sync", ClinicController.bulkSyncClinics);

// Clinic routes with parameters
adminRouter.put("/clinics/:id", ClinicController.updateClinic);
adminRouter.put("/clinics/:id/toggle-active", ClinicController.toggleClinicActiveStatus);
adminRouter.delete("/clinics/:id", ClinicController.deleteClinic);
adminRouter.post("/clinics/:id/sync-google", ClinicController.syncClinicWithGoogle);

// Phase 2: Setup authentication for specific clinic
adminRouter.post("/clinics/:id/setup-auth", ClinicController.setupClinicAuth);
adminRouter.put("/clinics/:id/update-auth", ClinicController.updateClinicAuth);

// Analytics endpoints
adminRouter.get("/analytics/dashboard", AnalyticsController.getDashboardData);
adminRouter.get("/analytics/patient-events", AnalyticsController.getPatientEvents);
adminRouter.get("/analytics/patient-journey", AnalyticsController.getPatientJourney);
adminRouter.get("/analytics/patient-dropoffs", AnalyticsController.getPatientDropoffs);
adminRouter.post("/analytics/patient-cohort", AnalyticsController.getPatientCohort);

// ============ PARAMETERIZED ROUTES LAST ============
// These MUST come AFTER all specific routes

// Admin parameterized routes (LAST!)
adminRouter.get("/:id", AdminController.getAdmin);
adminRouter.put("/:id", AdminController.updateAdmin);

export default adminRouter;