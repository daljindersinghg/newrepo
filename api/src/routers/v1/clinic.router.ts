// api/src/routers/v1/clinic.router.ts
import express from "express";
import { ClinicController } from "../../controllers/clinic.controller";
import { clinicAuth } from "../../middleware/clinicAuth.middleware";

const clinicRouter = express.Router();

// ============ PUBLIC ROUTES (NO AUTH) ============
// Clinic Authentication - these don't require auth
clinicRouter.post("/login", ClinicController.loginClinic);
clinicRouter.post("/logout", ClinicController.logoutClinic);

// ============ PROTECTED ROUTES (REQUIRE AUTH) ============
// Apply clinic authentication to all routes below
clinicRouter.use(clinicAuth);

// Clinic Dashboard/Profile routes
clinicRouter.get("/profile", ClinicController.getClinicProfile);
clinicRouter.put("/profile", ClinicController.updateClinicProfile);

export default clinicRouter;
