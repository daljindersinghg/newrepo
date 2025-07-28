// apps/api/src/services/doctor.service.ts
import { Doctor, IDoctor, Clinic } from '../models';
import logger from '../config/logger.config';

interface DoctorFilters {
  search?: string;
  status?: string;
  clinic?: string;
}

export class DoctorService {
  /**
   * Create a new doctor
   */
  static async createDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    try {
      // Check if doctor already exists
      const existingDoctor = await Doctor.findOne({ email: doctorData.email });
      if (existingDoctor) {
        throw new Error('Doctor with this email already exists');
      }

      // Verify clinic exists
      if (doctorData.clinic) {
        const clinic = await Clinic.findById(doctorData.clinic);
        if (!clinic) {
          throw new Error('Selected clinic does not exist');
        }
      }

      // Create doctor with only the fields we have
      const doctorToCreate = {
        name: doctorData.name,
        email: doctorData.email,
        phone: doctorData.phone,
        password: doctorData.password,
        clinic: doctorData.clinic,
        specialties: doctorData.specialties || [],
        bio: doctorData.bio,
        status: 'pending' as const,
        verified: false
      };

      // Create new doctor
      const doctor = new Doctor(doctorToCreate);
      await doctor.save();

      logger.info(`New doctor created: ${doctor._id}`);
      return doctor;
    } catch (error: any) {
      logger.error('Error creating doctor:', error);
      throw error;
    }
  }

  /**
   * Get doctor by ID
   */
  static async getDoctorById(id: string): Promise<IDoctor | null> {
    try {
      const doctor = await Doctor.findById(id)
        .select('-password')
        .populate('clinic', 'name address phone');
      return doctor;
    } catch (error: any) {
      logger.error(`Error fetching doctor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all doctors with filters and pagination
   */
  static async getDoctors(page: number = 1, limit: number = 10, filters: DoctorFilters = {}) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query
      const query: any = {};
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { specialties: { $in: [new RegExp(filters.search, 'i')] } }
        ];
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.clinic) {
        query.clinic = filters.clinic;
      }

      const [doctors, total] = await Promise.all([
        Doctor.find(query)
          .select('-password')
          .populate('clinic', 'name address phone')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Doctor.countDocuments(query)
      ]);

      return {
        doctors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      logger.error('Error fetching doctors:', error);
      throw error;
    }
  }

  /**
   * Update doctor
   */
  static async updateDoctor(id: string, updateData: Partial<IDoctor>): Promise<IDoctor | null> {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const sanitizedData = { ...updateData };
      delete sanitizedData.password;
      delete sanitizedData.email;

      const doctor = await Doctor.findByIdAndUpdate(
        id,
        sanitizedData,
        { new: true, runValidators: true }
      ).select('-password').populate('clinic', 'name address phone');

      if (doctor) {
        logger.info(`Doctor updated: ${id}`);
      }

      return doctor;
    } catch (error: any) {
      logger.error(`Error updating doctor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete doctor
   */
  static async deleteDoctor(id: string): Promise<boolean> {
    try {
      const doctor = await Doctor.findByIdAndDelete(id);
      
      if (doctor) {
        logger.info(`Doctor deleted: ${id}`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      logger.error(`Error deleting doctor ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update doctor status
   */
  static async updateDoctorStatus(id: string, status: 'active' | 'pending' | 'suspended'): Promise<IDoctor | null> {
    try {
      const doctor = await Doctor.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).select('-password').populate('clinic', 'name address phone');

      if (doctor) {
        logger.info(`Doctor status updated: ${id} -> ${status}`);
      }

      return doctor;
    } catch (error: any) {
      logger.error(`Error updating doctor status ${id}:`, error);
      throw error;
    }
  }
}