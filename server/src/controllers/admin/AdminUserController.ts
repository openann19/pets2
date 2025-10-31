/**
 * Admin User Management Controller for PawfectMatch
 * Handles user management operations for administrators
 */

import type { Request, Response } from 'express';
import User from '../../models/User';
import Pet from '../../models/Pet';
import Match from '../../models/Match';
import AuditLog from '../../models/AuditLog';
import Conversation from '../../models/Conversation';
import { getErrorMessage } from '../../utils/errorHandler';
const logger = require('../../utils/logger');

// Type definitions
interface AdminRequest extends Request {
  userId?: string;
}

interface GetAllUsersQuery {
  page?: string;
  limit?: string;
  status?: string;
  role?: string;
  search?: string;
  verified?: string;
}

interface SuspendUserBody {
  reason?: string;
  duration?: number;
}

interface BanUserBody {
  reason?: string;
}

interface ActivateUserBody {
  reason?: string;
}

interface UpdateUserRoleBody {
  role: string;
  reason?: string;
}

// ============= USER MANAGEMENT =============

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getAllUsers = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Apply filters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.verified) {
      filter.isVerified = req.query.verified === 'true';
    }

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('pets', 'name species photos')
      .lean();

    const total = await User.countDocuments(filter);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'get_all_users',
      resourceType: 'users',
      details: { filter, page, limit },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: unknown) {
    logger.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Get specific user details
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
export const getUserDetails = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('pets')
      .populate('matches')
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get user activity summary
    const petCount = await Pet.countDocuments({ owner: req.params.id });
    const matchCount = await Match.countDocuments({
      $or: [{ user1: req.params.id }, { user2: req.params.id }]
    });
    
    // Get conversation count
    const conversationCount = await Conversation.countDocuments({
      participants: { $in: [req.params.id] }
    });

    // Get recent activity
    const recentActivity = await AuditLog.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('action createdAt ipAddress')
      .lean();

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'get_user_details',
      resourceType: 'user',
      resourceId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          petCount,
          matchCount,
          conversationCount
        },
        recentActivity
      }
    });

  } catch (error: unknown) {
    logger.error('Error getting user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Suspend user account
 * @route   PUT /api/admin/users/:id/suspend
 * @access  Admin
 */
export const suspendUser = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.role === 'administrator') {
      res.status(403).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
      return;
    }

    const body: SuspendUserBody = req.body;
    const suspensionData: any = {
      status: 'suspended',
      suspensionReason: body.reason,
      suspendedAt: new Date(),
      suspendedBy: req.userId,
      suspensionDuration: body.duration || null
    };

    // Set suspension end date if duration provided
    if (body.duration) {
      suspensionData.suspensionEndsAt = new Date(Date.now() + (body.duration * 24 * 60 * 60 * 1000));
    }

    await User.findByIdAndUpdate(req.params.id, suspensionData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'suspend_user',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        reason: body.reason,
        duration: body.duration,
        previousStatus: user.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`User ${req.params.id} suspended by admin ${req.userId}`, suspensionData);

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: suspensionData
    });

  } catch (error: unknown) {
    logger.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Ban user account permanently
 * @route   PUT /api/admin/users/:id/ban
 * @access  Admin
 */
export const banUser = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.role === 'administrator') {
      res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
      return;
    }

    const body: BanUserBody = req.body;
    const banData: any = {
      status: 'banned',
      banReason: body.reason,
      bannedAt: new Date(),
      bannedBy: req.userId
    };

    await User.findByIdAndUpdate(req.params.id, banData);

    // Deactivate all user's pets
    await Pet.updateMany({ owner: req.params.id }, { isActive: false });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'ban_user',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        reason: body.reason,
        previousStatus: user.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.warn(`User ${req.params.id} banned by admin ${req.userId}`, banData);

    res.json({
      success: true,
      message: 'User banned successfully',
      data: banData
    });

  } catch (error: unknown) {
    logger.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ban user',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Activate suspended/banned user
 * @route   PUT /api/admin/users/:id/activate
 * @access  Admin
 */
export const activateUser = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const body: ActivateUserBody = req.body;
    const activationData: any = {
      status: 'active',
      activationReason: body.reason,
      activatedAt: new Date(),
      activatedBy: req.userId,
      suspensionReason: null,
      suspensionEndsAt: null,
      banReason: null
    };

    await User.findByIdAndUpdate(req.params.id, activationData);

    // Reactivate all user's pets
    await Pet.updateMany({ owner: req.params.id }, { isActive: true });

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'activate_user',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        reason: body.reason,
        previousStatus: user.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`User ${req.params.id} activated by admin ${req.userId}`, activationData);

    res.json({
      success: true,
      message: 'User activated successfully',
      data: activationData
    });

  } catch (error: unknown) {
    logger.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
export const updateUserRole = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const oldRole = user.role;
    const body: UpdateUserRoleBody = req.body;
    const newRole = body.role;

    // Prevent demoting other admins
    if (user.role === 'administrator' && newRole !== 'administrator') {
      res.status(403).json({
        success: false,
        message: 'Cannot demote admin users'
      });
      return;
    }

    const roleUpdateData: any = {
      role: newRole,
      roleUpdatedAt: new Date(),
      roleUpdatedBy: req.userId,
      roleUpdateReason: body.reason
    };

    await User.findByIdAndUpdate(req.params.id, roleUpdateData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'update_user_role',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        oldRole,
        newRole,
        reason: body.reason
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`User ${req.params.id} role updated from ${oldRole} to ${newRole} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: roleUpdateData
    });

  } catch (error: unknown) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: getErrorMessage(error)
    });
  }
};

/**
 * @desc    Get user activity logs
 * @route   GET /api/admin/users/:id/activity
 * @access  Admin
 */
export const getUserActivity = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const activities = await AuditLog.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments({ userId: req.params.id });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: unknown) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity',
      error: getErrorMessage(error)
    });
  }
};

// Export all functions
export default {
  getAllUsers,
  getUserDetails,
  suspendUser,
  banUser,
  activateUser,
  updateUserRole,
  getUserActivity
};

