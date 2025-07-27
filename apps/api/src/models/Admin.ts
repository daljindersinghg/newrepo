import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IAdmin extends Document {
  // Auth / profile
  name: string;
  email: string;
  phone?: string;
  password: string;

  // Admin-specific
  roles?: string[]; // e.g., ['superadmin', 'staff']

  // Audit
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  getJWTToken(): string;
}

const AdminSchema: Schema = new Schema({
  // Auth / profile
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },

  // Admin-specific
  roles: [{ type: String, enum: ["superadmin", "staff"] }],

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt
AdminSchema.pre("save", async function (this: IAdmin, next) {
  this.updatedAt = new Date();
  if (!this.isModified("password")) {
    next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err: any) {
    next(err);
  }
});

AdminSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

AdminSchema.methods.getJWTToken = function () {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY environment variable is not defined");
  }

  return (jwt as any).sign({ id: this._id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

export default mongoose.model<IAdmin>("Admin", AdminSchema);
