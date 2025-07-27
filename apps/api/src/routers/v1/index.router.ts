import express from "express";
import pingRouter from "./ping.router";
import adminRouter from "./admin.router";
import patientRouter from "./patient.router";
const v1Router = express.Router();

v1Router.use("/ping", pingRouter);
v1Router.use("/patient", patientRouter);
v1Router.use("/admin", adminRouter);

export default v1Router;
