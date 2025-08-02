import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { PatientService } from "../services/user.service";
import { IAdmin } from "../models";

export class AdminController {
  static async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, roles = ['staff'] } = req.body;
      
      // Quick validation
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: "Name, email and password are required"
        });
        return;
      }

      const adminData: Partial<IAdmin> = { name, email, password, roles };
      const admin = await AdminService.createAdmin(adminData);
      
      res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          roles: admin.roles
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
        return;
      }

      const { token, admin } = await AdminService.loginAdmin(email, password);
      
      // Set HTTP-only cookie for security
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          admin: admin,
          token: token
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async logoutAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear the cookie
      res.clearCookie('adminToken');
      
      res.status(200).json({
        success: true,
        message: "Logged out successfully"
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

  // Patient Management Methods
  static async getAllPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const signupStep = req.query.signupStep as string;

      const result = await PatientService.getAllPatients(page, limit, search, signupStep);
      
      res.status(200).json({
        success: true,
        message: "Patients retrieved successfully",
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPatientById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId } = req.params;
      const patient = await PatientService.getPatientById(patientId);
      
      if (!patient) {
        res.status(404).json({
          success: false,
          message: "Patient not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Patient retrieved successfully",
        data: patient
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updatePatientStep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { patientId } = req.params;
      const { signupStep } = req.body;
      
      if (![1, 2, 'completed'].includes(signupStep)) {
        res.status(400).json({
          success: false,
          message: "signupStep must be 1, 2, or 'completed'"
        });
        return;
      }

      const patient = await PatientService.updatePatientStep(patientId, signupStep);
      
      if (!patient) {
        res.status(404).json({
          success: false,
          message: "Patient not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Patient signup step updated to ${signupStep} successfully`,
        data: patient
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPatientStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await PatientService.getPatientStats();
      
      res.status(200).json({
        success: true,
        message: "Patient statistics retrieved successfully",
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}