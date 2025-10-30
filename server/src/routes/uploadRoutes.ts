/**
 * Upload Routes - Per PHOTOVERIFICATION spec
 * 
 * Handles:
 * - Presign (short-lived S3 URLs)
 * - Register uploads (idempotent)
 * - Status polling
 * - Link to pets
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import Upload from '../models/Upload';
import PhotoAnalysis from '../models/PhotoAnalysis';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { calculateAllHashes, checkForDuplicates } from '../services/perceptualHash';
import logger from '../utils/logger';

const router = Router();
const upload = multer();

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || 'pawfectmatch-uploads';

/**
 * POST /api/uploads/photos/presign
 * Generate short-lived presigned URL for direct S3 upload
 */
router.post('/photos/presign', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { contentType, filename } = req.body;

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'invalid_content_type',
        message: 'File type not allowed' 
      });
    }

    // Generate unique key
    const extension = contentType.split('/')[1];
    const key = `uploads/${userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`;

    // Create presigned URL (5 min TTL)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    logger.info('Presigned URL generated', { userId, key, contentType });

    res.json({
      success: true,
      data: {
        key,
        url,
        expiresInSec: 300,
        headers: {
          'Content-Type': contentType,
        },
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Presign error:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/uploads
 * Register uploaded file (idempotent)
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { key, type, petId, contentType, bytes, idempotencyKey } = req.body;

    // Check if already registered (idempotency)
    const idempotency = idempotencyKey || crypto.randomBytes(16).toString('hex');
    const existing = await Upload.findOne({ s3Key: key });

    if (existing) {
      logger.info('Upload already registered (idempotent)', { key, userId });
      return res.json({ success: true, data: { upload: existing } });
    }

    // Create upload record
    const upload = new Upload({
      userId,
      type: type || 'pet_photo',
      s3Key: key,
      filename: key.split('/').pop(),
      originalName: key.split('/').pop(),
      url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
      publicId: key,
      mimeType: contentType || 'image/jpeg',
      size: bytes || 0,
      status: 'uploaded',
      uploadedAt: new Date(),
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        uploadSource: 'mobile',
      },
      associatedPet: petId || undefined,
    });

    await upload.save();

    logger.info('Upload registered', { uploadId: upload._id, key, userId });

    // Queue ingestion job (async)
    // TODO: Queue job for ingestion (AV scan, EXIF strip, pHash, thumbnails, AI analysis)

    res.json({ success: true, data: { upload } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Upload registration error:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * GET /api/uploads/:id
 * Get upload status with analysis
 */
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    // Check ownership
    if (upload.userId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    // Get analysis if exists
    const analysis = await PhotoAnalysis.findOne({ uploadId: upload._id });

    res.json({
      success: true,
      data: {
        upload,
        analysis: analysis || undefined,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Get upload error:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/pets/:petId/photos
 * Link upload to pet
 */
router.post('/pets/:petId/photos', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { petId } = req.params;
    const { uploadId, isPrimary } = req.body;

    const upload = await Upload.findById(uploadId);
    if (!upload || upload.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'Upload not approved' });
    }

    // Update upload
    upload.associatedPet = petId;
    await upload.save();

    // Create PetPhoto (attach to pet.photos array)
    // TODO: Update pet.photos array with the photo

    res.json({
      success: true,
      data: {
        photo: {
          id: upload._id,
          petId,
          uploadId,
          s3Key: upload.s3Key,
          isPrimary: isPrimary || false,
          createdAt: upload.createdAt,
        },
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Link photo error:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

/**
 * POST /api/ai/analyze-photo
 * Analyze photo on demand
 */
router.post('/ai/analyze-photo', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { uploadId } = req.body;

    const upload = await Upload.findById(uploadId);
    if (!upload || upload.userId.toString() !== userId) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    // TODO: Perform AI analysis
    // This would call AI services for pet detection, breed classification, quality scoring, etc.

    // Mock analysis for now
    const analysis = new PhotoAnalysis({
      uploadId,
      isPet: true,
      overall: 0.8,
      labels: [
        { name: 'dog', confidence: 0.95 },
        { name: 'puppy', confidence: 0.85 },
      ],
      breedCandidates: [
        { name: 'Golden Retriever', confidence: 0.75 },
      ],
      quality: {
        dims: upload.dimensions,
        exposure: 0.8,
        contrast: 0.75,
        sharpness: 0.9,
      },
      healthSignals: {
        coatScore: 0.85,
        eyesScore: 0.9,
        postureScore: 0.8,
        energyScore: 0.9,
      },
      safety: {
        labels: [],
        safe: true,
        moderationScore: 0.95,
      },
      suggestions: [],
      models: {
        petDetector: 'v1.0',
        breedClassifier: 'v1.0',
        qualityModel: 'v1.0',
        moderationModel: 'v1.0',
      },
    });

    await analysis.save();
    upload.analysisId = analysis._id;
    upload.status = 'analyzed';
    await upload.save();

    res.json({ success: true, data: { analysis } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Analyze photo error:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

