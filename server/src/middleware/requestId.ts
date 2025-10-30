/**
 * Request ID Middleware
 * Generates and attaches unique request IDs for tracing and correlation
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomBytes(16).toString('hex');
}

interface RequestWithId extends Request {
  id?: string;
  requestId?: string;
}

/**
 * Request ID middleware
 * Attaches a unique ID to each request for logging and tracing
 */
export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  // Use existing request ID from header if present, otherwise generate new
  const requestId = (req.headers['x-request-id'] as string) || 
                    (req.headers['x-correlation-id'] as string) || 
                    generateRequestId();
  
  // Attach to request object
  req.id = requestId;
  req.requestId = requestId;
  
  // Set response header
  res.setHeader('X-Request-ID', requestId);
  
  // Attach to logger context if available
  if ((req as any).log) {
    (req as any).log = (req as any).log.child({ requestId });
  }
  
  next();
}
