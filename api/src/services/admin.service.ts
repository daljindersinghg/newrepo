import { IAdmin, Admin } from "../models";
import logger from "../config/logger.config";

export class AdminService {
  static async createAdmin(adminData: Partial<IAdmin>) {
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      throw new Error("admin already exists");
    }
    const admin = await Admin.create(adminData); // Fixed: removed wrapping object
    logger.info("admin created with id", admin._id);
    return admin;
  }
  
  static async getAdminById(id: string) {
    const admin = await Admin.findById(id);
    return admin;
  }
  
  static async updateAdmin(id: string, updateData: Partial<IAdmin>) {
    const admin = await Admin.findById(id);
    if (!admin) throw new Error("admin not found");
    
    // Remove sensitive fields
    const sanitizedData = { ...updateData };
    delete sanitizedData.password;
    delete sanitizedData.email;
    
    const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: id }, 
      sanitizedData, // Use sanitizedData instead of updateData
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");
    
    return updatedAdmin;
  }
  
  static async loginAdmin(email: string, password: string) {
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) throw new Error("admin not found");
    const isMatchedPassword = await admin.comparePassword(password);
    if (!isMatchedPassword) {
      throw new Error("wrong password of admin");
    }
    const token = await admin.getJWTToken();
    return token;
  }
}
