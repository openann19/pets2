/**
 * Photo Upload Routes - Manual Moderation Only
 * All uploads go to moderation queue for human review
 */

import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import PhotoModeration from '../models/PhotoModeration';
import { authenticateToken } from '../src/middleware/auth';
import logger from '../src/utils/logger';
import { uploadToCloudinary } from '../src/services/cloudinaryService';
import User from '../src/models/User';

// Configure multer for memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

interface FileValidationResult {
  valid: boolean;
  error?: string;
  mime?: string;
  ext?: string;
}

// File type validation with signature sniffing
async function validateFileType(buffer: Buffer): Promise<FileValidationResult> {
  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const type = await fileTypeFromBuffer(buffer);

    if (!type) {
      return { valid: false, error: 'Unable to determine file type' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(type.mime)) {
      return { valid: false, error: `File type ${type.mime} not allowed` };
    }

    return { valid: true, mime: type.mime, ext: type.ext };
  } catch (error: any) {
    logger.error('File type validation error', { error: error.message });
    return { valid: false, error: 'File validation failed' };
  }
}

const router: Router = express.Router();

/**
 * POST /api/upload/photo
 * Upload a photo for moderation
 */
router.post('/photo', authenticateToken, upload.single('photo'), async (req: any, res: Response) => {
  try {
    const userId = req.userId || req.user?._id;
    const { photoType = 'profile' } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    logger.info('Photo upload started', { userId, photoType });

    // 1. Validate file type with signature sniffing
    const fileValidation = await validateFileType(req.file.buffer);
    if (!fileValidation.valid) {
      return res.status(400).json({
        success: false,
        message: fileValidation.error
      });
    }

    logger.info('File type validated', {
      mime: fileValidation.mime,
      ext: fileValidation.ext,
      size: req.file.buffer.length
    });

    // 2. Upload to Cloudinary using memory buffer (no disk IO)
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      'pawfectmatch/moderation-queue',
      {
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );

    logger.info('Photo uploaded to Cloudinary via stream', {
      publicId: cloudinaryResult.public_id,
      url: cloudinaryResult.secure_url
    });

    // 2. Get user's moderation history
    const userHistory = await getUserModerationHistory(userId);

    // 3. Create moderation record
    const moderation = await PhotoModeration.create({
      userId,
      photoUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      photoType,
      uploadedAt: new Date(),
      imageMetadata: {
        width: cloudinaryResult.width,
        height: cloudinaryResult.height,
        format: cloudinaryResult.format,
        fileSize: cloudinaryResult.bytes
      },
      status: 'pending',
      priority: userHistory.rejectedUploads > 2 ? 'high' : 'normal',
      userHistory
    });

    logger.info('Moderation record created', {
      moderationId: moderation._id,
      status: moderation.status
    });

    // 4. Manual-only policy: do not auto-approve trusted users

    // 5. Send notification to moderators if queue is getting long
    const queueSize = await PhotoModeration.countDocuments({ status: 'pending' });
    if (queueSize > 50) {
      logger.warn('Moderation queue is getting long', { queueSize });
      const { checkQueueAndNotify } = require('../services/moderatorNotificationService');
      await checkQueueAndNotify(queueSize, 50);
    }

    // 6. Return pending status
    res.json({
      success: true,
      message: 'Photo uploaded successfully. It will be reviewed by our team shortly.',
      photoId: moderation._id,
      status: 'pending',
      estimatedWaitTime: getEstimatedWaitTime(queueSize)
    });

  } catch (error: any) {
    logger.error('Photo upload failed', { error: error.message, userId: req.user?._id });
    res.status(500).json({
      success: false,
      message: 'Photo upload failed',
      error: error.message
    });
  }
});

/**
 * GET /api/upload/status/:photoId
 * Check moderation status of uploaded photo
 */
router.get('/status/:photoId', authenticateToken, async (req: any, res: Response) => {
  try {
    const moderation = await PhotoModeration.findById(req.params.photoId);

    if (!moderation) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Only allow user to check their own photos
    if (moderation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      status: moderation.status,
      uploadedAt: moderation.uploadedAt,
      reviewedAt: moderation.reviewedAt,
      rejectionReason: moderation.rejectionReason
    });

  } catch (error: any) {
    logger.error('Failed to fetch photo status', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status',
      error: error.message
    });
  }
});

/**
 * GET /api/upload/my-photos
 * Get user's uploaded photos and their statuses
 */
router.get('/my-photos', authenticateToken, async (req: any, res: Response) => {
  try {
    const photos = await PhotoModeration.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .limit(50)
      .select('photoUrl status uploadedAt reviewedAt rejectionReason photoType');

    res.json({
      success: true,
      photos
    });

  } catch (error: any) {
    logger.error('Failed to fetch user photos', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch photos',
      error: error.message
    });
  }
});

// Helper functions

interface UserModerationHistory {
  totalUploads: number;
  rejectedUploads: number;
  approvedUploads: number;
  isTrustedUser: boolean;
  accountAge: number;
}

async function getUserModerationHistory(userId: any): Promise<UserModerationHistory> {
  const user = await User.findById(userId);

  if (!user) {
    return {
      totalUploads: 0,
      rejectedUploads: 0,
      approvedUploads: 0,
      isTrustedUser: false,
      accountAge: 0
    };
  }

  const moderationRecords = await PhotoModeration.find({ userId });

  const totalUploads = moderationRecords.length;
  const rejectedUploads = moderationRecords.filter(r => r.status === 'rejected').length;
  const approvedUploads = moderationRecords.filter(r => r.status === 'approved').length;

  const accountAge = Math.floor(
    (Date.now() - (user.createdAt as Date).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Trust criteria: 10+ approved uploads, 0 rejected, 30+ days old, email verified
  const isTrustedUser = approvedUploads >= 10 &&
    rejectedUploads === 0 &&
    accountAge >= 30 &&
    (user as any).emailVerified;

  return {
    totalUploads,
    rejectedUploads,
    approvedUploads,
    isTrustedUser,
    accountAge
  };
}

function getEstimatedWaitTime(queueSize: number): string {
  // Estimate based on queue size (assuming ~30 photos reviewed per hour)
  if (queueSize < 10) return '10-30 minutes';
  if (queueSize < 30) return '30-60 minutes';
  if (queueSize < 50) return '1-2 hours';
  if (queueSize < 100) return '2-4 hours';
  return '4-8 hours';
}

export default router;

