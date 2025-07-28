// api/src/routers/v1/admin.router.ts (Enhanced)
import express from "express";
import { AdminController } from "../../controllers/admin.controller";
import { DoctorController } from "../../controllers/doctor.controller";
import { ClinicController } from "../../controllers/clinic.controller";

const adminRouter = express.Router();

// Admin Authentication
adminRouter.post("/", AdminController.createAdmin);
adminRouter.post("/login", AdminController.loginAdmin);
adminRouter.get("/:id", AdminController.getAdmin);
adminRouter.put("/:id", AdminController.updateAdmin);

// Clinic Management (EXISTING + NEW Google Places endpoints)
adminRouter.post("/clinics", ClinicController.createClinic);
adminRouter.get("/clinics", ClinicController.getClinics);
// adminRouter.get("/clinics/:id", ClinicController.getClinic);
adminRouter.put("/clinics/:id", ClinicController.updateClinic);
adminRouter.delete("/clinics/:id", ClinicController.deleteClinic);

// NEW Google Places endpoints
adminRouter.post("/clinics/google-places", ClinicController.createClinicFromGooglePlace);
adminRouter.get("/google-places/search", ClinicController.searchGooglePlaces);
adminRouter.post("/clinics/:id/sync-google", ClinicController.syncClinicWithGoogle);
adminRouter.post("/clinics/bulk-sync", ClinicController.bulkSyncClinics);

// Doctor Management (if you want to keep this)
adminRouter.post("/doctors", DoctorController.createDoctor);
adminRouter.get("/doctors", DoctorController.getDoctors);
adminRouter.get("/doctors/:id", DoctorController.getDoctor);
adminRouter.put("/doctors/:id", DoctorController.updateDoctor);
adminRouter.delete("/doctors/:id", DoctorController.deleteDoctor);
adminRouter.get("/clinics/:clinicId/doctors", DoctorController.getDoctorsByClinic);

export default adminRouter;