// api/src/types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      patientId?: string;
      patient?: any;
      clinicId?: string;
      clinic?: any;
      adminId?: string;
      admin?: any;
    }
  }
}
