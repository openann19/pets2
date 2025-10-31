/**
 * Moderation Routes
 * 
 * Handles manual and automated content moderation for uploads
 */

import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import type { AuthRequest } from '../types/express';
import Upload from '../models/Upload';
import PhotoAnalysis from '../models/PhotoAnalysis';
import { moderateImage, isSafeForAutoApprove } from '../services/safetyModeration';
import { checkForDuplicates } from '../services/perceptualHash';
import logger from '../utils/logger';
import multer from 'multer';
import sharp from 'sharp';

const router = express.Router();
const upload = multer();

/**
 * POST /api/admin/uploads/:id/moderate
 * Manual moderation decision
 */
router.post('/uploads/:id/moderate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
        try {
          const Pet = (await import('../models/Pet')).default;
          const pet = await Pet.findById(upload.associatedPet);
          
          if (pet) {
            // Check if pet already has a primary photo
            const hasPrimaryPhoto = pet.photos?.some(
              (photo: { isPrimary?: boolean }) => photo.isPrimary
            ) || false;

            // Add photo to pet.photos array
            const newPhoto = {
              url: upload.url || `https://${process.env.S3_BUCKET || 'pawfectmatch-uploads'}.s3.amazonaws.com/${upload.s3Key}`,
              publicId: upload.publicId || upload.s3Key,
              caption: '',
              isPrimary: !hasPrimaryPhoto, // Make first photo primary
              uploadId: upload._id,
              uploadedAt: upload.uploadedAt || new Date(),
            };

            // Get thumbnail from analysis if available
            const uploadMetadata = upload.metadata as Record<string, unknown> | undefined;
            const analysisId = uploadMetadata?.['analysisId'] as string | undefined;
            if (analysisId) {
              const PhotoAnalysis = (await import('../models/PhotoAnalysis')).default;
              const analysis = await PhotoAnalysis.findById(analysisId);
              const thumbnails = uploadMetadata?.['thumbnails'] as { small?: string; medium?: string; large?: string } | undefined;
              if (analysis && thumbnails?.medium) {
                (newPhoto as Record<string, unknown>)['thumbnailUrl'] = thumbnails.medium;
              }
            }

            await Pet.findByIdAndUpdate(
              upload.associatedPet,
              {
                $push: {
                  photos: newPhoto,
                },
              },
              { new: true }
            );

            logger.info('Pet photos array updated from moderation', {
              petId: upload.associatedPet,
              uploadId: upload._id,
              isPrimary: newPhoto.isPrimary,
            });
          }
        } catch (petUpdateError) {
          logger.error('Failed to update pet photos array', {
            petId: upload.associatedPet,
            error: petUpdateError,
          });
          // Don't fail moderation if pet update fails
        }
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
  } catch (error) {
    logger.error('Moderation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/moderation/queue
 * Get moderation queue
 */
router.get('/moderation/queue', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, limit = 50 } = req.query;

    const query: Record<string, unknown> = { status: status || 'pending' };
    if (priority) {
      query.priority = priority;
    }

    const uploads = await Upload.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('associatedPet', 'name');

    res.json({ success: true, data: { uploads } });
  } catch (error) {
    logger.error('Get moderation queue error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/analyze
 * Trigger AI analysis for an upload
 */
router.post('/moderation/analyze/:uploadId', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const upload = await Upload.findById(req.params.uploadId);
    if (!upload) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    // Fetch image from S3
    try {
      const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      });

      const uploadMetadata = upload.metadata as Record<string, unknown> | undefined;
      const s3Key = (uploadMetadata?.['s3Key'] as string | undefined) || upload.publicId;
      const bucketName = process.env['S3_BUCKET'] || 'pawfectmatch-uploads';
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      });

      const s3Response = await s3Client.send(getObjectCommand);
      if (!s3Response.Body) {
        return res.status(404).json({
          success: false,
          error: 'Failed to fetch image from S3',
        });
      }

      const imageBuffer = Buffer.from(await s3Response.Body.transformToByteArray());

      // Run moderation analysis
      const { scanImage } = await import('../services/contentModerationService');
      const moderationResult = await scanImage(
        imageBuffer,
        upload.url || '',
        upload.publicId || s3Key,
        upload.userId.toString(),
        'pet_photo'
      );

      // Update upload with moderation results
      upload.metadata = {
        ...upload.metadata,
        moderationResult,
      };

      if (moderationResult.isSafe === false) {
        upload.status = 'rejected';
        upload.rejectionReason = moderationResult.reason || 'Content moderation failed';
      }

      await upload.save();

      res.json({
        success: true,
        data: {
          upload,
          moderationResult,
        },
      });
    } catch (fetchError) {
      logger.error('Failed to fetch or analyze image', {
        uploadId: upload._id,
        error: fetchError,
      });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch image or run moderation analysis',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      });
    }

    // Run duplicate check
    // const duplicateResult = await checkForDuplicates(...);

    res.json({ 
      success: true, 
      message: 'Analysis triggered (async)' 
    });
  } catch (error) {
    logger.error('Analysis trigger error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/moderation/batch
 * Batch moderate multiple uploads
 */
router.post('/moderation/batch', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    logger.error('Batch moderation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

