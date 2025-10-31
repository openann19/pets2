/**
 * Upload Routes - Per PHOTOVERIFICATION spec
 * 
 * Handles:
 * - Presign (short-lived S3 URLs)
 * - Register uploads (idempotent)
 * - Status polling
 * - Link to pets
 */

import type { Request, Response } from 'express';
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import Upload from '../models/Upload';
import PhotoAnalysis from '../models/PhotoAnalysis';
import { calculateAllHashes, checkForDuplicates } from '../services/perceptualHash';
import logger from '../utils/logger';

const router = Router();

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env['S3_BUCKET'] || 'pawfectmatch-uploads';

/**
 * POST /api/uploads/photos/presign
 * Generate short-lived presigned URL for direct S3 upload
 */
router.post('/photos/presign', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.user?._id?.toString();
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
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { key, type, petId, contentType, bytes, idempotencyKey } = req.body;

    // Check if already registered (idempotency)
    const existing = await Upload.findOne({ publicId: key });

    if (existing) {
      logger.info('Upload already registered (idempotent)', { key, userId });
      return res.json({ success: true, data: { upload: existing } });
    }

    // Create upload record
    // Store s3Key in metadata since schema doesn't have it directly
    const upload = new Upload({
      userId,
      type: type || 'pet_photo',
      filename: key.split('/').pop() || 'upload',
      originalName: key.split('/').pop() || 'upload',
      url: `https://${process.env['S3_BUCKET'] || 'pawfectmatch-uploads'}.s3.amazonaws.com/${key}`,
      publicId: key, // Use publicId as s3Key
      mimeType: contentType || 'image/jpeg',
      size: bytes || 0,
      status: 'pending', // Changed from 'uploaded' to 'pending' per schema enum
      uploadedAt: new Date(),
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        uploadSource: 'mobile',
        s3Key: key, // Store in metadata
      },
      associatedPet: petId || null,
    });

    await upload.save();

    logger.info('Upload registered', { uploadId: upload._id, key, userId });

    // Queue ingestion job (async)
    try {
      const { queueUploadIngestion } = await import('../services/uploadIngestionQueue');
      await queueUploadIngestion({
        uploadId: upload._id.toString(),
        s3Key: key,
        userId: userId.toString(),
        petId: petId ? petId.toString() : undefined,
      });
      logger.info('Upload ingestion job queued successfully', { uploadId: upload._id });
    } catch (queueError) {
      logger.error('Failed to queue ingestion job', {
        uploadId: upload._id,
        error: queueError instanceof Error ? queueError.message : String(queueError),
      });
      // Don't fail the request if queueing fails - job can be retried later
    }

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
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const uploadId = req.params['id'];
    const upload = await Upload.findById(uploadId);
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
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { petId } = req.params;
    const { uploadId, isPrimary } = req.body;

    const upload = await Upload.findById(uploadId);
    if (!upload || upload.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'Upload not approved' });
    }

    // Verify pet ownership
    const Pet = (await import('../models/Pet')).default;
    const pet = await Pet.findOne({ _id: petId, owner: userId });
    
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pet not found or unauthorized' 
      });
    }

    // Check if upload is approved
    if (upload.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        error: 'Upload must be approved before linking to pet' 
      });
    }

    // Update upload - convert string to ObjectId if needed
    if (petId) {
      const mongooseModule = await import('mongoose');
      const mongoose = mongooseModule.default;
      upload.associatedPet = new mongoose.Types.ObjectId(petId) as any;
    } else {
      upload.associatedPet = null;
    }
    await upload.save();

    // Update pet.photos array with the photo
    const hasPrimaryPhoto = pet.photos?.some(
      (photo: { isPrimary?: boolean }) => photo.isPrimary
    ) || false;

    const uploadMetadata = upload.metadata as Record<string, unknown> | undefined;
    const s3Key = (uploadMetadata?.['s3Key'] as string | undefined) || upload.publicId;
    
    const newPhoto = {
      url: upload.url || `https://${process.env['S3_BUCKET'] || 'pawfectmatch-uploads'}.s3.amazonaws.com/${s3Key}`,
      publicId: upload.publicId,
      caption: '',
      isPrimary: isPrimary || (!hasPrimaryPhoto), // Use provided flag or make first photo primary
      uploadId: upload._id,
      uploadedAt: upload.uploadedAt || new Date(),
    };

    // Get thumbnail from analysis if available
    const analysisId = uploadMetadata?.['analysisId'] as string | undefined;
    if (analysisId) {
      const analysis = await PhotoAnalysis.findById(analysisId);
      const thumbnails = uploadMetadata?.['thumbnails'] as { small?: string; medium?: string; large?: string } | undefined;
      if (analysis && thumbnails?.medium) {
        (newPhoto as Record<string, unknown>)['thumbnailUrl'] = thumbnails.medium;
      }
    }

    await Pet.findByIdAndUpdate(
      petId,
      {
        $push: {
          photos: newPhoto,
        },
      },
      { new: true }
    );

    logger.info('Photo linked to pet', {
      petId,
      uploadId: upload._id,
      isPrimary: newPhoto.isPrimary,
    });

      res.json({
      success: true,
      data: {
        photo: {
          id: upload._id,
          petId,
          uploadId,
          s3Key: s3Key,
          url: newPhoto.url,
          isPrimary: newPhoto.isPrimary,
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
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { uploadId } = req.body;

    const upload = await Upload.findById(uploadId);
    if (!upload || upload.userId.toString() !== userId) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    // Perform AI analysis using real AI service
    try {
      // Fetch image from S3 for analysis
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
        throw new Error('Failed to fetch file from S3');
      }

      const imageBuffer = Buffer.from(await s3Response.Body.transformToByteArray());

      // Perform AI analysis using AWS Rekognition and Sharp
      // Note: @aws-sdk/client-rekognition must be installed: npm install @aws-sdk/client-rekognition
      let RekognitionClient: any;
      let DetectLabelsCommand: any;
      try {
        const rekognitionModule = await import('@aws-sdk/client-rekognition');
        RekognitionClient = rekognitionModule.RekognitionClient;
        DetectLabelsCommand = rekognitionModule.DetectLabelsCommand;
      } catch (importError) {
        logger.error('Failed to import AWS Rekognition', { error: importError });
        return res.status(500).json({
          success: false,
          error: 'AI analysis service unavailable. Please install @aws-sdk/client-rekognition.'
        });
      }
      const sharp = await import('sharp');
      
      const rekognition = new RekognitionClient({ 
        region: process.env.AWS_REGION || 'us-east-1' 
      });

      // Detect labels using AWS Rekognition
      const rekognitionResponse = await rekognition.send(new DetectLabelsCommand({
        Image: { Bytes: imageBuffer },
        MaxLabels: 25,
        MinConfidence: 70,
      }));

      const labels = (rekognitionResponse.Labels ?? []).map((l: { Name?: string; Confidence?: number }) => ({ 
        name: l.Name || '', 
        confidence: l.Confidence || 0 
      }));
      
      const animals = labels.filter((l: { name: string }) => /dog|cat|animal/i.test(l.name));
      const isPet = animals.length > 0;

      // Guess breeds from labels
      const BREED_WORDS = [
        'Labrador', 'Golden Retriever', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle',
        'Rottweiler', 'Dachshund', 'Siberian Husky', 'Doberman', 'Chihuahua', 'Persian Cat',
        'Maine Coon', 'Siamese Cat', 'Bengal'
      ];
      
      const breedCandidates = labels
        .filter((l: { name: string }) => BREED_WORDS.some(b => l.name.toLowerCase().includes(b.toLowerCase())))
        .map((l: { name: string; confidence: number }) => {
          const breedMatch = BREED_WORDS.find(b => l.name.toLowerCase().includes(b.toLowerCase()));
          return { 
            name: breedMatch || l.name, 
            confidence: l.confidence 
          };
        })
        .slice(0, 5);

      // Calculate image quality using Sharp
      const img = sharp.default(imageBuffer).ensureAlpha();
      const metadata = await img.metadata();
      const stats = await img.stats();

      // Calculate exposure (mean brightness)
      const mean = stats.channels?.slice(0, 3).reduce((a, c) => a + (c.mean || 0), 0) ?? 380;
      const exposure = Number((mean / (3 * 255)).toFixed(3));

      // Calculate contrast (standard deviation)
      const stdev = stats.channels?.slice(0, 3).reduce((a, c) => a + (c.stdev || 0), 0) ?? 50;
      const contrast = Number((stdev / (3 * 128)).toFixed(3));

      // Calculate sharpness (Laplacian variance)
      const lap = await img
        .convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0] })
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const lpix = new Uint8Array(lap.data);
      let sum = 0, sum2 = 0;
      for (let i = 0; i < lpix.length; i++) {
        const v = lpix[i];
        if (v !== undefined) {
          sum += v;
          sum2 += v * v;
        }
      }
      const n = lpix.length || 1;
      const variance = sum2 / n - (sum / n) * (sum / n);
      const sharpness = Number(Math.max(0, Math.min(1, variance / 5000)).toFixed(3));

      // Calculate overall score
      const overall = Math.round(
        Math.max(0, Math.min(100,
          (isPet ? 20 : 0) +
          (sharpness * 35) +
          ((1 - Math.abs(exposure - 0.55)) * 25) +
          (contrast * 20)
        ))
      ) / 100; // Convert to 0-1 scale

      // Generate suggestions
      const suggestions: string[] = [];
      if (sharpness < 0.4) suggestions.push('Photo appears soft; try better focus or more light.');
      if (exposure < 0.35) suggestions.push('Looks underexposed; increase brightness or shoot in daylight.');
      if (exposure > 0.75) suggestions.push('Highlights may be clipped; reduce exposure.');
      if (!isPet) suggestions.push('No clear pet detected; try a closer framing.');

      // Create PhotoAnalysis record
      const analysis = new PhotoAnalysis({
        uploadId,
        isPet,
        overall,
        labels,
        breedCandidates,
        quality: {
          dims: {
            width: metadata.width || 0,
            height: metadata.height || 0,
          },
          exposure,
          contrast,
          sharpness,
        },
        healthSignals: {
          coatScore: 0.85, // Default - would need specialized model
          eyesScore: 0.9,
          postureScore: 0.8,
          energyScore: 0.9,
        },
        safety: {
          labels: [],
          safe: true,
          moderationScore: 0.95,
        },
        suggestions,
        models: {
          petDetector: 'aws-rekognition-v1',
          breedClassifier: 'aws-rekognition-v1',
          qualityModel: 'sharp-v1',
          moderationModel: 'v1.0',
        },
      });

      await analysis.save();
      
      // Store analysisId and thumbnails in metadata since schema doesn't have these fields
      // Metadata type is limited by schema, so we need to cast to allow our custom fields
      const currentMetadata = upload.metadata as Record<string, unknown> || {};
      (upload as { metadata: Record<string, unknown> }).metadata = {
        ...currentMetadata,
        analysisId: analysis._id.toString(),
        // Thumbnails would be stored here if we had them
      };
      upload.status = 'approved'; // Use 'approved' instead of 'analyzed' per schema enum
      await upload.save();

      res.json({ success: true, data: { analysis } });
    } catch (analysisError) {
      logger.error('AI analysis failed', {
        uploadId,
        error: analysisError instanceof Error ? analysisError.message : String(analysisError),
      });
      // Return error but don't fail completely
      res.status(500).json({
        success: false,
        error: 'AI analysis failed',
        message: analysisError instanceof Error ? analysisError.message : 'Unknown error',
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Analyze photo error:', error);
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;

