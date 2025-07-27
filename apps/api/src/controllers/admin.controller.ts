import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { IAdmin } from "../models";

export class AdminController {
  static async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminData: Partial<IAdmin> = req.body;
      const admin = await AdminService.createAdmin(adminData);
      res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: admin,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = await AdminService.loginAdmin(
        req.body.email,
        req.body.password
      );
      res.status(200).json({ // Changed from 201 to 200 for login
        success: true,
        message: "logged in successfully",
        token: token,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedAdmin = await AdminService.updateAdmin(id, updateData);
      if (!updatedAdmin) {
        res.status(404).json({
          success: false,
          message: "Admin not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: updatedAdmin,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = await AdminService.getAdminById(req.params.id);
      res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}