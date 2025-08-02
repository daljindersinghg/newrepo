import Patient, { IPatient } from '../models/Patient';
import { Appointment } from '../models/Appointment';

export class PatientService {
  /**
   * Get all patients with pagination and search
   */
  static async getAllPatients(
    page: number = 1,
    limit: number = 10,
    search?: string,
    signupStep?: string
  ): Promise<{
    patients: IPatient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (signupStep && signupStep !== 'all') {
      query.signupStep = signupStep;
    }
    
    // Get patients without sensitive data
    const patients = await Patient.find(query)
      .select('-emailOTP -otpExpires -otpAttempts')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Patient.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    return {
      patients: patients as IPatient[],
      total,
      page,
      limit,
      totalPages
    };
  }
  
  /**
   * Get patient by ID
   */
  static async getPatientById(id: string): Promise<IPatient | null> {
    return Patient.findById(id)
      .select('-emailOTP -otpExpires -otpAttempts')
      .lean();
  }
  
  /**
   * Update patient signup step
   */
  static async updatePatientStep(id: string, signupStep: 1 | 2 | 'completed'): Promise<IPatient | null> {
    return Patient.findByIdAndUpdate(
      id,
      { signupStep, updatedAt: new Date() },
      { new: true }
    ).select('-emailOTP -otpExpires -otpAttempts');
  }
  
  /**
   * Get patient stats
   */
  static async getPatientStats(): Promise<{
    total: number;
    completed: number;
    step1: number;
    step2: number;
    verified: number;
    unverified: number;
    recentSignups: number;
    withBookings: number;
  }> {
    const [
      total,
      completed,
      step1,
      step2,
      verified,
      recentSignups,
      withBookings
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ signupStep: 'completed' }),
      Patient.countDocuments({ signupStep: 1 }),
      Patient.countDocuments({ signupStep: 2 }),
      Patient.countDocuments({ isEmailVerified: true }),
      Patient.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Appointment.distinct('patient').then(patients => patients.length)
    ]);
    
    return {
      total,
      completed,
      step1,
      step2,
      verified,
      unverified: total - verified,
      recentSignups,
      withBookings
    };
  }
}