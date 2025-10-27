/**
 * Upload Signing Controller for PawfectMatch PawReels
 * Generates signed URLs for direct S3/storage uploads
 */

import type { Request, Response } from 'express';
import type { IUserDocument } from '../types/mongoose';
const logger = require('../utils/logger');
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Type definitions
interface AuthRequest extends Request {
  user?: IUserDocument;
}

interface SignUploadBody {
  filename: string;
  contentType: string;
  fileSize?: number;
}

// S3 client setup (you'll need to configure this with your credentials)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'pawfectmatch-reels';

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

// Helper functions
function ok(res: Response, status: number, payload: Record<string, unknown>): void {
  res.status(status).json({ success: true, ...payload });
}

function fail(res: Response, status: number, message: string, meta?: Record<string, unknown>): void {
  const body: { success: boolean; message: string; meta?: Record<string, unknown> } = { success: false, message };
  if (meta && process.env.NODE_ENV !== 'production') {
    body.meta = meta;
  }
  res.status(status).json(body);
}

/**
 * Generate signed upload URL
 * POST /api/uploads/sign
 */
export const signUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      fail(res, 401, 'Unauthorized');
      return;
    }

    const { filename, contentType, fileSize } = req.body as SignUploadBody;

    // Validate inputs
    if (!filename || !contentType) {
      fail(res, 400, 'Missing filename or contentType');
      return;
    }

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      fail(res, 400, 'Invalid content type');
      return;
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      fail(res, 400, 'File size exceeds maximum');
      return;
    }

    // Generate unique key for this user
    const timestamp = Date.now();
    const key = `reels/${user._id}/${timestamp}-${filename}`;

    // Create signed URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

    logger.info('Upload URL signed', { userId: user._id, key });

    ok(res, 200, {
      signedUrl,
      key,
      bucket: BUCKET_NAME,
      expiresIn: 3600,
    });
  } catch (error: any) {
    logger.error('Error signing upload:', error);
    fail(res, 500, 'Failed to sign upload URL');
  }
};

