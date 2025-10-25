import { validationResult, ValidationChain } from 'express-validator';
import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, ValidationError, ApiResponse } from '../types';

export const validate = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages: ValidationError[] = errors.array().map((error: { path?: string; param?: string; msg: string; value?: unknown }) => ({
      field: error.path || error.param || 'unknown',
      message: error.msg,
      value: error.value
    }));
    
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      error: JSON.stringify(errorMessages)
    };
    
    res.status(400).json(response);
    return;
  }
  
  next();
};

// Async validation wrapper for complex validations
export const asyncValidate = (
  validations: ValidationChain[]
) => {
  return async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
  ): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages: ValidationError[] = errors.array().map((error: { path?: string; param?: string; msg: string; value?: unknown }) => ({
        field: error.path || error.param || 'unknown',
        message: error.msg,
        value: error.value
      }));
      
      const response: ApiResponse = {
        success: false,
        message: 'Validation failed',
        error: JSON.stringify(errorMessages)
      };
      
      res.status(400).json(response);
      return;
    }
    
    next();
  };
};

// Custom validation helpers
export const validateObjectId = (field: string) => {
  return (value: string) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(value)) {
      throw new Error(`${field} must be a valid ObjectId`);
    }
    return true;
  };
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone number validation (can be customized)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export default {
  validate,
  asyncValidate,
  validateObjectId,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
};
