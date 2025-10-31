/**
 * Verification Routes
 * 
 * Handles user verification tier management and status tracking
 */

import { Router } from 'express';
import type { Response, Request } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getUserVerificationStatus,
  submitIdentityVerification,
  submitPetOwnershipVerification,
  submitVeterinaryVerification,
  submitOrganizationVerification,
  getUserBadges,
  hasTier,
  getTierRequirements,
} from '../services/verificationService';
import logger from '../utils/logger';
import multer from 'multer';
import { uploadToCloudinary } from '../services/cloudinaryService';

import type { AuthRequest } from '../types/express';
import { createTypeSafeWrapper, type AuthenticatedFileRequest } from '../types/routes';

const router = Router();
const upload = multer();

// Type-safe wrapper for route handlers
const wrapHandler = createTypeSafeWrapper<AuthRequest>;

/**
 * GET /api/verification/status
 * Get user's current verification status
 */
router.get('/status', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const status = await getUserVerificationStatus(userId);
    res.json({ success: true, data: status });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error getting verification status:', error);
    res.status(500).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * POST /api/verification/identity
 * Submit Tier 1: Identity Verification
 */
router.post('/identity', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const verification = await submitIdentityVerification(userId, req.body);
    res.json({ success: true, data: verification });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting identity verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * POST /api/verification/pet-ownership
 * Submit Tier 2: Pet Ownership Verification
 */
router.post('/pet-ownership', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const verification = await submitPetOwnershipVerification(userId, req.body);
    res.json({ success: true, data: verification });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting pet ownership verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * POST /api/verification/veterinary
 * Submit Tier 3: Veterinary Verification
 */
router.post('/veterinary', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const verification = await submitVeterinaryVerification(userId, req.body);
    res.json({ success: true, data: verification });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting veterinary verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * POST /api/verification/organization
 * Submit Tier 4: Organization Verification
 */
router.post('/organization', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const verification = await submitOrganizationVerification(userId, req.body);
    res.json({ success: true, data: verification });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting organization verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * GET /api/verification/badges
 * Get user's badges
 */
router.get('/badges', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const badges = await getUserBadges(userId);
    res.json({ success: true, data: { badges } });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error getting badges:', error);
    res.status(500).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * GET /api/verification/has-tier/:tier
 * Check if user has required tier
 */
router.get('/has-tier/:tier', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { tier } = req.params;
    const userHasTier = await hasTier(userId, tier as 'tier1' | 'tier2' | 'tier3' | 'tier4');
    res.json({ success: true, data: { hasTier: userHasTier } });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error checking tier:', error);
    res.status(500).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * GET /api/verification/requirements/:tier
 * Get requirements for a specific tier
 */
router.get('/requirements/:tier', authenticateToken, wrapHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { tier } = req.params;
    const requirements = getTierRequirements(tier as 'tier1' | 'tier2' | 'tier3' | 'tier4');
    res.json({ success: true, data: { requirements } });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error getting requirements:', error);
    res.status(500).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * POST /api/verification/upload
 * Upload verification document
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedFileRequest;
  try {
    const userId = authReq.user?._id?.toString() || (authReq as { userId?: string }).userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!authReq.file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }

    const { documentType, verificationType } = req.body;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(authReq.file.buffer, {
      folder: `verification/${verificationType || 'unknown'}/${userId}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    logger.info('Verification document uploaded', {
      userId,
      documentType,
      verificationType,
      publicId: result.public_id,
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error uploading document:', error);
    res.status(500).json({ success: false, error: errorMessage });
    return;
  }
});

/**
 * POST /api/verification/:id/cancel
 * Cancel pending verification
 */
router.post('/:id/cancel', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const Verification = (await import('../models/Verification')).default;

    // Find verification and verify ownership
    const verification = await Verification.findOne({
      _id: id,
      userId,
      status: 'pending', // Only allow canceling pending verifications
    });

    if (!verification) {
      res.status(404).json({
        success: false,
        error: 'Verification not found, already processed, or unauthorized',
      });
    }

    // Update verification status to cancelled (or mark as inactive)
    verification.status = 'rejected'; // Use rejected status for cancellation
    verification.rejectionReason = 'Cancelled by user';
    verification.rejectedAt = new Date();
    verification.isActive = false;
    await verification.save();

    logger.info('Verification cancelled', {
      verificationId: id,
      userId,
      type: verification.type,
    });

    res.json({
      success: true,
      message: 'Verification cancelled successfully',
      data: {
        verificationId: id,
        cancelledAt: verification.rejectedAt,
      },
    });
    return;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error canceling verification:', error);
    res.status(500).json({ success: false, error: errorMessage });
    return;
  }
}));

/**
 * POST /api/verification/request-update
 * Request status update for pending verification
 */
router.post('/request-update', authenticateToken, wrapHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { verificationId, message } = req.body as {
      verificationId?: string;
      message?: string;
    };

    const Verification = (await import('../models/Verification')).default;

    // Find user's pending verifications
    const query: Record<string, unknown> = {
      userId,
      status: 'pending',
    };

    if (verificationId) {
      query['_id'] = verificationId;
    }

    const verifications = await Verification.find(query);

    if (verifications.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No pending verifications found',
      });
      return;
    }

    // Notify admins about the status update request
    try {
      // Import notification service
      const { sendAdminNotification } = await import('../services/adminNotificationService');
      
      for (const verification of verifications) {
        await sendAdminNotification({
          type: 'info', // Use valid NotificationType
          severity: 'medium',
          title: 'Verification Status Update Requested',
          message: message || `User ${userId} requested status update for ${verification.type} verification`,
          metadata: {
            verificationId: verification['_id']?.toString(),
            userId,
            verificationType: verification.type,
            submittedAt: verification.submittedAt,
            message,
          },
        });

        logger.info('Verification update request created', {
          verificationId: verification['_id'],
          userId,
          type: verification.type,
        });
      }
    } catch (notificationError) {
      logger.error('Failed to create admin notification', {
        error: notificationError,
        userId,
      });
      // Continue even if notification fails
    }

    res.json({
      success: true,
      message: 'Status update request submitted. Admins have been notified.',
      data: {
        verificationIds: verifications.map((v: { _id: { toString: () => string } }) => v._id.toString()),
        requestedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error requesting status update:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
}));

export default router;

