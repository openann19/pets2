import AdminActivityLog from '../models/AdminActivityLog';
import logger from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
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
  req: AuthRequest,
  action: string,
  details: Record<string, any> = {},
  success: boolean = true,
  errorMessage: string | null = null
): Promise<any> => {
  try {
    if (!req.user || !req.user._id) {
      logger.error('Cannot log admin activity: No user in request');
      return null;
    }

    const logEntry = await AdminActivityLog.create({
      adminId: req.user._id,
      action,
      details,
      ipAddress: req.ip || (req as any).connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
      success,
      errorMessage
    });
    
    return logEntry;
  } catch (error: any) {
    // Log to console but don't throw - this should never break the main flow
    logger.error('Error logging admin activity:', { error: error.message });
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
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Store the original res.json method
    const originalJson = res.json.bind(res);
    
    // Override res.json to capture the response
    res.json = function(data: any): Response {
      // Log the admin activity
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const errorMessage = !success && data?.message ? data.message : null;
      
      logAdminActivity(req, action, req.body, success, errorMessage)
        .catch((error: any) => logger.error('Failed to log admin activity:', { error: error.message }));
      
      // Call the original res.json with the data
      return originalJson(data);
    };
    
    next();
  };
};

export { logAdminActivity, adminActionLogger };
