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

// Re-export for convenience

const router = Router();
const upload = multer();

/**
 * GET /api/verification/status
 * Get user's current verification status
 */
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const status = await getUserVerificationStatus(userId);
    res.json({ success: true, data: status });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error getting verification status:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/verification/identity
 * Submit Tier 1: Identity Verification
 */
router.post('/identity', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const verification = await submitIdentityVerification(userId, req.body);
    res.json({ success: true, data: verification });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting identity verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/verification/pet-ownership
 * Submit Tier 2: Pet Ownership Verification
 */
router.post('/pet-ownership', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const verification = await submitPetOwnershipVerification(userId, req.body);
    res.json({ success: true, data: verification });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting pet ownership verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/verification/veterinary
 * Submit Tier 3: Veterinary Verification
 */
router.post('/veterinary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const verification = await submitVeterinaryVerification(userId, req.body);
    res.json({ success: true, data: verification });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting veterinary verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/verification/organization
 * Submit Tier 4: Organization Verification
 */
router.post('/organization', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const verification = await submitOrganizationVerification(userId, req.body);
    res.json({ success: true, data: verification });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting organization verification:', error);
    res.status(400).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/verification/badges
 * Get user's badges
 */
router.get('/badges', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const badges = await getUserBadges(userId);
    res.json({ success: true, data: { badges } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error getting badges:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/verification/has-tier/:tier
 * Check if user has required tier
 */
router.get('/has-tier/:tier', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { tier } = req.params;
    const userHasTier = await hasTier(userId, tier as 'tier1' | 'tier2' | 'tier3' | 'tier4');
    res.json({ success: true, data: { hasTier: userHasTier } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error checking tier:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/verification/requirements/:tier
 * Get requirements for a specific tier
 */
router.get('/requirements/:tier', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const requirements = getTierRequirements(tier as 'tier1' | 'tier2' | 'tier3' | 'tier4');
    res.json({ success: true, data: { requirements } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error getting requirements:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/verification/upload
 * Upload verification document
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const { documentType, verificationType } = req.body;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error uploading document:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/verification/:id/cancel
 * Cancel pending verification
 */
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // TODO: Implement cancel verification logic
    res.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error canceling verification:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/verification/request-update
 * Request status update for pending verification
 */
router.post('/request-update', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id?.toString() || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // TODO: Implement request update logic (notify admin, etc.)
    res.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error requesting status update:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

