import { Patient, IPatient } from '../models';
import logger from '../config/logger.config';

export class PatientService {
  /**
   * Create a new patient
   */
  static async createPatient(patientData: Partial<IPatient>): Promise<IPatient> {
    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email: patientData.email });
    if (existingPatient) {
      throw new Error('Patient with this email already exists');
    }

    // Create new patient
    const patient = new Patient(patientData);
    await patient.save();

    logger.info(`New patient created: ${patient._id}`);
    return patient;
  }

  /**
   * Get patient by ID
   */
  static async getPatientById(id: string): Promise<IPatient | null> {
    const patient = await Patient.findById(id).select('-password');
    return patient;
  }

  /**
   * Update patient
   */
  static async updatePatient(id: string, updateData: Partial<IPatient>): Promise<IPatient | null> {
    // Remove sensitive fields that shouldn't be updated
    const sanitizedData = { ...updateData };
    delete sanitizedData.password;
    delete sanitizedData.email;

    const patient = await Patient.findByIdAndUpdate(
      id,
      sanitizedData,
      { new: true, runValidators: true }
    ).select('-password');

    if (patient) {
      logger.info(`Patient updated: ${id}`);
    }

    return patient;
  }

  /**
   * Get all patients with pagination
   */
  static async getPatients(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      Patient.find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Patient.countDocuments()
    ]);

    return {
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete patient
   */
  static async deletePatient(id: string): Promise<boolean> {
    const patient = await Patient.findByIdAndDelete(id);
    
    if (patient) {
      logger.info(`Patient deleted: ${id}`);
      return true;
    }
    
    return false;
  }

  /**
   * Find patient by email
   */
  static async getPatientByEmail(email: string): Promise<IPatient | null> {
    const patient = await Patient.findOne({ email }).select('-password');
    return patient;
  }

  /**
   * Search patients by name or email
   */
  static async searchPatients(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const searchRegex = new RegExp(query, 'i');
    const filter = {
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    };

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Patient.countDocuments(filter)
    ]);

    return {
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
