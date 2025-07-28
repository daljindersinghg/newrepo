// api/src/routers/v1/public.router.ts
import express from "express";

import { ClinicController } from "../../controllers/clinic.controller";

const publicRouter = express.Router();


publicRouter.get("/", (req, res) => {
  res.send("Welcome to the public API!");
});
// Public clinic endpoints
publicRouter.get("/clinics", ClinicController.getClinics);
publicRouter.get("/clinics/:id", ClinicController.getClinic);


export default publicRouter;