/**
 * Admin Upload Moderation Controller
 * Handles upload moderation and review
 */

import type { Request, Response } from 'express';
import Upload from '../../models/Upload';
import User from '../../models/User';
import logger from '../../utils/logger';
import { logAdminActivity } from '../../middleware/adminLogger';
import { getErrorMessage } from '../../utils/errorHandler';

interface AdminRequest extends Request {
  userId?: string;
}

/**
 * GET /api/admin/uploads
 * Get uploads for moderation review
 */
export const getUploads = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { filter = 'all', search = '', page = 1, limit = 50 } = req.query as {
      filter?: 'all' | 'pending' | 'flagged';
      search?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};
    
    if (filter === 'pending') {
      query.status = 'pending';
    } else if (filter === 'flagged') {
      query.flagged = true;
    }

    // Apply search if provided
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const uploads = await Upload.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('petId', 'name')
      .sort({ uploadedAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Upload.countDocuments(query);

    const formattedUploads = uploads.map((upload: any) => ({
      id: upload._id.toString(),
      userId: upload.userId?._id?.toString() || '',
      userName: upload.userId ? `${upload.userId.firstName} ${upload.userId.lastName}` : 'Unknown',
      petId: upload.petId?._id?.toString(),
      petName: upload.petId?.name,
      type: upload.type,
      url: upload.url,
      thumbnailUrl: upload.thumbnailUrl || upload.url,
      uploadedAt: upload.uploadedAt,
      status: upload.status,
      flagged: upload.flagged || false,
      flagReason: upload.flagReason,
      reviewedBy: upload.reviewedBy,
      reviewedAt: upload.reviewedAt,
      rejectionReason: upload.rejectionReason,
      metadata: upload.metadata || {
        fileSize: 0,
        contentType: 'unknown',
      },
    }));

    await logAdminActivity(req, 'VIEW_UPLOADS', { filter, count: uploads.length });

    res.json({
      success: true,
      data: formattedUploads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get uploads', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get uploads',
      message: getErrorMessage(error),
    });
  }
};

/**
 * POST /api/admin/uploads/:uploadId/moderate
 * Moderate an upload
 */
export const moderateUpload = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { uploadId } = req.params;
    const { action, reason } = req.body as { action: 'approve' | 'reject'; reason?: string };

    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({
        success: false,
        error: 'Invalid action. Must be approve or reject',
      });
      return;
    }

    const upload = await Upload.findById(uploadId);
    
    if (!upload) {
      res.status(404).json({
        success: false,
        error: 'Upload not found',
      });
      return;
    }

    // Update upload status
    upload.status = action === 'approve' ? 'approved' : 'rejected';
    upload.reviewedAt = new Date();
    upload.reviewedBy = req.userId as any;

    if (action === 'reject' && reason) {
      (upload as any).rejectionReason = reason;
    }

    await upload.save();

    await logAdminActivity(req, 'MODERATE_UPLOAD', { uploadId, action });

    res.json({
      success: true,
      message: `Upload ${action}d successfully`,
      data: {
        uploadId,
        action,
        reviewedAt: new Date().toISOString(),
        reviewedBy: req.userId,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to moderate upload', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to moderate upload',
      message: getErrorMessage(error),
    });
  }
};

/**
 * GET /api/admin/uploads/stats
 * Get upload moderation statistics
 */
export const getUploadModerationStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query as { period?: string };

    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const totalUploads = await Upload.countDocuments({
      uploadedAt: { $gte: startDate }
    });

    const pendingUploads = await Upload.countDocuments({
      status: 'pending',
      uploadedAt: { $gte: startDate }
    });

    const approvedUploads = await Upload.countDocuments({
      status: 'approved',
      uploadedAt: { $gte: startDate }
    });

    const rejectedUploads = await Upload.countDocuments({
      status: 'rejected',
      uploadedAt: { $gte: startDate }
    });

    const flaggedUploads = await Upload.countDocuments({
      flagged: true,
      uploadedAt: { $gte: startDate }
    });

    const stats = {
      period,
      totalUploads,
      pendingUploads,
      approvedUploads,
      rejectedUploads,
      flaggedUploads,
      approvalRate: totalUploads > 0 ? (approvedUploads / totalUploads) * 100 : 0,
      rejectionRate: totalUploads > 0 ? (rejectedUploads / totalUploads) * 100 : 0,
      timestamp: new Date().toISOString(),
    };

    await logAdminActivity(req, 'VIEW_UPLOAD_MODERATION_STATS');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    logger.error('Failed to get upload moderation stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get upload moderation stats',
      message: getErrorMessage(error),
    });
  }
};

