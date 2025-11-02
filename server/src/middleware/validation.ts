import { validationResult, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

interface ValidationErrorMessage {
  field: string;
  message: string;
  value?: any;
}

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages: ValidationErrorMessage[] = errors.array().map((error: ValidationError) => ({
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