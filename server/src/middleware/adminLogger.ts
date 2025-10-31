import AdminActivityLog from '../models/AdminActivityLog';
import logger from '../utils/logger';
import type { Request, Response, NextFunction } from 'express';

interface AdminActivityDetails {
  [key: string]: unknown;
}

interface AdminActivityResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Create an admin activity log entry
 * 
 * @param req - Express request object
 * @param action - The action being performed (e.g., UPDATE_STRIPE_CONFIG)
 * @param details - Additional details about the action (optional)
 * @param success - Whether the action was successful (default: true)
 * @param errorMessage - Error message if action failed (optional)
 * @returns The created log entry
 */
export const logAdminActivity = async (
  req: Request,
  action: string,
  details: AdminActivityDetails = {},
  success: boolean = true,
  errorMessage: string | null = null
): Promise<unknown> => {
  try {
    if (!req.user || !req.user._id) {
      logger.error('Cannot log admin activity: No user in request');
      return null;
    }

    const logEntry = await AdminActivityLog.create({
      adminId: req.user._id,
      action,
      details,
      ipAddress: req.ip || req.socket?.remoteAddress || undefined,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
      success,
      errorMessage
    });
    
    return logEntry;
  } catch (error: unknown) {
    // Log to console but don't throw - this should never break the main flow
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error logging admin activity:', { error: errorMessage });
    return null;
  }
};

/**
 * Middleware to log admin actions automatically
 * 
 * @param action - The action being performed
 * @returns Express middleware function
 */
export const adminActionLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store the original res.json method
    const originalJson = res.json.bind(res);
    
    // Override res.json to capture the response
    res.json = function(data: AdminActivityResponse): Response {
      // Log the admin activity
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const errorMessage = !success && data?.message ? data.message : null;
      
      logAdminActivity(req, action, req.body, success, errorMessage)
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error('Failed to log admin activity:', { error: errorMessage });
        });
      
      // Call the original res.json with the data
      return originalJson(data);
    };
    
    next();
  };
};

