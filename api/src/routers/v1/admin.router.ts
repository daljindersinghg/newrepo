
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

// Doctor Management (Admin only)
adminRouter.post("/doctors", DoctorController.createDoctor);
adminRouter.get("/doctors", DoctorController.getDoctors);
adminRouter.get("/doctors/:id", DoctorController.getDoctor);
adminRouter.put("/doctors/:id", DoctorController.updateDoctor);
adminRouter.delete("/doctors/:id", DoctorController.deleteDoctor);

// Clinic Management (Admin only)
adminRouter.post("/clinics", ClinicController.createClinic);
adminRouter.get("/clinics", ClinicController.getClinics);
adminRouter.get("/clinics/:id", ClinicController.getClinic);
adminRouter.put("/clinics/:id", ClinicController.updateClinic);
adminRouter.delete("/clinics/:id", ClinicController.deleteClinic);

export default adminRouter;