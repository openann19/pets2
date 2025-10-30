/**
 * S3 Presigning Service for PawReels
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export const BUCKET = process.env.S3_BUCKET || 'reels';

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

export interface PresignOptions {
  key: string;
  contentType?: string;
  expiresIn?: number;
}

export async function presignUpload(options: PresignOptions): Promise<{ signedUrl: string; key: string }> {
  const { key, contentType = 'application/octet-stream', expiresIn = 300 } = options;

  // Validate content type
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error(`Invalid content type: ${contentType}`);
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

  return { signedUrl, key };
}

export function validatePresignedUpload(key: string, contentType: string, fileSize?: number): void {
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new Error('Invalid content type');
  }

  if (fileSize && fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds maximum');
  }

  // Ensure key is within reels namespace
  if (!key.startsWith('reels/')) {
    throw new Error('Invalid key prefix');
  }
}
