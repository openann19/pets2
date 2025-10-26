import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

interface ZodValidateOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function zodValidate({ body, params, query }: ZodValidateOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (body) req.body = body.parse(req.body ?? {});
      if (params) req.params = params.parse(req.params ?? {});
      if (query) req.query = query.parse(req.query ?? {});
      return next();
    } catch (err: any) {
      const issues = err?.issues || [];
      const errors = issues.map((i: any) => ({
        path: i.path?.join('.') || '',
        code: i.code,
        message: i.message,
      }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
  };
}

export { z };
