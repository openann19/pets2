import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/express';
import logger from '../utils/logger';

/**
 * Admin activity details
 */
interface AdminActivityDetails {
  [key: string]: unknown;
}

/**
 * Middleware to log admin actions automatically
 */
export const logAdminActivity = async (
  req: Request,
  action: string,
  details: AdminActivityDetails = {},
  success = true,
  errorMessage: string | null = null
): Promise<unknown | null> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user || !authReq.user._id) {
      logger.error('Cannot log admin activity: No user in request');
      return null;
    }

    const { AdminActivityLog } = await import('../models/AdminActivityLog');
    
    const logEntry = await AdminActivityLog.create({
      adminId: authReq.user._id,
      action,
      details,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
      success,
      errorMessage
    });
    
    return logEntry;
  } catch (error) {
    // Log to console but don't throw - this should never break the main flow
    logger.error('Error logging admin activity:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
};

/**
 * Middleware to log admin actions automatically
 */
export const adminActionLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store the original res.json method
    const originalJson = res.json.bind(res);
    
    // Override res.json to capture the response
    res.json = function(data: unknown) {
      // Log the admin activity
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const errorMessage = !success && typeof data === 'object' && data !== null && 'message' in data ? String(data.message) : null;
      
      logAdminActivity(req, action, req.body as AdminActivityDetails, success, errorMessage)
        .catch(error => logger.error('Failed to log admin activity:', { error: error instanceof Error ? error.message : 'Unknown error' }));
      
      // Call the original res.json with the data
      return originalJson.call(this, data);
    };
    
    next();
  };
};
