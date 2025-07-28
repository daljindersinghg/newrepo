// api/src/routers/v1/public.router.ts
import express from "express";
import { DoctorController } from "../../controllers/doctor.controller";
import { ClinicController } from "../../controllers/clinic.controller";

const publicRouter = express.Router();

// Public doctor search endpoints
publicRouter.get("/doctors", DoctorController.getAvailableDoctors);
publicRouter.get("/doctors/:id", DoctorController.getDoctor);

// Public clinic endpoints
publicRouter.get("/clinics", ClinicController.getClinics);
publicRouter.get("/clinics/:id", ClinicController.getClinic);
publicRouter.get("/clinics/:clinicId/doctors", DoctorController.getDoctorsByClinic);

export default publicRouter;