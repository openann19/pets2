import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function validate(req: Request, res: Response, next: NextFunction): Response | void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: { param?: string; path?: string; msg?: string; value?: unknown }) => ({
      field: error?.param || error?.path || 'unknown',
      message: error?.msg || 'Validation error',
      value: error?.value || undefined
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
}
