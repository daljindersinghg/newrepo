// api/src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation results from express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors: { [key: string]: string } = {};
    errors.array().forEach(err => {
      if ('path' in err) {
        extractedErrors[err.path] = err.msg;
      }
    });

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
    return;
  }
  
  next();
};
