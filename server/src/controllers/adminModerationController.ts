/**
 * Admin Moderation Controller
 * Handles content review, quarantining, and moderation rules
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import logger from '../utils/logger';
import { getErrorMessage } from '../../utils/errorHandler';

// Type definitions for MongoDB lean documents
interface LeanUser {
  _id: unknown;
  email?: string;
  bio?: string;
  flaggedBy?: string[];
  flagCount?: number;
  createdAt?: Date;
  moderationStatus?: string;
}

interface LeanPet {
  _id: unknown;
  name?: string;
  bio?: string;
  flaggedBy?: string[];
  flagCount?: number;
  createdAt?: Date;
  moderationStatus?: string;
}

interface LeanPost {
  _id: unknown;
  content?: string;
  userId?: { firstName?: string; lastName?: string; _id?: unknown };
  flaggedBy?: string[];
  flagCount?: number;
  createdAt?: Date;
  moderationStatus?: string;
  updatedAt?: Date;
  quarantinedAt?: Date;
  quarantineReason?: string;
}

interface LeanMessage {
  _id: unknown;
  content?: string;
  sender?: { firstName?: string; lastName?: string; _id?: unknown };
  recipient?: { firstName?: string; lastName?: string; _id?: unknown };
  flagged?: boolean;
  flaggedBy?: string[];
  flagCount?: number;
  createdAt?: Date;
  moderationStatus?: string;
  updatedAt?: Date;
  quarantinedAt?: Date;
  quarantineReason?: string;
}

interface ModerationFilter {
  moderationStatus?: string;
  type?: string;
}

interface DateFilter {
  $gte?: Date;
  $lte?: Date;
}

interface BulkUpdateData {
  moderatedAt: Date;
  moderatedBy?: string;
  moderationStatus?: string;
  flagged?: boolean;
  flaggedBy?: string[];
  flagCount?: number;
  rejectionReason?: string;
  bannedReason?: string;
  bannedAt?: Date;
  bannedBy?: string;
}

interface AggregationStats {
  _id: string | null;
  count: number;
}

interface StatusCounts {
  approved: number;
  flagged: number;
  rejected: number;
  banned: number;
}

/**
 * Get content review queue
 */
export const getContentReviewQueue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const CommunityPost = require('../models/CommunityPost');
    const Message = require('../models/Message');
    
    const { type, status, limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter
    const filter: ModerationFilter = {};
    if (status) filter.moderationStatus = String(status);
    if (type === 'user') filter.type = 'user';
    if (type === 'pet') filter.type = 'pet';
    if (type === 'post') filter.type = 'post';
    if (type === 'message') filter.type = 'message';
    
    // Aggregate content needing review from various sources
    const [flaggedUsers, flaggedPets, flaggedPosts, flaggedMessages] = await Promise.all([
      User.find({ moderationStatus: 'flagged' }).limit(Number(limit) / 4).lean(),
      Pet.find({ moderationStatus: 'flagged' }).limit(Number(limit) / 4).lean(),
      CommunityPost.find({ moderationStatus: 'flagged' }).populate('userId', 'firstName lastName').limit(Number(limit) / 4).lean(),
      Message.find({ flagged: true }).populate('sender recipient', 'firstName lastName').limit(Number(limit) / 4).lean()
    ]);
    
    const queue = [
      ...flaggedUsers.map((u: LeanUser) => ({
        id: u._id,
        type: 'user',
        content: { email: u.email, bio: u.bio },
        reportedBy: u.flaggedBy || [],
        reportCount: u.flagCount || 0,
        createdAt: u.createdAt,
        moderationStatus: u.moderationStatus
      })),
      ...flaggedPets.map((p: LeanPet) => ({
        id: p._id,
        type: 'pet',
        content: { name: p.name, bio: p.bio },
        reportedBy: p.flaggedBy || [],
        reportCount: p.flagCount || 0,
        createdAt: p.createdAt,
        moderationStatus: p.moderationStatus
      })),
      ...flaggedPosts.map((p: LeanPost) => ({
        id: p._id,
        type: 'post',
        content: { text: p.content, author: p.userId },
        reportedBy: p.flaggedBy || [],
        reportCount: p.flagCount || 0,
        createdAt: p.createdAt,
        moderationStatus: p.moderationStatus
      })),
      ...flaggedMessages.map((m: LeanMessage) => ({
        id: m._id,
        type: 'message',
        content: { text: m.content, sender: m.sender, recipient: m.recipient },
        reportedBy: m.flaggedBy || [],
        reportCount: m.flagCount || 0,
        createdAt: m.createdAt,
        moderationStatus: m.flagged ? 'flagged' : 'approved'
      }))
    ];
    
    // Sort by report count and date
    queue.sort((a, b) => {
      if (b.reportCount !== a.reportCount) return b.reportCount - a.reportCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    res.json({
      success: true,
      queue: queue.slice(skip, skip + Number(limit)),
      total: queue.length,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: unknown) {
    logger.error('Error getting content review queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get content review queue'
    });
  }
};

/**
 * Review content
 */
export const reviewContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentId, contentType, action, reason } = req.body;
    
    if (!contentId || !contentType || !action) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: contentId, contentType, action'
      });
      return;
    }
    
    let Model;
    switch (contentType) {
      case 'user':
        Model = require('../models/User');
        break;
      case 'pet':
        Model = require('../models/Pet');
        break;
      case 'post':
        Model = require('../models/CommunityPost');
        break;
      case 'message':
        Model = require('../models/Message');
        break;
      default:
        res.status(400).json({ success: false, message: 'Invalid content type' });
        return;
    }
    
    const content = await Model.findById(contentId);
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    
    // Update moderation status based on action
    if (action === 'approve') {
      content.moderationStatus = 'approved';
      content.flagged = false;
      content.flaggedBy = [];
      content.flagCount = 0;
    } else if (action === 'reject' || action === 'remove') {
      content.moderationStatus = 'rejected';
      content.rejectionReason = reason;
      content.moderatedAt = new Date();
      content.moderatedBy = req.userId;
    } else if (action === 'ban') {
      content.moderationStatus = 'banned';
      content.bannedReason = reason;
      content.bannedAt = new Date();
      content.bannedBy = req.userId;
      
      // If banning a user, also ban all their content
      if (contentType === 'user') {
        const Pet = require('../models/Pet');
        const CommunityPost = require('../models/CommunityPost');
        await Promise.all([
          Pet.updateMany({ ownerId: contentId }, { moderationStatus: 'banned' }),
          CommunityPost.updateMany({ userId: contentId }, { moderationStatus: 'banned' })
        ]);
      }
    }
    
    await content.save();
    
    logger.info(`Content reviewed: ${contentType}:${contentId} -> ${action}`, {
      moderatedBy: req.userId,
      reason
    });
    
    res.json({
      success: true,
      message: 'Content reviewed successfully',
      data: { contentId, action, moderationStatus: content.moderationStatus }
    });
  } catch (error: unknown) {
    logger.error('Error reviewing content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review content'
    });
  }
};

/**
 * Bulk review content
 */
export const bulkReviewContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentIds, contentType, action, reason } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || !contentType || !action) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: contentIds (array), contentType, action'
      });
      return;
    }
    
    let Model;
    switch (contentType) {
      case 'user':
        Model = require('../models/User');
        break;
      case 'pet':
        Model = require('../models/Pet');
        break;
      case 'post':
        Model = require('../models/CommunityPost');
        break;
      case 'message':
        Model = require('../models/Message');
        break;
      default:
        res.status(400).json({ success: false, message: 'Invalid content type' });
        return;
    }
    
    const updateData: BulkUpdateData = {
      
      moderatedAt: new Date(),
      moderatedBy: req.userId
    };
    
    if (action === 'approve') {
      updateData.moderationStatus = 'approved';
      updateData.flagged = false;
      updateData.flaggedBy = [];
      updateData.flagCount = 0;
    } else if (action === 'reject' || action === 'remove') {
      updateData.moderationStatus = 'rejected';
      updateData.rejectionReason = reason;
    } else if (action === 'ban') {
      updateData.moderationStatus = 'banned';
      updateData.bannedReason = reason;
      updateData.bannedAt = new Date();
      updateData.bannedBy = req.userId;
    }
    
    const result = await Model.updateMany(
      { _id: { $in: contentIds } },
      { $set: updateData }
    );
    
    logger.info(`Bulk content review: ${contentType} x${contentIds.length} -> ${action}`, {
      moderatedBy: req.userId,
      reason,
      modifiedCount: result.modifiedCount
    });
    
    res.json({
      success: true,
      message: `Successfully reviewed ${result.modifiedCount} items`,
      data: {
        processed: contentIds.length,
        modified: result.modifiedCount,
        action
      }
    });
  } catch (error: unknown) {
    logger.error('Error bulk reviewing content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk review content'
    });
  }
};

/**
 * Create moderation rule
 */
export const createModerationRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, pattern, action, severity, enabled = true } = req.body;
    
    if (!name || !type || !pattern || !action) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: name, type, pattern, action'
      });
      return;
    }
    
    const ModerationRule = require('../models/ModerationRule');
    
    const rule = await ModerationRule.create({
      name,
      type, // 'keyword', 'regex', 'ai', 'manual'
      pattern, // The pattern to match or AI prompt
      action, // 'flag', 'auto-remove', 'quarantine', 'notify'
      severity: severity || 'medium',
      enabled,
      createdBy: req.userId,
      createdAt: new Date()
    });
    
    logger.info(`Moderation rule created: ${name}`, {
      createdBy: req.userId,
      type,
      action
    });
    
    res.json({
      success: true,
      message: 'Moderation rule created successfully',
      data: rule
    });
  } catch (error: unknown) {
    logger.error('Error creating moderation rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create moderation rule'
    });
  }
};

/**
 * Get moderation analytics
 */
export const getModerationAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter: DateFilter = {};
    
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);
    
    const User = require('../models/User');
    const Pet = require('../models/Pet');
    const CommunityPost = require('../models/CommunityPost');
    const Message = require('../models/Message');
    
    // Get aggregated counts
    const [userStats, petStats, postStats, messageStats] = await Promise.all([
      User.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
        {
          $group: {
            _id: '$moderationStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      Pet.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
        {
          $group: {
            _id: '$moderationStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      CommunityPost.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
        {
          $group: {
            _id: '$moderationStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      Message.countDocuments({ flagged: true, ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}) })
    ]);
    
    const statusCounts = (stats: AggregationStats[]): StatusCounts => {
      const counts: StatusCounts = { approved: 0, flagged: 0, rejected: 0, banned: 0 };
      stats.forEach(s => {
        if (s._id && s._id in counts) {
          counts[s._id as keyof StatusCounts] = s.count;
        }
      });
      return counts;
    };
    
    const analytics = {
      overview: {
        totalReviewed: userStats.reduce((sum, s) => sum + s.count, 0) +
                      petStats.reduce((sum, s) => sum + s.count, 0) +
                      postStats.reduce((sum, s) => sum + s.count, 0) +
                      messageStats,
        totalFlagged: (userStats.find(s => s._id === 'flagged')?.count || 0) +
                     (petStats.find(s => s._id === 'flagged')?.count || 0) +
                     (postStats.find(s => s._id === 'flagged')?.count || 0) +
                     messageStats,
        totalApproved: (userStats.find(s => s._id === 'approved')?.count || 0) +
                      (petStats.find(s => s._id === 'approved')?.count || 0) +
                      (postStats.find(s => s._id === 'approved')?.count || 0),
        totalRejected: (userStats.find(s => s._id === 'rejected')?.count || 0) +
                      (petStats.find(s => s._id === 'rejected')?.count || 0) +
                      (postStats.find(s => s._id === 'rejected')?.count || 0),
        totalBanned: (userStats.find(s => s._id === 'banned')?.count || 0) +
                    (petStats.find(s => s._id === 'banned')?.count || 0) +
                    (postStats.find(s => s._id === 'banned')?.count || 0)
      },
      byContentType: {
        users: statusCounts(userStats),
        pets: statusCounts(petStats),
        posts: statusCounts(postStats),
        messages: { flagged: messageStats }
      },
      dateRange: {
        startDate: startDate || 'all time',
        endDate: endDate || 'now'
      }
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error: unknown) {
    logger.error('Error getting moderation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get moderation analytics'
    });
  }
};

/**
 * Get quarantine queue
 */
export const getQuarantineQueue = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const CommunityPost = require('../models/CommunityPost');
    const Message = require('../models/Message');
    
    // Get quarantined content (content that's been flagged but awaiting review)
    const [quarantinedPosts, quarantinedMessages] = await Promise.all([
      CommunityPost.find({ moderationStatus: 'quarantined' })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean(),
      Message.find({ moderationStatus: 'quarantined' })
        .populate('sender recipient', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean()
    ]);
    
    const queue = [
      ...quarantinedPosts.map((p: LeanPost) => ({
        id: p._id,
        type: 'post',
        content: p.content,
        author: p.userId,
        createdAt: p.createdAt,
        quarantinedAt: p.quarantinedAt || p.updatedAt,
        reason: p.quarantineReason,
        flagCount: p.flagCount || 0
      })),
      ...quarantinedMessages.map((m: LeanMessage) => ({
        id: m._id,
        type: 'message',
        content: m.content,
        sender: m.sender,
        recipient: m.recipient,
        createdAt: m.createdAt,
        quarantinedAt: m.quarantinedAt || m.updatedAt,
        reason: m.quarantineReason,
        flagCount: m.flagCount || 0
      }))
    ];
    
    queue.sort((a, b) => new Date(b.quarantinedAt).getTime() - new Date(a.quarantinedAt).getTime());
    
    res.json({
      success: true,
      queue,
      total: queue.length
    });
  } catch (error: unknown) {
    logger.error('Error getting quarantine queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quarantine queue'
    });
  }
};

/**
 * Release from quarantine
 */
export const releaseFromQuarantine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentId, contentType, action } = req.body;
    
    if (!contentId || !contentType || !action) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: contentId, contentType, action'
      });
      return;
    }
    
    let Model;
    if (contentType === 'post') {
      Model = require('../models/CommunityPost');
    } else if (contentType === 'message') {
      Model = require('../models/Message');
    } else {
      res.status(400).json({ success: false, message: 'Invalid content type' });
      return;
    }
    
    const content = await Model.findById(contentId);
    if (!content) {
      res.status(404).json({ success: false, message: 'Content not found' });
      return;
    }
    
    if (action === 'release') {
      content.moderationStatus = 'approved';
      content.quarantinedAt = undefined;
      content.quarantineReason = undefined;
    } else if (action === 'delete') {
      content.moderationStatus = 'rejected';
      content.deletedAt = new Date();
    }
    
    content.reviewedBy = req.userId;
    content.reviewedAt = new Date();
    await content.save();
    
    logger.info(`Content released from quarantine: ${contentType}:${contentId} -> ${action}`, {
      reviewedBy: req.userId
    });
    
    res.json({
      success: true,
      message: `Content ${action === 'release' ? 'released' : 'deleted'} successfully`,
      data: { contentId, action }
    });
  } catch (error: unknown) {
    logger.error('Error releasing from quarantine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release from quarantine'
    });
  }
};

