/**
 * Audit Middleware
 * Logs all admin actions to audit trail
 */

import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}

/**
 * Create an audit log entry
 */
export async function logAdminAction(
  req: AuthRequest,
  action: string,
  data: {
    target?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    reason?: string;
  }
): Promise<void> {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    await AuditLog.create({
      at: new Date(),
      adminId: req.user?._id || 'unknown',
      ip: Array.isArray(ip) ? ip[0] : ip,
      action,
      target: data.target,
      before: data.before,
      after: data.after,
      reason: data.reason,
    });
  } catch (error) {
    logger.error('Failed to create audit log', { error, action, data });
    // Don't throw - audit logging should not break the request
  }
}

/**
 * Higher-order function to create audit logger
 */
export function adminActionLogger(action: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send.bind(res);
    
    let responseSent = false;
    
    res.send = function (data: unknown) {
      if (!responseSent) {
        responseSent = true;
        
        // Log the action asynchronously
        logAdminAction(req, action, {
          target: req.params.id || req.params.userId || req.params.customerId,
          after: res.statusCode < 400 ? JSON.parse(typeof data === 'string' ? data : JSON.stringify(data)) : undefined,
          reason: req.body?.reason,
        }).catch((error) => {
          logger.error('Failed to log admin action', { error, action });
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Audit guard wrapper for mutations
 */
export async function withAudit<T>(
  ctx: {
    req: AuthRequest;
    action: string;
    target: string;
    reason?: string;
  },
  mutate: () => Promise<T>
): Promise<T> {
  // Get before state if possible
  let before: Record<string, unknown> | undefined;
  
  try {
    // This is a placeholder - actual implementation would fetch the before state
    // based on the target type and ID
    before = {};
  } catch (error) {
    logger.warn('Could not fetch before state for audit', { error, target: ctx.target });
  }
  
  // Execute mutation
  const result = await mutate();
  
  // Get after state
  let after: Record<string, unknown> | undefined;
  
  try {
    // This is a placeholder - actual implementation would fetch the after state
    after = { result };
  } catch (error) {
    logger.warn('Could not fetch after state for audit', { error, target: ctx.target });
  }
  
  // Log the audit entry
  await logAdminAction(ctx.req, ctx.action, {
    target: ctx.target,
    before,
    after,
    reason: ctx.reason,
  });
  
  return result;
}
