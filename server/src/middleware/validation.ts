import { validationResult, Result, ValidationError } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

/**
 * Validation error message structure
 */
interface ValidationErrorMessage {
  field: string;
  message: string;
  value: unknown;
}

/**
 * Validation middleware
 * Checks validation results and returns formatted errors
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result<ValidationError> = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages: ValidationErrorMessage[] = errors.array().map(error => ({
      field: error.path || error.param || 'unknown',
      message: error.msg,
      value: error.value
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
    return;
  }
  
  next();
};
