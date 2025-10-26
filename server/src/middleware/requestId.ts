/**
 * Request ID Middleware
 * Generates and attaches unique request IDs for tracing and correlation
 */

import { randomBytes } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Extended request with request ID
 */
interface RequestWithId extends Request {
  id?: string;
  requestId?: string;
  log?: {
    child: (context: { requestId: string }) => unknown;
  };
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Request ID middleware
 * Attaches a unique ID to each request for logging and tracing
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const reqWithId = req as RequestWithId;
  
  // Use existing request ID from header if present, otherwise generate new
  const requestId = reqWithId.headers['x-request-id'] as string || 
                    reqWithId.headers['x-correlation-id'] as string || 
                    generateRequestId();
  
  // Attach to request object
  reqWithId.id = requestId;
  reqWithId.requestId = requestId;
  
  // Set response header
  res.setHeader('X-Request-ID', requestId);
  
  // Attach to logger context if available
  if (reqWithId.log) {
    reqWithId.log = reqWithId.log.child({ requestId }) as typeof reqWithId.log;
  }
  
  next();
}

/**
 * Default export for backward compatibility
 */
export default requestIdMiddleware;
