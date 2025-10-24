/**
 * Data Validation Utilities
 * Production-hardened validation and sanitization for web components
 * Features: Input validation, data sanitization, schema validation
 */

import { logger } from '@pawfectmatch/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: unknown;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'url' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: unknown;
  message?: string;
  validator?: (value: unknown) => boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, options: {
  maxLength?: number;
  allowedChars?: RegExp;
  trim?: boolean;
} = {}): string {
  if (typeof input !== 'string') return '';

  let sanitized = input;

  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  if (options.allowedChars !== undefined) {
    sanitized = sanitized.replace(options.allowedChars, '');
  }

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>"'`]/g, '');

  if (options.maxLength !== undefined && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
    logger.warn('Input truncated due to length limit', {
      originalLength: input.length,
      maxLength: options.maxLength,
    });
  }

  return sanitized;
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email, {
    maxLength: 254, // RFC 5321 limit
    allowedChars: /[^a-zA-Z0-9@._-]/g,
  }).toLowerCase();
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string): string {
  return sanitizeString(url, {
    maxLength: 2000,
    allowedChars: /[^a-zA-Z0-9:/?._\-&=+%]/g,
  });
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required field
 */
export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  const isValid = value !== null && value !== undefined && value !== '';

  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} is required`],
  };
}

/**
 * Validate email
 */
export function validateEmail(value: unknown, fieldName: string = 'Email'): ValidationResult {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [`${fieldName} must be a string`],
    };
  }

  const sanitized = sanitizeEmail(value);

  if (sanitized === '') {
    return {
      isValid: false,
      errors: [`${fieldName} is required`],
    };
  }

  if (!isValidEmail(sanitized)) {
    return {
      isValid: false,
      errors: [`${fieldName} must be a valid email address`],
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedValue: sanitized,
  };
}

/**
 * Validate URL
 */
export function validateUrl(value: unknown, fieldName: string = 'URL'): ValidationResult {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [`${fieldName} must be a string`],
    };
  }

  const sanitized = sanitizeUrl(value);

  if (sanitized === '') {
    return {
      isValid: false,
      errors: [`${fieldName} is required`],
    };
  }

  if (!isValidUrl(sanitized)) {
    return {
      isValid: false,
      errors: [`${fieldName} must be a valid URL`],
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedValue: sanitized,
  };
}

/**
 * Validate string length
 */
export function validateLength(
  value: unknown,
  minLength: number,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [`${fieldName} must be a string`],
    };
  }

  const sanitized = sanitizeString(value, { maxLength });

  if (sanitized.length < minLength) {
    return {
      isValid: false,
      errors: [`${fieldName} must be at least ${String(minLength)} characters`],
    };
  }

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      errors: [`${fieldName} must be no more than ${String(maxLength)} characters`],
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedValue: sanitized,
  };
}

/**
 * Validate with custom pattern
 */
export function validatePattern(
  value: unknown,
  pattern: RegExp,
  fieldName: string,
  message?: string
): ValidationResult {
  if (typeof value !== 'string') {
    return {
      isValid: false,
      errors: [`${fieldName} must be a string`],
    };
  }

  const sanitized = sanitizeString(value);

  if (!pattern.test(sanitized)) {
    return {
      isValid: false,
      errors: [message !== undefined ? message : `${fieldName} format is invalid`],
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedValue: sanitized,
  };
}

/**
 * Validate with custom function
 */
export function validateCustom(
  value: unknown,
  validator: (value: unknown) => boolean,
  fieldName: string,
  message?: string
): ValidationResult {
  if (!validator(value)) {
    return {
      isValid: false,
      errors: [message !== undefined ? message : `${fieldName} is invalid`],
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedValue: value,
  };
}

/**
 * Validate single field with rules
 */
export function validateField(value: unknown, rules: ValidationRule[], fieldName: string): ValidationResult {
  const errors: string[] = [];
  let sanitizedValue: unknown = value;

  for (const rule of rules) {
    let result: ValidationResult;

    switch (rule.type) {
      case 'required':
        result = validateRequired(value, fieldName);
        break;
      case 'email':
        result = validateEmail(value, fieldName);
        break;
      case 'url':
        result = validateUrl(value, fieldName);
        break;
      case 'minLength':
        if (typeof rule.value === 'number') {
          result = validateLength(value, rule.value, Infinity, fieldName);
        } else {
          result = validateRequired(value, fieldName); // fallback
        }
        break;
      case 'maxLength':
        if (typeof rule.value === 'number') {
          result = validateLength(value, 0, rule.value, fieldName);
        } else {
          result = validateRequired(value, fieldName); // fallback
        }
        break;
      case 'pattern':
        if (rule.value instanceof RegExp) {
          result = validatePattern(value, rule.value, fieldName, rule.message);
        } else {
          result = validateRequired(value, fieldName); // fallback
        }
        break;
      case 'custom':
        if (rule.validator !== undefined) {
          result = validateCustom(value, rule.validator, fieldName, rule.message);
        } else {
          result = validateRequired(value, fieldName); // fallback
        }
        break;
      default:
        continue;
    }

    if (!result.isValid) {
      errors.push(...result.errors);
    }

    if (result.sanitizedValue !== undefined) {
      sanitizedValue = result.sanitizedValue;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue,
  };
}

/**
 * Validate entire form with schema
 */
export function validateForm(data: Record<string, unknown>, schema: ValidationSchema): {
  isValid: boolean;
  errors: Record<string, string[]>;
  sanitizedData: Record<string, unknown>;
} {
  const errors: Record<string, string[]> = {};
  const sanitizedData: Record<string, unknown> = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];
    const result = validateField(value, rules, fieldName);

    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }

    if (result.sanitizedValue !== undefined) {
      sanitizedData[fieldName] = result.sanitizedValue;
    }
  }

  return {
    isValid,
    errors,
    sanitizedData,
  };
}

/**
 * Common validation schemas
 */
export const validationSchemas = {
  login: {
    email: [
      { type: 'required' },
      { type: 'email' },
    ],
    password: [
      { type: 'required' },
      { type: 'minLength', value: 8 },
    ],
  },

  register: {
    email: [
      { type: 'required' },
      { type: 'email' },
    ],
    password: [
      { type: 'required' },
      { type: 'minLength', value: 8 },
      { type: 'maxLength', value: 128 },
    ],
    firstName: [
      { type: 'required' },
      { type: 'minLength', value: 1 },
      { type: 'maxLength', value: 50 },
    ],
    lastName: [
      { type: 'required' },
      { type: 'minLength', value: 1 },
      { type: 'maxLength', value: 50 },
    ],
  },

  profile: {
    firstName: [
      { type: 'required' },
      { type: 'minLength', value: 1 },
      { type: 'maxLength', value: 50 },
    ],
    lastName: [
      { type: 'required' },
      { type: 'minLength', value: 1 },
      { type: 'maxLength', value: 50 },
    ],
    email: [
      { type: 'required' },
      { type: 'email' },
    ],
  },
} as const;
