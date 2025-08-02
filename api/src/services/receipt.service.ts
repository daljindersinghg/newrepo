import Receipt, { IReceipt } from '../models/receipt.model';
import logger from '../config/logger.config';
import { v2 as cloudinary } from 'cloudinary';

interface CreateReceiptData {
  patient: string;
  fileName: string;
  originalFileName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  type: 'treatment' | 'consultation' | 'prescription' | 'other';
  description?: string;
  fileSize: number;
  mimeType: string;
  metadata?: {
    appointmentId?: string;
    clinicId?: string;
    amount?: number;
    currency?: string;
    receiptDate?: Date;
  };
}

interface ReceiptFilters {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  appointmentId?: string;
  clinicId?: string;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class ReceiptService {
  
  /**
   * Create a new receipt record
   */
  static async createReceipt(receiptData: CreateReceiptData): Promise<IReceipt> {
    try {
      // Validate required fields
      if (!receiptData.patient || !receiptData.cloudinaryUrl || !receiptData.cloudinaryPublicId) {
        throw new Error('Patient, Cloudinary URL, and Public ID are required');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(receiptData.mimeType)) {
        throw new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed');
      }

      // Validate file size (5MB limit)
      if (receiptData.fileSize > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      const receipt = new Receipt(receiptData);
      await receipt.save();

      logger.info(`Receipt created successfully: ${receipt._id} for patient: ${receiptData.patient}`);
      return receipt;
    } catch (error: any) {
      logger.error('Error creating receipt:', error);
      throw error;
    }
  }

  /**
   * Get receipts for a patient with pagination and filters
   */
  static async getPatientReceipts(
    patientId: string,
    page: number = 1,
    limit: number = 20,
    filters: ReceiptFilters = {}
  ): Promise<PaginationResult<IReceipt>> {
    try {
      const skip = (page - 1) * limit;
      const query: any = { patient: patientId, isActive: true };

      // Apply filters
      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.startDate || filters.endDate) {
        query.uploadDate = {};
        if (filters.startDate) query.uploadDate.$gte = filters.startDate;
        if (filters.endDate) query.uploadDate.$lte = filters.endDate;
      }

      if (filters.appointmentId) {
        query['metadata.appointmentId'] = filters.appointmentId;
      }

      if (filters.clinicId) {
        query['metadata.clinicId'] = filters.clinicId;
      }

      const [receipts, total] = await Promise.all([
        Receipt.find(query)
          .populate('metadata.appointmentId', 'appointmentDate type status')
          .populate('metadata.clinicId', 'name address')
          .sort({ uploadDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Receipt.countDocuments(query)
      ]);

      return {
        data: receipts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      logger.error('Error fetching patient receipts:', error);
      throw error;
    }
  }

  /**
   * Get a specific receipt by ID
   */
  static async getReceiptById(receiptId: string, patientId?: string): Promise<IReceipt | null> {
    try {
      const query: any = { _id: receiptId, isActive: true };
      if (patientId) {
        query.patient = patientId;
      }

      const receipt = await Receipt.findOne(query)
        .populate('patient', 'name email')
        .populate('metadata.appointmentId', 'appointmentDate type status')
        .populate('metadata.clinicId', 'name address')
        .lean();

      return receipt;
    } catch (error: any) {
      logger.error('Error fetching receipt by ID:', error);
      throw error;
    }
  }

  /**
   * Update receipt information
   */
  static async updateReceipt(
    receiptId: string,
    patientId: string,
    updateData: Partial<Pick<IReceipt, 'type' | 'description' | 'metadata'>>
  ): Promise<IReceipt | null> {
    try {
      const receipt = await Receipt.findOneAndUpdate(
        { _id: receiptId, patient: patientId, isActive: true },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!receipt) {
        throw new Error('Receipt not found or access denied');
      }

      logger.info(`Receipt updated: ${receiptId} by patient: ${patientId}`);
      return receipt;
    } catch (error: any) {
      logger.error('Error updating receipt:', error);
      throw error;
    }
  }

  /**
   * Soft delete a receipt
   */
  static async deleteReceipt(receiptId: string, patientId: string): Promise<boolean> {
    try {
      const receipt = await Receipt.findOne({ _id: receiptId, patient: patientId, isActive: true });
      
      if (!receipt) {
        throw new Error('Receipt not found or access denied');
      }

      // Soft delete the receipt
      receipt.isActive = false;
      await receipt.save();

      // Optionally delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(receipt.cloudinaryPublicId);
        logger.info(`Cloudinary image deleted: ${receipt.cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        logger.warn(`Failed to delete from Cloudinary: ${receipt.cloudinaryPublicId}`, cloudinaryError);
        // Don't throw error - receipt is still marked as deleted
      }

      logger.info(`Receipt deleted: ${receiptId} by patient: ${patientId}`);
      return true;
    } catch (error: any) {
      logger.error('Error deleting receipt:', error);
      throw error;
    }
  }

  /**
   * Get receipt statistics for a patient
   */
  static async getPatientReceiptStats(patientId: string): Promise<any> {
    try {
      const stats = await Receipt.aggregate([
        { $match: { patient: patientId, isActive: true } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
            latestUpload: { $max: '$uploadDate' }
          }
        },
        {
          $group: {
            _id: null,
            byType: {
              $push: {
                type: '$_id',
                count: '$count',
                totalSize: '$totalSize',
                latestUpload: '$latestUpload'
              }
            },
            totalReceipts: { $sum: '$count' },
            totalStorage: { $sum: '$totalSize' }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalReceipts: 0,
          totalStorage: 0,
          byType: []
        };
      }

      return {
        totalReceipts: stats[0].totalReceipts,
        totalStorage: stats[0].totalStorage,
        byType: stats[0].byType
      };
    } catch (error: any) {
      logger.error('Error fetching receipt stats:', error);
      throw error;
    }
  }

  /**
   * Get receipts by type
   */
  static async getReceiptsByType(
    patientId: string,
    type: 'treatment' | 'consultation' | 'prescription' | 'other'
  ): Promise<IReceipt[]> {
    try {
      const receipts = await Receipt.find({
        patient: patientId,
        type,
        isActive: true
      })
        .populate('metadata.appointmentId', 'appointmentDate type')
        .populate('metadata.clinicId', 'name')
        .sort({ uploadDate: -1 })
        .lean();

      return receipts;
    } catch (error: any) {
      logger.error('Error fetching receipts by type:', error);
      throw error;
    }
  }

  /**
   * Search receipts by description or filename
   */
  static async searchReceipts(
    patientId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginationResult<IReceipt>> {
    try {
      const skip = (page - 1) * limit;
      const searchRegex = new RegExp(searchTerm, 'i');
      
      const query = {
        patient: patientId,
        isActive: true,
        $or: [
          { originalFileName: searchRegex },
          { description: searchRegex },
          { fileName: searchRegex }
        ]
      };

      const [receipts, total] = await Promise.all([
        Receipt.find(query)
          .populate('metadata.appointmentId', 'appointmentDate type')
          .populate('metadata.clinicId', 'name')
          .sort({ uploadDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Receipt.countDocuments(query)
      ]);

      return {
        data: receipts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      logger.error('Error searching receipts:', error);
      throw error;
    }
  }

  /**
   * Get recent receipts for a patient
   */
  static async getRecentReceipts(patientId: string, limit: number = 5): Promise<IReceipt[]> {
    try {
      const receipts = await Receipt.find({
        patient: patientId,
        isActive: true
      })
        .populate('metadata.clinicId', 'name')
        .sort({ uploadDate: -1 })
        .limit(limit)
        .lean();

      return receipts;
    } catch (error: any) {
      logger.error('Error fetching recent receipts:', error);
      throw error;
    }
  }
}