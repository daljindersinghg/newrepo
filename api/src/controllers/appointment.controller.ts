import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/appointment.service";
import logger from "../config/logger.config";

export class AppointmentController {
  static async createAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentData: any = req.body;
      const newAppointment =
        await AppointmentService.createAppointment(appointmentData);
      res.status(201).json(newAppointment);
    } catch (error) {
      logger.error("Error creating appointment:", error);
      next(error);
    }
  }

  static async getAppointmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      const appointment =
        await AppointmentService.getAppointmentById(appointmentId);
      res.status(200).json(appointment);
    } catch (error) {
      logger.error("Error fetching appointment:", error);
      next(error);
    }
  }

  static async updateAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      const updateData: any = req.body;
      const updatedAppointment = await AppointmentService.updateAppointment(
        appointmentId,
        updateData
      );
      res.status(200).json(updatedAppointment);
    } catch (error) {
      logger.error("Error updating appointment:", error);
      next(error);
    }
  }

  static async deleteAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const appointmentId = req.params.id;
      await AppointmentService.deleteAppointment(appointmentId);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting appointment:", error);
      next(error);
    }
  }
}
