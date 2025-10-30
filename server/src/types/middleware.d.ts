import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './express';

/**
 * Middleware function type
 */
export type Middleware = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

/**
 * Authenticated middleware type
 */
export type AuthenticatedMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => void | Promise<void>;

/**
 * Error handler middleware
 */
export interface IErrorHandler extends Middleware {
  (err: Error, req: Request, res: Response, next: NextFunction): void;
}

/**
 * Authentication middleware interface
 */
export interface IAuthMiddleware {
  authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  generateTokens(userId: string): { accessToken: string; refreshToken: string };
}

/**
 * Admin authentication middleware interface
 */
export interface IAdminAuthMiddleware extends Middleware {
  requireAdmin: AuthenticatedMiddleware;
  requireModerator: AuthenticatedMiddleware;
  requireSuperAdmin: AuthenticatedMiddleware;
}

/**
 * Validation middleware interface
 */
export interface IValidationMiddleware {
  validate: Middleware;
  sanitize: Middleware;
  validateInput: Middleware;
}

/**
 * Rate limiting middleware interface
 */
export interface IRateLimitMiddleware {
  apiLimiter: Middleware;
  authLimiter: Middleware;
  strictLimiter: Middleware;
  globalRateLimit: Middleware;
  storyDailyLimiter: Middleware;
}

/**
 * CSRF protection middleware interface
 */
export interface IECSrfMiddleware extends Middleware {
  csrfProtection: Middleware;
}

/**
 * Session management middleware interface
 */
export interface ISessionMiddleware extends Middleware {
  requireSession: Middleware;
  sessionRenewal: Middleware;
}

/**
 * Premium gating middleware interface
 */
export interface IPremiumMiddleware extends Middleware {
  requirePremium: AuthenticatedMiddleware;
  checkPremiumFeature(feature: string): AuthenticatedMiddleware;
}

/**
 * RBAC middleware interface
 */
export interface IRbacMiddleware extends Middleware {
  requireRole(role: string | string[]): AuthenticatedMiddleware;
  requirePermission(permission: string | string[]): AuthenticatedMiddleware;
}

/**
 * Admin logger middleware interface
 */
export interface IAdminLoggerMiddleware extends Middleware {
  logAdminAction(action: string): AuthenticatedMiddleware;
}

/**
 * Request ID middleware interface
 */
export interface IRequestIdMiddleware extends Middleware {
  attachRequestId: Middleware;
}

/**
 * Input validator middleware interface
 */
export interface IInputValidatorMiddleware extends Middleware {
  validateBody: Middleware;
  validateParams: Middleware;
  validateQuery: Middleware;
}

/**
 * Zod validator middleware interface
 */
export interface IZodValidatorMiddleware extends Middleware {
  validate: (schema: unknown) => Middleware;
}
