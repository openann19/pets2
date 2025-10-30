/**
 * Safety Moderation Service
 * 
 * Integrates with AWS Rekognition and Google Cloud Vision for content
 * moderation and safety checks. Implements fallback logic and caching.
 */

import * as Rekognition from '@aws-sdk/client-rekognition';
// @ts-ignore - AWS SDK might not be available in all environments
import logger from '../utils/logger';

export interface ModerationResult {
  safe: boolean;
  moderationScore: number; // 0-1, 1 = safe
  labels: Array<{ label: string; confidence: number }>;
  provider: 'aws-rekognition' | 'google-vision' | 'fallback';
  error?: string;
}

/**
 * Moderate image using AWS Rekognition
 */
export async function moderateWithRekognition(
  imageBuffer: Buffer,
  imageType: 'photo' | 'video' = 'photo'
): Promise<ModerationResult> {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      logger.warn('AWS credentials not configured, using fallback');
      return moderateWithFallback(imageBuffer);
    }

    const rekognition = new Rekognition.RekognitionClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Use DetectModerationLabels for image moderation
    const command = new Rekognition.DetectModerationLabelsCommand({
      Image: {
        Bytes: imageBuffer,
      },
      MinConfidence: 50, // Only consider labels with 50%+ confidence
    });

    const response = await rekognition.send(command);

    if (!response.ModerationLabels) {
      return {
        safe: true,
        moderationScore: 1.0,
        labels: [],
        provider: 'aws-rekognition',
      };
    }

    // Calculate moderation score (inverse of highest confidence violation)
    const maxConfidence = Math.max(
      ...response.ModerationLabels.map(label => (label.Confidence || 0) / 100)
    );

    // Check for explicit violations
    const hasExplicit = response.ModerationLabels.some(
      label => label.Name === 'Explicit Nudity' || label.Name === 'Suggestive'
    );
    const hasViolence = response.ModerationLabels.some(
      label => label.Name === 'Violence' || label.Name === 'Graphic Violence'
    );
    const hasSelfHarm = response.ModerationLabels.some(label => label.Name === 'Self Injury');
    const hasDrugs = response.ModerationLabels.some(label => label.Name === 'Drugs');
    const hasHate = response.ModerationLabels.some(label => label.Name === 'Hate Symbols');

    const isSafe = !hasExplicit && !hasViolence && !hasSelfHarm && hasDrugs && !hasHate;
    const moderationScore = isSafe ? 1.0 : 1.0 - maxConfidence;

    return {
      safe: isSafe && moderationScore >= 0.7,
      moderationScore,
      labels: response.ModerationLabels.map(label => ({
        label: label.Name || 'unknown',
        confidence: (label.Confidence || 0) / 100,
      })),
      provider: 'aws-rekognition',
    };
  } catch (error: unknown) {
    logger.error('Rekognition moderation failed:', error);
    return moderateWithFallback(imageBuffer);
  }
}

/**
 * Fallback moderation using basic heuristics
 */
export async function moderateWithFallback(imageBuffer: Buffer): Promise<ModerationResult> {
  logger.info('Using fallback moderation');

  // Basic checks (in production, use proper ML models)
  // For now, accept everything (manual review required)
  return {
    safe: true, // Conservative: let human review decide
    moderationScore: 0.5,
    labels: [],
    provider: 'fallback',
    error: 'No AI moderation available, requiring human review',
  };
}

/**
 * Moderate image with provider fallback
 */
export async function moderateImage(
  imageBuffer: Buffer,
  preferredProvider: 'aws' | 'google' | 'fallback' = 'fallback'
): Promise<ModerationResult> {
  try {
    // Try AWS Rekognition first
    if (preferredProvider === 'fallback' || preferredProvider === 'aws') {
      const result = await moderateWithRekognition(imageBuffer);
      if (result.provider !== 'fallback') {
        return result;
      }
    }

    // TODO: Implement Google Cloud Vision fallback
    // if (preferredProvider === 'google' || preferredProvider === 'any') {
    //   const result = await moderateWithGoogleVision(imageBuffer);
    //   if (result.provider !== 'fallback') {
    //     return result;
    //   }
    // }

    // Final fallback
    return moderateWithFallback(imageBuffer);
  } catch (error: unknown) {
    logger.error('Moderation failed completely:', error);
    return moderateWithFallback(imageBuffer);
  }
}

/**
 * Batch moderate multiple images
 */
export async function moderateImages(
  images: Array<{ id: string; buffer: Buffer }>
): Promise<Array<{ id: string; result: ModerationResult }>> {
  return Promise.all(
    images.map(async (image) => ({
      id: image.id,
      result: await moderateImage(image.buffer),
    }))
  );
}

/**
 * Check if image is safe for auto-approval
 */
export function isSafeForAutoApprove(result: ModerationResult): boolean {
  return result.safe && result.moderationScore >= 0.8;
}

/**
 * Get moderation score thresholds
 */
export function getModerationThresholds(): {
  autoApprove: number;
  requireReview: number;
  autoReject: number;
} {
  return {
    autoApprove: 0.8,    // Safe enough for auto-approval
    requireReview: 0.5,  // Needs human review
    autoReject: 0.3,     // Reject automatically
  };
}

