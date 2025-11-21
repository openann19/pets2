export {};// Added to mark file as a module
const { z } = require('zod');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Report = require('../models/Report');
const Match = require('../models/Match');
const Story = require('../models/Story');
const Upload = require('../models/Upload');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Enhanced moderation schemas
const contentReviewSchema = z.object({
  contentId: z.string().min(1),
  contentType: z.enum(['pet', 'story', 'upload', 'message', 'user_profile']),
  action: z.enum(['approve', 'reject', 'quarantine', 'escalate']),
  reason: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  moderationLevel: z.enum(['automated', 'human_review', 'senior_review']).optional()
});

const bulkModerationSchema = z.object({
  contentIds: z.array(z.string()).min(1).max(50),
  contentType: z.enum(['pet', 'story', 'upload', 'message', 'user_profile']),
  action: z.enum(['approve', 'reject', 'quarantine', 'escalate']),
  reason: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional()
});

const moderationRuleSchema = z.object({
  name: z.string().min(1).max(100),
  contentType: z.enum(['pet', 'story', 'upload', 'message', 'user_profile']),
  conditions: z.object({
    keywords: z.array(z.string()).optional(),
    imageLabels: z.array(z.string()).optional(),
    userFlags: z.array(z.string()).optional(),
    reportThreshold: z.number().min(1).optional()
  }),
  action: z.enum(['flag', 'quarantine', 'reject', 'escalate']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  isActive: z.boolean().default(true)
});

// @desc    Get content review queue with priority sorting
// @route   GET /api/admin/moderation/queue
// @access  Admin
const getContentReviewQueue = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { status: 'pending' };

    // Apply filters
    if (req.query.contentType) {
      filter.contentType = req.query.contentType;
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.moderationLevel) {
      filter.moderationLevel = req.query.moderationLevel;
    }

    // Get pending reports for content review
    const reports = await Report.find(filter)
      .populate('reporterId', 'firstName lastName email')
      .populate('reportedUserId', 'firstName lastName email avatar isVerified')
      .populate('reportedPetId', 'name species photos breed age description')
      .populate('reportedMessageId')
      .sort({
        priority: -1, // urgent first
        submittedAt: 1, // oldest first
        'metadata.reportCount': -1 // most reported first
      })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Report.countDocuments(filter);

    // Enhance reports with additional context
    const enhancedReports = await Promise.all(reports.map(async (report) => {
      const enhanced = { ...report };

      // Add user/pet statistics
      if (report.reportedUserId) {
        const userStats = await getUserModerationStats(report.reportedUserId._id);
        enhanced.reportedUserStats = userStats;
      }

      if (report.reportedPetId) {
        const petStats = await getPetModerationStats(report.reportedPetId._id);
        enhanced.reportedPetStats = petStats;
      }

      // Add similar reports count
      const similarReports = await Report.countDocuments({
        _id: { $ne: report._id },
        $or: [
          { reportedUserId: report.reportedUserId },
          { reportedPetId: report.reportedPetId },
          { reportedMessageId: report.reportedMessageId }
        ],
        status: 'pending',
        submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      });

      enhanced.similarReportsCount = similarReports;
      enhanced.isOverdue = report.isOverdue?.() || false;

      return enhanced;
    }));

    res.json({
      success: true,
      data: {
        reports: enhancedReports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: await getModerationQueueStats()
      }
    });

  } catch (error) {
    logger.error('Get content review queue error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get content review queue'
    });
  }
};

// @desc    Review and moderate content
// @route   POST /api/admin/moderation/review
// @access  Admin
const reviewContent = async (req, res) => {
  try {
    const parsed = contentReviewSchema.parse(req.body);
    const { contentId, contentType, action, reason, notes } = parsed;

  let contentModel;
    switch (contentType) {
      case 'pet':
  contentModel = Pet;
        break;
      case 'story':
  contentModel = Story;
        break;
      case 'upload':
  contentModel = Upload;
        break;
      case 'user_profile':
  contentModel = User;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    // Find the content
    const content = await contentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Perform moderation action
    const moderationResult = await performModerationAction(content, contentType, action, reason, req.userId);

    // Update related reports
    await updateRelatedReports(contentId, contentType, action, reason, notes, req.userId);

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: `moderate_${contentType}`,
      resourceType: contentType,
      resourceId: contentId,
      details: {
        action,
        reason,
        notes,
        contentType,
        previousStatus: content.moderationStatus || 'active'
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Content ${contentId} moderated by admin ${req.userId}`, {
      contentType,
      action,
      reason
    });

    res.json({
      success: true,
      message: `Content ${action}d successfully`,
      data: {
        contentId,
        contentType,
        action,
        moderationResult
      }
    });

  } catch (error) {
    logger.error('Review content error', { error, userId: req.userId });
    const status = error.name === 'ZodError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: 'Failed to review content'
    });
  }
};

// @desc    Bulk moderate multiple content items
// @route   POST /api/admin/moderation/bulk-review
// @access  Admin
const bulkReviewContent = async (req, res) => {
  try {
    const parsed = bulkModerationSchema.parse(req.body);
    const { contentIds, contentType, action, reason, notes } = parsed;

    let contentModel;
    switch (contentType) {
      case 'pet':
        contentModel = Pet;
        break;
      case 'story':
        contentModel = Story;
        break;
      case 'upload':
        contentModel = Upload;
        break;
      case 'user_profile':
        contentModel = User;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    // Process bulk moderation
    const results = [];
    const errors = [];

    for (const contentId of contentIds) {
      try {
        const content = await contentModel.findById(contentId);
        if (!content) {
          errors.push({ contentId, error: 'Content not found' });
          continue;
        }

        const result = await performModerationAction(content, contentType, action, reason, req.userId);
        results.push({ contentId, result });

        // Update related reports
        await updateRelatedReports(contentId, contentType, action, reason, notes, req.userId);

      } catch (error) {
        errors.push({ contentId, error: error.message });
      }
    }

    // Log bulk admin action
    await AuditLog.create({
      adminId: req.userId,
      action: `bulk_moderate_${contentType}`,
      resourceType: contentType,
      details: {
        action,
        reason,
        notes,
        contentType,
        contentIds,
        resultsCount: results.length,
        errorsCount: errors.length
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Bulk moderation completed by admin ${req.userId}`, {
      contentType,
      action,
      processed: results.length,
      errors: errors.length
    });

    res.json({
      success: true,
      message: `Bulk moderation completed: ${results.length} processed, ${errors.length} errors`,
      data: {
        results,
        errors,
        summary: {
          processed: results.length,
          errors: errors.length,
          total: contentIds.length
        }
      }
    });

  } catch (error) {
    logger.error('Bulk review content error', { error, userId: req.userId });
    const status = error.name === 'ZodError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: 'Failed to perform bulk moderation'
    });
  }
};

// @desc    Create automated moderation rule
// @route   POST /api/admin/moderation/rules
// @access  Admin
const createModerationRule = async (req, res) => {
  try {
    const parsed = moderationRuleSchema.parse(req.body);

    // In a real implementation, this would save to a ModerationRule model
    // For now, we'll just validate and return success
    const rule = {
      _id: Date.now().toString(),
      ...parsed,
      createdBy: req.userId,
      createdAt: new Date()
    };

    // Log rule creation
    await AuditLog.create({
      adminId: req.userId,
      action: 'create_moderation_rule',
      resourceType: 'moderation_rule',
      details: {
        ruleName: parsed.name,
        contentType: parsed.contentType,
        action: parsed.action,
        severity: parsed.severity
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Moderation rule created by admin ${req.userId}`, {
      ruleName: parsed.name,
      contentType: parsed.contentType
    });

    res.status(201).json({
      success: true,
      message: 'Moderation rule created successfully',
      data: rule
    });

  } catch (error) {
    logger.error('Create moderation rule error', { error, userId: req.userId });
    const status = error.name === 'ZodError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: 'Failed to create moderation rule'
    });
  }
};

// @desc    Get moderation analytics and statistics
// @route   GET /api/admin/moderation/analytics
// @access  Admin
const getModerationAnalytics = async (req, res) => {
  try {
    const period = req.query.period || '7d'; // 1d, 7d, 30d
    const periodDays = period === '1d' ? 1 : period === '30d' ? 30 : 7;

    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Report statistics
    const reportStats = await Report.aggregate([
      { $match: { submittedAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $cond: {
                if: { $ne: ['$resolvedAt', null] },
                then: { $subtract: ['$resolvedAt', '$submittedAt'] },
                else: null
              }
            }
          }
        }
      }
    ]);

    // Content moderation statistics
    const contentStats = {
      petsModerated: await Pet.countDocuments({
        moderatedAt: { $gte: startDate }
      }),
      storiesModerated: await Story.countDocuments({
        moderatedAt: { $gte: startDate }
      }),
      uploadsModerated: await Upload.countDocuments({
        moderatedAt: { $gte: startDate }
      })
    };

    // Admin activity
    const adminActivity = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          action: { $regex: '^moderate_|^bulk_moderate_' }
        }
      },
      {
        $group: {
          _id: '$adminId',
          actions: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      { $unwind: '$admin' },
      {
        $project: {
          adminName: { $concat: ['$admin.firstName', ' ', '$admin.lastName'] },
          actions: 1,
          lastActivity: 1
        }
      }
    ]);

    // Top reported content types
    const topReportTypes = await Report.aggregate([
      { $match: { submittedAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        period,
        reportStats,
        contentStats,
        adminActivity,
        topReportTypes,
        summary: {
          totalReports: reportStats.reduce((sum, stat) => sum + stat.count, 0),
          resolvedReports: reportStats.find(s => s._id === 'resolved')?.count || 0,
          pendingReports: reportStats.find(s => s._id === 'pending')?.count || 0,
          avgResolutionTime: reportStats.find(s => s._id === 'resolved')?.avgResolutionTime || 0
        }
      }
    });

  } catch (error) {
    logger.error('Get moderation analytics error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation analytics'
    });
  }
};

// @desc    Get content quarantine queue
// @route   GET /api/admin/moderation/quarantine
// @access  Admin
const getQuarantineQueue = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get quarantined content from different models
    const quarantinedPets = await Pet.find({ moderationStatus: 'quarantined' })
      .populate('owner', 'firstName lastName email')
      .select('name species photos quarantineReason quarantinedAt')
      .sort({ quarantinedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const quarantinedStories = await Story.find({ moderationStatus: 'quarantined' })
      .populate('author', 'firstName lastName email')
      .select('title content media quarantineReason quarantinedAt')
      .sort({ quarantinedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Combine and sort by quarantine date
    const allQuarantined = [
      ...quarantinedPets.map(item => ({ ...item, contentType: 'pet' })),
      ...quarantinedStories.map(item => ({ ...item, contentType: 'story' }))
    ].sort((a, b) => new Date(b.quarantinedAt) - new Date(a.quarantinedAt));

    const total = quarantinedPets.length + quarantinedStories.length;

    res.json({
      success: true,
      data: {
        quarantined: allQuarantined.slice(skip, skip + limit),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Get quarantine queue error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to get quarantine queue'
    });
  }
};

// @desc    Release content from quarantine
// @route   POST /api/admin/moderation/quarantine/:contentId/release
// @access  Admin
const releaseFromQuarantine = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { contentType, reason, notes } = req.body;

    let contentModel;
    switch (contentType) {
      case 'pet':
        contentModel = Pet;
        break;
      case 'story':
        contentModel = Story;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    const content = await contentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Release from quarantine
    content.moderationStatus = 'approved';
    content.quarantineReason = null;
    content.quarantinedAt = null;
    content.releasedAt = new Date();
    content.releasedBy = req.userId;
    content.releaseReason = reason;
    content.releaseNotes = notes;

    await content.save();

    // Log admin action
    await AuditLog.create({
      adminId: req.userId,
      action: 'release_from_quarantine',
      resourceType: contentType,
      resourceId: contentId,
      details: {
        reason,
        notes,
        quarantineDuration: content.releasedAt - content.quarantinedAt
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Content ${contentId} released from quarantine by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Content released from quarantine successfully'
    });

  } catch (error) {
    logger.error('Release from quarantine error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to release from quarantine'
    });
  }
};

// Helper functions
async function performModerationAction(content, contentType, action, reason, adminId) {
  const now = new Date();

  switch (action) {
    case 'approve':
      content.moderationStatus = 'approved';
      content.moderatedAt = now;
      content.moderatedBy = adminId;
      content.moderationReason = reason;
      break;

    case 'reject':
      content.moderationStatus = 'rejected';
      content.moderatedAt = now;
      content.moderatedBy = adminId;
      content.moderationReason = reason;
      content.isActive = false;
      break;

    case 'quarantine':
      content.moderationStatus = 'quarantined';
      content.quarantinedAt = now;
      content.quarantinedBy = adminId;
      content.quarantineReason = reason;
      content.isActive = false;
      break;

    case 'escalate':
      content.moderationStatus = 'escalated';
      content.escalatedAt = now;
      content.escalatedBy = adminId;
      content.escalationReason = reason;
      break;
  }

  await content.save();
  return { status: content.moderationStatus, moderatedAt: now };
}

async function updateRelatedReports(contentId, contentType, action, reason, notes, adminId) {
  let fieldName;
  switch (contentType) {
    case 'pet':
      fieldName = 'reportedPetId';
      break;
    case 'story':
      fieldName = 'reportedStoryId';
      break;
    case 'upload':
      fieldName = 'reportedUploadId';
      break;
    case 'user_profile':
      fieldName = 'reportedUserId';
      break;
    default:
      return;
  }

  const resolutionMap = {
    approve: 'no_violation',
    reject: 'content_removed',
    quarantine: 'content_removed',
    escalate: 'escalated'
  };

  const actionMap = {
    approve: 'none',
    reject: 'content_removal',
    quarantine: 'account_restriction',
    escalate: 'other'
  };

  await Report.updateMany(
    { [fieldName]: contentId, status: { $in: ['pending', 'under_review'] } },
    {
      $set: {
        status: action === 'escalate' ? 'escalated' : 'resolved',
        resolvedAt: new Date(),
        resolvedBy: adminId,
        resolution: resolutionMap[action],
        actionTaken: actionMap[action],
        actionDetails: `${action}: ${reason}${notes ? ` - ${notes}` : ''}`,
        resolutionNotes: notes
      }
    }
  );
}

async function getUserModerationStats(userId) {
  const [reportCount, contentStats] = await Promise.all([
    Report.countDocuments({
      reportedUserId: userId,
      submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }),
    Promise.all([
      Pet.countDocuments({ owner: userId, moderationStatus: 'rejected' }),
      Story.countDocuments({ author: userId, moderationStatus: 'rejected' }),
      Upload.countDocuments({ userId, status: 'rejected' })
    ])
  ]);

  return {
    reportsLast30Days: reportCount,
    rejectedPets: contentStats[0],
    rejectedStories: contentStats[1],
    rejectedUploads: contentStats[2]
  };
}

async function getPetModerationStats(petId) {
  const [reportCount, matchCount] = await Promise.all([
    Report.countDocuments({
      reportedPetId: petId,
      submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }),
    Match.countDocuments({
      $or: [{ pet1: petId }, { pet2: petId }],
      status: 'active'
    })
  ]);

  return {
    reportsLast30Days: reportCount,
    activeMatches: matchCount
  };
}

async function getModerationQueueStats() {
  const [pendingReports, urgentReports, overdueReports] = await Promise.all([
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments({ status: 'pending', priority: 'urgent' }),
    Report.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'under_review'] }
        }
      },
      {
        $addFields: {
          isOverdue: {
            $cond: {
              if: {
                $or: [
                  { $and: [{ $eq: ['$priority', 'urgent'] }, { $lt: ['$submittedAt', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)] }] },
                  { $and: [{ $eq: ['$priority', 'high'] }, { $lt: ['$submittedAt', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)] }] },
                  { $and: [{ $eq: ['$priority', 'medium'] }, { $lt: ['$submittedAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }] },
                  { $and: [{ $eq: ['$priority', 'low'] }, { $lt: ['$submittedAt', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)] }] }
                ]
              },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $match: { isOverdue: true }
      },
      {
        $count: 'overdueCount'
      }
    ])
  ]);

  return {
    pendingReports,
    urgentReports,
    overdueReports: overdueReports[0]?.overdueCount || 0
  };
}

module.exports = {
  getContentReviewQueue,
  reviewContent,
  bulkReviewContent,
  createModerationRule,
  getModerationAnalytics,
  getQuarantineQueue,
  releaseFromQuarantine
};
