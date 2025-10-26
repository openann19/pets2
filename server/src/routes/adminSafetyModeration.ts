/**
 * Admin Safety Moderation Routes
 * 
 * Exposes safety moderation and photo analysis data to admin panel
 */

import express, { type Request, type Response, Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/adminAuth';
import UploadEnhanced from '../models/UploadEnhanced';
import PhotoAnalysis from '../models/PhotoAnalysis';
import { moderateImage, isSafeForAutoApprove, getModerationThresholds } from '../services/safetyModeration';
import logger from '../utils/logger';
import { type IUserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

const router: Router = express.Router();

// Apply authentication and admin middleware
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /api/admin/safety-moderation/queue
 * Get pending uploads that need review
 */
router.get('/queue', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const query: any = {
      status: status || 'pending',
      flagged: true,
    };

    const uploads = await UploadEnhanced.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('petId', 'name species')
      .populate('analysisId')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await UploadEnhanced.countDocuments(query);

    res.json({
      success: true,
      data: {
        uploads,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get moderation queue', { error });
    res.status(500).json({ success: false, message: 'Failed to get moderation queue' });
  }
});

/**
 * GET /api/admin/safety-moderation/uploads/:id
 * Get detailed information about an upload including analysis
 */
router.get('/uploads/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const upload = await UploadEnhanced.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('petId', 'name species')
      .populate('analysisId')
      .populate('moderatedBy', 'firstName lastName')
      .lean();

    if (!upload) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }

    // Get analysis details if available
    let analysis = null;
    if (upload.analysisId) {
      analysis = await PhotoAnalysis.findById(upload.analysisId).lean();
    }

    res.json({
      success: true,
      data: {
        upload,
        analysis,
      },
    });
  } catch (error) {
    logger.error('Failed to get upload details', { error });
    res.status(500).json({ success: false, message: 'Failed to get upload details' });
  }
});

/**
 * POST /api/admin/safety-moderation/uploads/:id/moderate
 * Manual moderation decision
 */
router.post('/uploads/:id/moderate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { decision, notes } = req.body;
    const uploadId = req.params.id;

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision' });
    }

    const upload = await UploadEnhanced.findById(uploadId);
    if (!upload) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }

    // Update upload status
    upload.status = decision === 'approve' ? 'approved' : 'rejected';
    upload.moderatedBy = req.user!._id;
    upload.moderatedAt = new Date();
    upload.moderationNotes = notes || '';

    if (decision === 'approve') {
      upload.flagged = false;
      upload.flagReason = '';
    } else {
      upload.flagged = true;
      upload.flagReason = notes || 'Content policy violation';
    }

    await upload.save();

    logger.info('Upload moderated', {
      uploadId: upload._id,
      decision,
      adminId: req.user!._id,
      notes,
    });

    res.json({
      success: true,
      data: { upload },
      message: `Upload ${decision}d successfully`,
    });
  } catch (error) {
    logger.error('Failed to moderate upload', { error });
    res.status(500).json({ success: false, message: 'Failed to moderate upload' });
  }
});

/**
 * POST /api/admin/safety-moderation/batch-moderate
 * Batch moderate multiple uploads
 */
router.post('/batch-moderate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { uploadIds, decision, notes } = req.body;

    if (!Array.isArray(uploadIds) || uploadIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid upload IDs' });
    }

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Invalid decision' });
    }

    const results = await Promise.all(
      uploadIds.map(async (id: string) => {
        try {
          const upload = await UploadEnhanced.findById(id);
          if (!upload) return { id, success: false, error: 'Upload not found' };

          upload.status = decision === 'approve' ? 'approved' : 'rejected';
          upload.moderatedBy = req.user!._id;
          upload.moderatedAt = new Date();
          upload.moderationNotes = notes || '';

          if (decision === 'approve') {
            upload.flagged = false;
            upload.flagReason = '';
          } else {
            upload.flagged = true;
            upload.flagReason = notes || 'Content policy violation';
          }

          await upload.save();

          return { id, success: true };
        } catch (error) {
          return { id, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    logger.info('Batch moderation completed', {
      adminId: req.user!._id,
      decision,
      count: results.length,
    });

    res.json({
      success: true,
      data: { results },
    });
  } catch (error) {
    logger.error('Failed to batch moderate', { error });
    res.status(500).json({ success: false, message: 'Failed to batch moderate' });
  }
});

/**
 * GET /api/admin/safety-moderation/stats
 * Get moderation statistics
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [pending, approved, rejected, flagged, total] = await Promise.all([
      UploadEnhanced.countDocuments({ status: 'pending' }),
      UploadEnhanced.countDocuments({ status: 'approved' }),
      UploadEnhanced.countDocuments({ status: 'rejected' }),
      UploadEnhanced.countDocuments({ flagged: true }),
      UploadEnhanced.countDocuments(),
    ]);

    const thresholds = getModerationThresholds();

    res.json({
      success: true,
      data: {
        stats: {
          pending,
          approved,
          rejected,
          flagged,
          total,
        },
        thresholds,
      },
    });
  } catch (error) {
    logger.error('Failed to get moderation stats', { error });
    res.status(500).json({ success: false, message: 'Failed to get moderation stats' });
  }
});

/**
 * GET /api/admin/safety-moderation/analysis/:id
 * Get photo analysis details
 */
router.get('/analysis/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const analysis = await PhotoAnalysis.findById(req.params.id).lean();

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    // Get upload details
    const upload = await UploadEnhanced.findById(analysis.uploadId).lean();

    res.json({
      success: true,
      data: {
        analysis,
        upload,
      },
    });
  } catch (error) {
    logger.error('Failed to get analysis details', { error });
    res.status(500).json({ success: false, message: 'Failed to get analysis details' });
  }
});

/**
 * POST /api/admin/safety-moderation/re-run-moderation/:id
 * Re-run moderation on an upload
 */
router.post('/re-run-moderation/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const upload = await UploadEnhanced.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ success: false, message: 'Upload not found' });
    }

    // Note: This would require fetching the image from S3
    // For now, return the existing analysis
    const analysis = upload.analysisId 
      ? await PhotoAnalysis.findById(upload.analysisId).lean()
      : null;

    res.json({
      success: true,
      data: {
        upload,
        analysis,
        message: 'Re-run moderation would require fetching image from S3',
      },
    });
  } catch (error) {
    logger.error('Failed to re-run moderation', { error });
    res.status(500).json({ success: false, message: 'Failed to re-run moderation' });
  }
});

/**
 * GET /api/admin/safety-moderation/thresholds
 * Get current moderation thresholds
 */
router.get('/thresholds', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const thresholds = getModerationThresholds();

    res.json({
      success: true,
      data: { thresholds },
    });
  } catch (error) {
    logger.error('Failed to get thresholds', { error });
    res.status(500).json({ success: false, message: 'Failed to get thresholds' });
  }
});

export default router;

