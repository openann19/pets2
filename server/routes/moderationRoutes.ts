/**
 * Moderation API Routes
 * Admin endpoints for photo moderation review
 */

import express, { Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import PhotoModeration from '../models/PhotoModeration';
import { authenticateToken, requireAdmin } from '../src/middleware/auth';
import logger from '../src/utils/logger';
import cloudinary from 'cloudinary';

const { v2 } = cloudinary;

// Get Socket.io instance (will be set by server.js)
let io: any = null;
export const setSocketIO = (socketIO: any) => { io = socketIO; };

// Emit queue update event
const emitQueueUpdate = async () => {
  if (!io) return;
  try {
    const stats = await PhotoModeration.getQueueStats();
    io.to('moderation-queue').emit('queue:update', { stats });
  } catch (error: any) {
    logger.error('Failed to emit queue update', { error: error.message });
  }
};

const router: Router = express.Router();

// Middleware: All moderation routes require admin access
// In test environment, allow tests to inject a mock admin user and bypass auth
if (process.env.NODE_ENV === 'test') {
  router.use((req: any, _res: Response, next) => {
    if (!req.user) {
      // Use a valid ObjectId-like string for compatibility with ObjectId fields
      req.user = { _id: '000000000000000000000001', email: 'admin@test.local', isAdmin: true, role: 'administrator' };
    }
    next();
  });
} else {
  router.use(authenticateToken);
  router.use(requireAdmin);
}

/**
 * GET /api/moderation/queue
 * Get moderation queue with filters
 */
router.get('/queue', async (req: Request, res: Response) => {
  try {
    const {
      status = 'pending',
      priority,
      limit = 50,
      skip = 0,
      sortBy = 'uploadedAt',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query: any = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Execute query with pagination
    const items = await PhotoModeration.find(query)
      .sort({
        priority: sortOrder === 'asc' ? 1 : -1,
        [sortBy as string]: sortOrder === 'asc' ? 1 : -1
      })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string))
      .populate('userId', 'name email profilePhoto')
      .populate('reviewedBy', 'name email')
      .lean();

    const total = await PhotoModeration.countDocuments(query);

    res.json({
      success: true,
      items,
      pagination: {
        total,
        limit: parseInt(limit as string),
        skip: parseInt(skip as string),
        hasMore: total > parseInt(skip as string) + parseInt(limit as string)
      }
    });

  } catch (error: any) {
    logger.error('Failed to fetch moderation queue', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation queue',
      error: error.message
    });
  }
});

/**
 * GET /api/moderation/stats
 * Get moderation statistics
 */
router.get('/stats', async (req: any, res: Response) => {
  try {
    const stats = await PhotoModeration.getQueueStats();

    // Get moderator performance stats
    const moderatorStats = await PhotoModeration.getModeratorStats(req.user._id, 30);

    // Get average review time
    const avgReviewTime = await PhotoModeration.aggregate([
      {
        $match: {
          status: { $in: ['approved', 'rejected'] },
          reviewedAt: { $exists: true }
        }
      },
      {
        $project: {
          reviewTime: {
            $subtract: ['$reviewedAt', '$uploadedAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$reviewTime' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        queue: stats,
        moderator: moderatorStats,
        avgReviewTimeMs: avgReviewTime[0]?.avgTime || 0,
        avgReviewTimeHours: avgReviewTime[0] ? (avgReviewTime[0].avgTime / (1000 * 60 * 60)).toFixed(2) : 0
      }
    });

  } catch (error: any) {
    logger.error('Failed to fetch moderation stats', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

/**
 * POST /api/moderation/:id/approve
 * Approve a photo
 */
router.post('/:id/approve', async (req: any, res: Response) => {
  try {
    const { notes } = req.body;
    const moderationId = req.params.id;

    // Atomic update with status precondition
    const moderation = await PhotoModeration.findOneAndUpdate(
      {
        _id: moderationId,
        status: { $in: ['pending', 'under-review'] }
      },
      {
        $set: {
          status: 'approved',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          reviewNotes: notes || 'Approved by moderator'
        }
      },
      { new: true }
    ).populate('userId', 'name email profilePhoto');

    if (!moderation) {
      // Either doesn't exist or already moderated
      const existing = await PhotoModeration.findById(moderationId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Moderation record not found'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Record already moderated',
        currentStatus: existing.status
      });
    }

    // Move photo from temp/queue to permanent storage
    if ((moderation.cloudinaryPublicId as string).includes('temp') ||
      (moderation.cloudinaryPublicId as string).includes('moderation-queue')) {
      try {
        const newPublicId = (moderation.cloudinaryPublicId as string)
          .replace('temp/', 'approved/')
          .replace('moderation-queue/', 'approved/');

        await v2.uploader.rename(
          moderation.cloudinaryPublicId as string,
          newPublicId
        );

        moderation.cloudinaryPublicId = newPublicId;
        // Also update photoUrl to match the renamed resource
        moderation.photoUrl = v2.url(newPublicId, { secure: true });
        await moderation.save();
      } catch (cloudinaryError: any) {
        logger.warn('Failed to move photo to approved folder', {
          error: cloudinaryError.message,
          moderationId
        });
      }
    }

    // Notify user
    await notifyUserPhotoApproved(moderation.userId as Types.ObjectId, moderation);

    // Audit log
    logger.info('Photo approved', {
      action: 'moderation.approve',
      moderationId,
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      userId: moderation.userId,
      requestId: req.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Emit real-time update
    await emitQueueUpdate();

    res.json({
      success: true,
      message: 'Photo approved',
      moderation
    });

  } catch (error: any) {
    logger.error('Failed to approve photo', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to approve photo',
      error: error.message
    });
  }
});

/**
 * POST /api/moderation/:id/reject
 * Reject a photo
 */
router.post('/:id/reject', async (req: any, res: Response) => {
  try {
    const { reason, category, notes } = req.body;
    const moderationId = req.params.id;

    if (!reason || !category) {
      return res.status(400).json({
        success: false,
        message: 'Reason and category are required'
      });
    }

    // Validate category against allowed set
    const allowed = new Set(['explicit', 'violence', 'self-harm', 'drugs', 'hate-speech', 'spam', 'other']);
    if (!allowed.has(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rejection category'
      });
    }

    // Atomic update with status precondition
    const moderation = await PhotoModeration.findOneAndUpdate(
      {
        _id: moderationId,
        status: { $in: ['pending', 'under-review'] }
      },
      {
        $set: {
          status: 'rejected',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          rejectionReason: reason,
          rejectionCategory: category,
          reviewNotes: notes || `Rejected as ${category}`
        }
      },
      { new: true }
    ).populate('userId', 'name email profilePhoto');

    if (!moderation) {
      const existing = await PhotoModeration.findById(moderationId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Moderation record not found'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'Record already moderated',
        currentStatus: existing.status
      });
    }

    // Delete photo from Cloudinary
    try {
      await v2.uploader.destroy(moderation.cloudinaryPublicId as string);
      logger.info('Photo deleted from Cloudinary', {
        publicId: moderation.cloudinaryPublicId
      });
    } catch (cloudinaryError: any) {
      logger.warn('Failed to delete photo from Cloudinary', {
        error: cloudinaryError.message,
        publicId: moderation.cloudinaryPublicId
      });
    }

    // Notify user
    await notifyUserPhotoRejected(moderation.userId as Types.ObjectId, moderation, reason, category);

    // Audit log
    logger.info('Photo rejected', {
      action: 'moderation.reject',
      moderationId,
      moderatorId: req.user._id,
      moderatorEmail: req.user.email,
      userId: moderation.userId,
      category,
      reason,
      requestId: req.id,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Emit real-time update
    await emitQueueUpdate();

    res.json({
      success: true,
      message: 'Photo rejected',
      moderation
    });

  } catch (error: any) {
    logger.error('Failed to reject photo', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to reject photo',
      error: error.message
    });
  }
});

/**
 * POST /api/moderation/:id/flag
 * Flag photo for additional review
 */
router.post('/:id/flag', async (req: any, res: Response) => {
  try {
    const { notes, newPriority } = req.body;
    const moderationId = req.params.id;

    const moderation = await PhotoModeration.findById(moderationId);

    if (!moderation) {
      return res.status(404).json({
        success: false,
        message: 'Moderation record not found'
      });
    }

    moderation.status = 'under-review';
    if (newPriority) {
      moderation.priority = newPriority;
    }
    if (notes) {
      moderation.reviewNotes = notes;
    }

    await moderation.save();

    logger.info('Photo flagged for review', {
      moderationId,
      moderatorId: req.user._id,
      priority: moderation.priority
    });

    res.json({
      success: true,
      message: 'Photo flagged for review',
      moderation
    });

  } catch (error: any) {
    logger.error('Failed to flag photo', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to flag photo',
      error: error.message
    });
  }
});

/**
 * GET /api/moderation/:id
 * Get detailed moderation record
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const moderation = await PhotoModeration.findById(req.params.id)
      .populate('userId', 'name email profilePhoto createdAt')
      .populate('reviewedBy', 'name email')
      .populate('appeal.reviewedBy', 'name email');

    if (!moderation) {
      return res.status(404).json({
        success: false,
        message: 'Moderation record not found'
      });
    }

    res.json({
      success: true,
      moderation
    });

  } catch (error: any) {
    logger.error('Failed to fetch moderation record', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch moderation record',
      error: error.message
    });
  }
});

/**
 * POST /api/moderation/batch-approve
 * Batch approve multiple photos
 */
router.post('/batch-approve', async (req: any, res: Response) => {
  try {
    const { ids, notes } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'IDs array is required'
      });
    }

    const results = [];

    for (const id of ids) {
      try {
        const moderation = await PhotoModeration.findById(id);
        if (moderation) {
          await (moderation as any).approve(req.user._id, notes);
          results.push({ id, success: true });
        } else {
          results.push({ id, success: false, error: 'Not found' });
        }
      } catch (error: any) {
        results.push({ id, success: false, error: error.message });
      }
    }

    logger.info('Batch approval completed', {
      total: ids.length,
      successful: results.filter(r => r.success).length,
      moderatorId: req.user._id
    });

    res.json({
      success: true,
      message: `Approved ${results.filter(r => r.success).length} of ${ids.length} photos`,
      results
    });

  } catch (error: any) {
    logger.error('Batch approval failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Batch approval failed',
      error: error.message
    });
  }
});

// Helper functions

async function notifyUserPhotoApproved(userId: Types.ObjectId, moderation: any) {
  try {
    const Notification = require('../src/models/Notification');
    const User = require('../src/models/User');
    
    const user = await User.findById(userId);
    if (!user) {
      logger.warn('Cannot notify user - user not found', { userId });
      return;
    }

    // Create notification record
    const notification = new Notification({
      userId: userId,
      type: 'system',
      title: 'Photo Approved',
      body: 'Your photo has been approved and is now visible on your profile.',
      data: {
        moderationId: moderation._id,
        photoUrl: moderation.photoUrl,
        action: 'approved'
      },
      priority: 'normal',
      actionUrl: '/profile'
    });

    await notification.save();

    // Attempt to send push notification if user has push token
    try {
      const { sendPushToUser } = require('../src/services/pushNotificationService');
      await sendPushToUser(userId.toString(), {
        title: 'Photo Approved',
        body: 'Your photo has been approved and is now visible on your profile.',
        data: {
          type: 'photo_approved',
          moderationId: moderation._id.toString()
        }
      });
    } catch (pushError: any) {
      // Push notification is optional, log but don't fail
      logger.debug('Push notification failed for photo approval', { 
        userId, 
        error: pushError.message 
      });
    }

    logger.info('User notification: photo approved', { 
      userId, 
      moderationId: moderation._id,
      notificationId: notification._id 
    });
  } catch (error: any) {
    logger.error('Failed to send photo approval notification', { 
      userId, 
      error: error.message 
    });
  }
}

async function notifyUserPhotoRejected(userId: Types.ObjectId, moderation: any, reason: string, category: string) {
  try {
    const Notification = require('../src/models/Notification');
    const User = require('../src/models/User');
    
    const user = await User.findById(userId);
    if (!user) {
      logger.warn('Cannot notify user - user not found', { userId });
      return;
    }

    // Create notification record
    const notification = new Notification({
      userId: userId,
      type: 'system',
      title: 'Photo Rejected',
      body: `Your photo was rejected: ${reason}. Category: ${category}. Please review our community guidelines.`,
      data: {
        moderationId: moderation._id,
        reason,
        category,
        action: 'rejected'
      },
      priority: 'high',
      actionUrl: '/profile/settings'
    });

    await notification.save();

    // Attempt to send push notification if user has push token
    try {
      const { sendPushToUser } = require('../src/services/pushNotificationService');
      await sendPushToUser(userId.toString(), {
        title: 'Photo Rejected',
        body: `Your photo was rejected: ${reason}. Please review our community guidelines.`,
        data: {
          type: 'photo_rejected',
          moderationId: moderation._id.toString(),
          category
        }
      });
    } catch (pushError: any) {
      // Push notification is optional, log but don't fail
      logger.debug('Push notification failed for photo rejection', { 
        userId, 
        error: pushError.message 
      });
    }

    logger.info('User notification: photo rejected', { 
      userId, 
      moderationId: moderation._id, 
      category,
      reason,
      notificationId: notification._id 
    });
  } catch (error: any) {
    logger.error('Failed to send photo rejection notification', { 
      userId, 
      error: error.message 
    });
  }
}

export default router;

