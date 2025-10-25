export {};// Added to mark file as a module
// Optimized Admin Controller - Fixed N+1 Query Issues
// This replaces the original 46KB adminController.js with optimized queries

const User = require('../models/User');
const Match = require('../models/Match');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// ============= OPTIMIZED USER MANAGEMENT =============

// @desc    Get all users with pagination and filtering (OPTIMIZED)
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

    // Single aggregation pipeline for all data (NO N+1 QUERIES)
    const result = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'pets',
          localField: '_id',
          foreignField: 'owner',
          as: 'pets',
          pipeline: [
            {
              $project: {
                name: 1,
                species: 1,
                photos: 1,
                _id: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          petCount: { $size: '$pets' }
        }
      },
      {
        $project: {
          password: 0,
          refreshToken: 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

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
        users: result,
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

// @desc    Get specific user details (OPTIMIZED - Single aggregation)
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = async (req, res) => {
  try {
    // Single aggregation pipeline for ALL user data (NO N+1 QUERIES)
    const userData = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'pets',
          localField: '_id',
          foreignField: 'owner',
          as: 'pets'
        }
      },
      {
        $lookup: {
          from: 'matches',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$user1', '$$userId'] },
                    { $eq: ['$user2', '$$userId'] }
                  ]
                }
              }
            }
          ],
          as: 'matches'
        }
      },
      {
        $lookup: {
          from: 'messages',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$sender', '$$userId'] },
                    { $eq: ['$receiver', '$$userId'] }
                  ]
                }
              }
            },
            { $count: 'total' }
          ],
          as: 'messageStats'
        }
      },
      {
        $lookup: {
          from: 'auditlogs',
          localField: '_id',
          foreignField: 'userId',
          as: 'recentActivity',
          pipeline: [
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $project: { action: 1, createdAt: 1, ipAddress: 1 } }
          ]
        }
      },
      {
        $addFields: {
          stats: {
            petCount: { $size: '$pets' },
            matchCount: { $size: '$matches' },
            messageCount: {
              $ifNull: [
                { $arrayElemAt: ['$messageStats.total', 0] },
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          refreshToken: 0
        }
      }
    ]);

    if (!userData || userData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userData[0];

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
        stats: user.stats,
        recentActivity: user.recentActivity
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

// @desc    Get all chats with message counts (OPTIMIZED - No N+1)
// @route   GET /api/admin/chats
// @access  Admin
const getAllChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.blocked) {
      filter.isBlocked = req.query.blocked === 'true';
    }

    // Single aggregation pipeline with message counts (NO N+1 QUERIES)
    const result = await Match.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user1',
          foreignField: '_id',
          as: 'user1',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user2',
          foreignField: '_id',
          as: 'user2',
          pipeline: [
            { $project: { firstName: 1, lastName: 1, email: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'pet1',
          foreignField: '_id',
          as: 'pet1',
          pipeline: [
            { $project: { name: 1, species: 1, photos: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'pets',
          localField: 'pet2',
          foreignField: '_id',
          as: 'pet2',
          pipeline: [
            { $project: { name: 1, species: 1, photos: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'matchId',
          as: 'messages',
          pipeline: [
            { $count: 'total' }
          ]
        }
      },
      {
        $addFields: {
          messageCount: {
            $ifNull: [
              { $arrayElemAt: ['$messages.total', 0] },
              0
            ]
          },
          user1: { $arrayElemAt: ['$user1', 0] },
          user2: { $arrayElemAt: ['$user2', 0] },
          pet1: { $arrayElemAt: ['$pet1', 0] },
          pet2: { $arrayElemAt: ['$pet2', 0] }
        }
      },
      {
        $project: {
          messages: 0 // Remove the messages array, keep only count
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Match.countDocuments(filter);

    res.json({
      success: true,
      data: {
        chats: result,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting all chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  getAllChats,
};
