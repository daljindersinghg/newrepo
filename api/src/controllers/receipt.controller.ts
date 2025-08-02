import { Request, Response, NextFunction } from 'express';
import { ReceiptService } from '../services/receipt.service';
import logger from '../config/logger.config';

export class ReceiptController {
  
  /**
   * Create a new receipt
   */
  static async createReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        fileName,
        originalFileName,
        cloudinaryUrl,
        cloudinaryPublicId,
        type,
        description,
        fileSize,
        mimeType,
        metadata
      } = req.body;

      // Get patient ID from authenticated user
      const patientId = req.user?.id || req.body.patientId;
      
      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const receiptData = {
        patient: patientId,
        fileName,
        originalFileName,
        cloudinaryUrl,
        cloudinaryPublicId,
        type,
        description,
        fileSize,
        mimeType,
        metadata
      };

      const receipt = await ReceiptService.createReceipt(receiptData);

      res.status(201).json({
        success: true,
        message: 'Receipt uploaded successfully',
        data: receipt
      });
    } catch (error: any) {
      logger.error('Error in createReceipt controller:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload receipt'
      });
    }
  }

  /**
   * Get patient's receipts with pagination and filters
   */
  static async getPatientReceipts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.id || req.params.patientId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters: any = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.appointmentId) filters.appointmentId = req.query.appointmentId;
      if (req.query.clinicId) filters.clinicId = req.query.clinicId;

      const result = await ReceiptService.getPatientReceipts(patientId, page, limit, filters);

      res.status(200).json({
        success: true,
        message: 'Receipts retrieved successfully',
        data: result
      });
    } catch (error: any) {
      logger.error('Error in getPatientReceipts controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve receipts'
      });
    }
  }

  /**
   * Get a specific receipt by ID
   */
  static async getReceiptById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { receiptId } = req.params;
      const patientId = req.user?.id;

      const receipt = await ReceiptService.getReceiptById(receiptId, patientId);

      if (!receipt) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Receipt retrieved successfully',
        data: receipt
      });
    } catch (error: any) {
      logger.error('Error in getReceiptById controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve receipt'
      });
    }
  }

  /**
   * Update receipt information
   */
  static async updateReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { receiptId } = req.params;
      const patientId = req.user?.id;
      const { type, description, metadata } = req.body;

      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const updateData: any = {};
      if (type) updateData.type = type;
      if (description !== undefined) updateData.description = description;
      if (metadata) updateData.metadata = metadata;

      const receipt = await ReceiptService.updateReceipt(receiptId, patientId, updateData);

      if (!receipt) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found or access denied'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Receipt updated successfully',
        data: receipt
      });
    } catch (error: any) {
      logger.error('Error in updateReceipt controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update receipt'
      });
    }
  }

  /**
   * Delete a receipt
   */
  static async deleteReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { receiptId } = req.params;
      const patientId = req.user?.id;

      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const success = await ReceiptService.deleteReceipt(receiptId, patientId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found or access denied'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Receipt deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error in deleteReceipt controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete receipt'
      });
    }
  }

  /**
   * Get receipt statistics for a patient
   */
  static async getReceiptStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.id || req.params.patientId;

      const stats = await ReceiptService.getPatientReceiptStats(patientId);

      res.status(200).json({
        success: true,
        message: 'Receipt statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      logger.error('Error in getReceiptStats controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve receipt statistics'
      });
    }
  }

  /**
   * Get receipts by type
   */
  static async getReceiptsByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.id;
      const { type } = req.params;

      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const validTypes = ['treatment', 'consultation', 'prescription', 'other'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid receipt type'
        });
        return;
      }

      const receipts = await ReceiptService.getReceiptsByType(patientId, type as any);

      res.status(200).json({
        success: true,
        message: `${type} receipts retrieved successfully`,
        data: receipts
      });
    } catch (error: any) {
      logger.error('Error in getReceiptsByType controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve receipts by type'
      });
    }
  }

  /**
   * Search receipts
   */
  static async searchReceipts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.id;
      const { q: searchTerm } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
        return;
      }

      const result = await ReceiptService.searchReceipts(patientId, searchTerm, page, limit);

      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: result
      });
    } catch (error: any) {
      logger.error('Error in searchReceipts controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search receipts'
      });
    }
  }

  /**
   * Get recent receipts
   */
  static async getRecentReceipts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 5;

      if (!patientId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const receipts = await ReceiptService.getRecentReceipts(patientId, limit);

      res.status(200).json({
        success: true,
        message: 'Recent receipts retrieved successfully',
        data: receipts
      });
    } catch (error: any) {
      logger.error('Error in getRecentReceipts controller:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve recent receipts'
      });
    }
  }
}