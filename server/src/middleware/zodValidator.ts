import z, { ZodSchema, ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * Zod validation configuration
 */
interface ZodValidationConfig {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Validation error structure
 */
interface ValidationError {
  path: string;
  code: string;
  message: string;
}

/**
 * Zod validation middleware
 */
export function zodValidate(config: ZodValidationConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (config.body) {
        req.body = config.body.parse(req.body ?? {});
      }
      if (config.params) {
        req.params = config.params.parse(req.params ?? {});
      }
      if (config.query) {
        req.query = config.query.parse(req.query ?? {});
      }
      next();
    } catch (err) {
      const zodError = err as ZodError;
      const issues = zodError?.issues || [];
      const errors: ValidationError[] = issues.map((i) => ({
        path: i.path?.join('.') || '',
        code: i.code,
        message: i.message,
      }));
      res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
  };
}

/**
 * Re-export zod for convenience
 */
export { z };
