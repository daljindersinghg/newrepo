import express from "express";
import pingRouter from "./ping.router";
import adminRouter from "./admin.router";
import patientRouter from "./patient.router";
import publicRouter from "./public.router";
const v1Router = express.Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/patient", patientRouter);
v1Router.use("/admin", adminRouter);
v1Router.use("/public", publicRouter);

export default v1Router;
