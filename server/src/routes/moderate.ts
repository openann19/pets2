/**
 * Moderation Routes
 * 
 * Handles manual and automated content moderation for uploads
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import Upload from '../models/Upload';
import PhotoAnalysis from '../models/PhotoAnalysis';
import { moderateImage, isSafeForAutoApprove } from '../services/safetyModeration';
import { checkForDuplicates } from '../services/perceptualHash';
import logger from '../utils/logger';
import multer from 'multer';
import sharp from 'sharp';

const router = Router();
const upload = multer();

/**
 * POST /api/admin/uploads/:id/moderate
 * Manual moderation decision
 */
router.post('/uploads/:id/moderate', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    const { decision, reasonCode, notes } = req.body;

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Invalid decision' });
    }

    const adminId = req.user?.id || req.userId;

    if (decision === 'approve') {
      upload.status = 'approved';
      upload.approvedAt = new Date();
      upload.approvedBy = adminId;
      if (notes) {
        upload.approvalNotes = notes;
      }

      // Auto-link to pet if associated
      if (upload.associatedPet) {
        // TODO: Update pet.photos array
      }
    } else {
      upload.status = 'rejected';
      upload.rejectedAt = new Date();
      upload.rejectedBy = adminId;
      upload.rejectionReason = reasonCode || 'Content policy violation';
      if (notes) {
        upload.rejectionNotes = notes;
      }
    }

    await upload.save();

    logger.info('Upload moderated', {
      uploadId: upload._id,
      decision,
      adminId,
    });

    res.json({ success: true, data: { upload } });
  } catch (error: any) {
    logger.error('Moderation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/moderation/queue
 * Get moderation queue
 */
router.get('/moderation/queue', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, priority, limit = 50 } = req.query;

    const query: any = { status: status || 'pending' };
    if (priority) {
      query.priority = priority;
    }

    const uploads = await Upload.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('associatedPet', 'name');

    res.json({ success: true, data: { uploads } });
  } catch (error: any) {
    logger.error('Get moderation queue error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/analyze
 * Trigger AI analysis for an upload
 */
router.post('/moderation/analyze/:uploadId', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const upload = await Upload.findById(req.params.uploadId);
    if (!upload) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    // TODO: Fetch image from S3/Cloudinary
    // const imageBuffer = await fetchImageBuffer(upload.s3Key);

    // Run moderation
    // const moderationResult = await moderateImage(imageBuffer);

    // Run duplicate check
    // const duplicateResult = await checkForDuplicates(...);

    res.json({ 
      success: true, 
      message: 'Analysis triggered (async)' 
    });
  } catch (error: any) {
    logger.error('Analysis trigger error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/batch
 * Batch moderate multiple uploads
 */
router.post('/moderation/batch', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { uploadIds, decision, reasonCode } = req.body;

    if (!Array.isArray(uploadIds) || uploadIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid upload IDs' });
    }

    const adminId = req.user?.id || req.userId;

    const results = await Promise.all(
      uploadIds.map(async (id: string) => {
        const upload = await Upload.findById(id);
        if (!upload) return { id, success: false, error: 'Not found' };

        upload.status = decision === 'approve' ? 'approved' : 'rejected';
        upload[decision === 'approve' ? 'approvedBy' : 'rejectedBy'] = adminId;
        upload[decision === 'approve' ? 'approvedAt' : 'rejectedAt'] = new Date();
        upload.rejectionReason = reasonCode;

        await upload.save();
        return { id, success: true };
      })
    );

    res.json({ success: true, data: { results } });
  } catch (error: any) {
    logger.error('Batch moderation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

