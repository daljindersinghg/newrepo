// api/src/routers/v1/admin.router.ts
import express from "express";
import { AdminController } from "../../controllers/admin.controller";
import { DoctorController } from "../../controllers/doctor.controller";
import { ClinicController } from "../../controllers/clinic.controller";

const adminRouter = express.Router();

// ============ SPECIFIC ROUTES FIRST ============
// These MUST come before any /:id routes

// Admin Authentication
adminRouter.post("/", AdminController.createAdmin);
adminRouter.post("/login", AdminController.loginAdmin);

// Clinic Management - SPECIFIC routes first
adminRouter.get("/clinics", ClinicController.getClinics);
adminRouter.post("/clinics", ClinicController.createClinic);

// Google Places endpoints (most specific first)
adminRouter.post("/clinics/google-places", ClinicController.createClinicFromGooglePlace);
adminRouter.get("/google-places/search", ClinicController.searchGooglePlaces);
adminRouter.post("/clinics/bulk-sync", ClinicController.bulkSyncClinics);

// Clinic routes with parameters
adminRouter.get("/clinics/:id", ClinicController.getClinic);
adminRouter.put("/clinics/:id", ClinicController.updateClinic);
adminRouter.delete("/clinics/:id", ClinicController.deleteClinic);
adminRouter.post("/clinics/:id/sync-google", ClinicController.syncClinicWithGoogle);

// Doctor Management
adminRouter.get("/doctors", DoctorController.getDoctors);
adminRouter.post("/doctors", DoctorController.createDoctor);
adminRouter.get("/doctors/:id", DoctorController.getDoctor);
adminRouter.put("/doctors/:id", DoctorController.updateDoctor);
adminRouter.delete("/doctors/:id", DoctorController.deleteDoctor);

// Clinic-Doctor relationship
adminRouter.get("/clinics/:clinicId/doctors", DoctorController.getDoctorsByClinic);

// ============ PARAMETERIZED ROUTES LAST ============
// These MUST come AFTER all specific routes

// Admin parameterized routes (LAST!)
adminRouter.get("/:id", AdminController.getAdmin);
adminRouter.put("/:id", AdminController.updateAdmin);

export default adminRouter;