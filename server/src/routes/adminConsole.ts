/**
 * Admin Console Routes
 * Production-grade admin panel with full RBAC, audit logging, and all features
 */

import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { adminActionLogger, withAudit } from '../middleware/audit';
import { checkPermission } from '../middleware/rbac';
import { AuditLog } from '../models/AuditLog';
import { EventLog } from '../models/EventLog';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}

/**
 * ========================================
 * USERS MANAGEMENT
 * ========================================
 */

/**
 * @route   GET /api/admin/users
 * @desc    Get users with search, filters, pagination
 * @access  Private (admin with users:read)
 */
router.get('/users', checkPermission('users:read'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      status,
      plan,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const User = mongoose.model('User');
    const query: Record<string, unknown> = {};

    // Search filter
    if (search) {
      query.$or = [
        { email: { $regex: search as string, $options: 'i' } },
        { firstName: { $regex: search as string, $options: 'i' } },
        { lastName: { $regex: search as string, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Plan filter
    if (plan && plan !== 'all') {
      if (plan === 'premium') {
        query['premium.isActive'] = true;
      } else {
        query['premium.isActive'] = false;
      }
    }

    // Build sort
    const sort: Record<string, number> = {};
    sort[sortBy as string] = sortDirection === 'asc' ? 1 : -1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch users', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details
 * @access  Private (admin with users:read)
 */
router.get('/users/:userId', checkPermission('users:read'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const User = mongoose.model('User');
    const user = await User.findById(userId).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get related data
    const Pet = mongoose.model('Pet');
    const Match = mongoose.model('Match');
    
    const [pets, matches] = await Promise.all([
      Pet.find({ owner: userId }).lean(),
      Match.find({
        $or: [{ user1: userId }, { user2: userId }],
      }).lean(),
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        pets,
        matches,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch user', { error, userId: req.params.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user
 * @access  Private (admin with users:write)
 */
router.put('/users/:userId', checkPermission('users:write'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const User = mongoose.model('User');
    
    const user = await withAudit(
      {
        req,
        action: 'UPDATE_USER',
        target: userId,
        reason: updates.reason,
      },
      async () => {
        return await User.findByIdAndUpdate(
          userId,
          { $set: updates },
          { new: true }
        ).select('-password').lean();
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Failed to update user', { error, userId: req.params.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * ========================================
 * AUDIT LOGS
 * ========================================
 */

/**
 * @route   GET /api/admin/audit
 * @desc    Get audit logs
 * @access  Private (admin with audit:read)
 */
router.get('/audit', checkPermission('audit:read'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      adminId,
      action,
      target,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const query: Record<string, unknown> = {};

    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (target) query.target = target;
    
    if (startDate || endDate) {
      query.at = {};
      if (startDate) (query.at as Record<string, Date>).$gte = new Date(startDate as string);
      if (endDate) (query.at as Record<string, Date>).$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ at: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch audit logs', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * ========================================
 * SYSTEM HEALTH
 * ========================================
 */

/**
 * @route   GET /api/admin/health
 * @desc    Get system health status
 * @access  Private (admin with health:read)
 */
router.get('/health', checkPermission('health:read'), async (req: AuthRequest, res: Response) => {
  try {
    // Database health
    const mongoStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
    
    // Get basic metrics
    const User = mongoose.model('User');
    const [totalUsers, activeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
    ]);

    res.json({
      success: true,
      health: {
        database: {
          status: mongoStatus,
          connectionString: 'mongodb',
        },
        metrics: {
          totalUsers,
          activeUsers,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch health status', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
