export {};// Added to mark file as a module
const AdminActivityLog = require('../models/AdminActivityLog');
const logger = require('../utils/logger');

/**
 * Create an admin activity log entry
 * 
 * @param {Object} req - Express request object
 * @param {string} action - The action being performed (e.g., UPDATE_STRIPE_CONFIG)
 * @param {Object} details - Additional details about the action (optional)
 * @param {boolean} success - Whether the action was successful (default: true)
 * @param {string} errorMessage - Error message if action failed (optional)
 * @returns {Promise<Object>} - The created log entry
 */
const logAdminActivity = async (req, action, details = {}, success = true, errorMessage = null) => {
  try {
    if (!req.user || !req.user._id) {
      logger.error('Cannot log admin activity: No user in request');
      return null;
    }

    const logEntry = await AdminActivityLog.create({
      adminId: req.user._id,
      action,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
      success,
      errorMessage
    });
    
    return logEntry;
  } catch (error) {
    // Log to console but don't throw - this should never break the main flow
    logger.error('Error logging admin activity:', { error: error.message });
    return null;
  }
};

/**
 * Middleware to log admin actions automatically
 * 
 * @param {string} action - The action being performed
 * @returns {Function} - Express middleware function
 */
const adminActionLogger = (action) => {
  return (req, res, next) => {
    // Store the original res.json method
    const originalJson = res.json;
    
    // Override res.json to capture the response
    res.json = function(data) {
      // Log the admin activity
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const errorMessage = !success && data.message ? data.message : null;
      
      logAdminActivity(req, action, req.body, success, errorMessage)
        .catch(error => logger.error('Failed to log admin activity:', { error: error.message }));
      
      // Call the original res.json with the data
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  logAdminActivity,
  adminActionLogger
};
