/**
 * Admin Authentication Middleware
 * Ensures only authenticated admin users can access admin routes
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Check if user account is active
    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Account is not active'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication token has expired'
      });
    }

    logger.error('Authentication error', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to authenticate'
    });
  }
};

/**
 * Ensure user has an admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Define admin roles
    const adminRoles = ['administrator', 'moderator', 'support', 'analyst', 'billing_admin'];

    if (!adminRoles.includes(req.user.role)) {
      // Log unauthorized admin access attempt
      const { logAdminActivity } = require('./adminLogger');
      await logAdminActivity(
        req,
        'UNAUTHORIZED_ADMIN_ACCESS',
        { userRole: req.user.role },
        false,
        'User attempted to access admin panel without admin role'
      );

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin authorization error', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify admin access'
    });
  }
};

/**
 * Require specific admin role(s)
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 */
const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      if (!roles.includes(req.user.role)) {
        const { logAdminActivity } = require('./adminLogger');
        await logAdminActivity(
          req,
          'UNAUTHORIZED_ROLE_ACCESS',
          { userRole: req.user.role, requiredRoles: roles },
          false,
          `User role ${req.user.role} not in allowed roles: ${roles.join(', ')}`
        );

        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Insufficient role permissions',
          requiredRoles: roles
        });
      }

      next();
    } catch (error) {
      logger.error('Role authorization error', { error });
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify role'
      });
    }
  };
};

/**
 * Optional authentication - attaches user if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded && decoded.userId) {
      const user = await User.findById(decoded.userId).select('+role');
      if (user && user.status === 'active') {
        req.user = user;
      }
    }

    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
  optionalAuth
};
