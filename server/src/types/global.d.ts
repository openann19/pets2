// Module declarations for missing @types packages
interface SwaggerJsdocOptions {
  definition: Record<string, unknown>;
  apis: string[];
}

interface SwaggerSpec {
  [key: string]: unknown;
}

declare module 'swagger-jsdoc' {
  export default function swaggerJsdoc(options: SwaggerJsdocOptions): SwaggerSpec;
}

interface SwaggerUiOptions {
  [key: string]: unknown;
}

declare module 'swagger-ui-express' {
  export function serve(): unknown;
  export function setup(spec: SwaggerSpec, options?: SwaggerUiOptions): unknown;
}

declare module 'express-rate-limit' {
  import { Request, Response, NextFunction } from 'express';
  
  export interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string | object;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    handler?: (req: Request, res: Response, next: NextFunction) => void;
    skip?: (req: Request) => boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: Request) => string;
    store?: {
      incr(key: string, cb: (err?: Error, hits?: number, resetTime?: Date) => void): void;
      decrement(key: string): void;
      resetAll?(): void;
    };
  }
  
  export interface RateLimitRequestHandler {
    (req: Request, res: Response, next: NextFunction): void;
  }
  
  export function ipKeyGenerator(req: Request): string;
  
  interface RateLimit {
    (options: RateLimitOptions): RateLimitRequestHandler;
  }
  
  const rateLimit: RateLimit;
  export default rateLimit;
}

import type { IUserDocument } from '../models/User';

// Type augmentation for Express Request to include custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IUserDocument;
      id?: string;
      stripeEventVerified?: boolean;
    }
  }
}
