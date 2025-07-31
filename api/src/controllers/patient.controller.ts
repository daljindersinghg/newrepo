// api/src/controllers/patient.controller.ts
import { Request, Response, NextFunction } from 'express';
import { IPatient } from '../models';
import { PatientService } from '../services';


export class PatientController {
  /**
   * Create a new patient (admin function)
   */
  static async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const patientData: Partial<IPatient> = req.body;
      
      const patient = await PatientService.createPatient(patientData);

      // Remove sensitive fields from response
      const patientResponse = patient.toObject();
      delete (patientResponse as any).emailOTP;
      delete (patientResponse as any).otpExpires;
      
      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patientResponse
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Patient with this email already exists') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      

      next(error);
    }
  }

  /**
   * Get patient by ID
   */
  static async getPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const patient = await PatientService.getPatientById(id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: patient
      });
    } catch (error) {

      next(error);
    }
  }

  /**
   * Update patient
   */
  static async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const patient = await PatientService.updatePatient(id, updateData);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: patient
      });
    } catch (error) {

      next(error);
    }
  }

  /**
   * Get all patients (with pagination)
   */
  static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PatientService.getPatients(page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {

      next(error);
    }
  }

  /**
   * Delete patient
   */
  static async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const deleted = await PatientService.deletePatient(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        message: 'Patient deleted successfully'
      });
    } catch (error) {

      next(error);
    }
  }

  /**
   * Search patients by name or email
   */
  static async searchPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const result = await PatientService.searchPatients(query, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {

      next(error);
    }
  }
}