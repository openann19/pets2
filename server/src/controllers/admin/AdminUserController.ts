export {};// Added to mark file as a module
const User = require('../models/User');
const Pet = require('../models/Pet');
const Match = require('../models/Match');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// ============= USER MANAGEMENT =============

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

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

  } catch (error) {
    logger.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// @desc    Get specific user details
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('pets')
      .populate('matches')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activity summary
    const petCount = await Pet.countDocuments({ owner: req.params.id });
    const matchCount = await Match.countDocuments({
      $or: [{ user1: req.params.id }, { user2: req.params.id }]
    });
    const messageCount = await Message.countDocuments({
      $or: [{ sender: req.params.id }, { receiver: req.params.id }]
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
          messageCount
        },
        recentActivity
      }
    });

  } catch (error) {
    logger.error('Error getting user details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user details',
      error: error.message
    });
  }
};

// @desc    Suspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Admin
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend admin users'
      });
    }

    const suspensionData = {
      status: 'suspended',
      suspensionReason: req.body.reason,
      suspendedAt: new Date(),
      suspendedBy: req.userId,
      suspensionDuration: req.body.duration || null
    };

    // Set suspension end date if duration provided
    if (req.body.duration) {
      suspensionData.suspensionEndsAt = new Date(Date.now() + (req.body.duration * 24 * 60 * 60 * 1000));
    }

    await User.findByIdAndUpdate(req.params.id, suspensionData);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'suspend_user',
      resourceType: 'user',
      resourceId: req.params.id,
      details: {
        reason: req.body.reason,
        duration: req.body.duration,
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

  } catch (error) {
    logger.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend user',
      error: error.message
    });
  }
};

// @desc    Ban user account permanently
// @route   PUT /api/admin/users/:id/ban
// @access  Admin
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    const banData = {
      status: 'banned',
      banReason: req.body.reason,
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
        reason: req.body.reason,
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

  } catch (error) {
    logger.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ban user',
      error: error.message
    });
  }
};

// @desc    Activate suspended/banned user
// @route   PUT /api/admin/users/:id/activate
// @access  Admin
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const activationData = {
      status: 'active',
      activationReason: req.body.reason,
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
        reason: req.body.reason,
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

  } catch (error) {
    logger.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    const newRole = req.body.role;

    // Prevent demoting other admins
    if (user.role === 'admin' && newRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot demote admin users'
      });
    }

    const roleUpdateData = {
      role: newRole,
      roleUpdatedAt: new Date(),
      roleUpdatedBy: req.userId,
      roleUpdateReason: req.body.reason
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
        reason: req.body.reason
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

  } catch (error) {
    logger.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// @desc    Get user activity logs
// @route   GET /api/admin/users/:id/activity
// @access  Admin
const getUserActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
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

  } catch (error) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activity',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  suspendUser,
  banUser,
  activateUser,
  updateUserRole,
  getUserActivity
};
