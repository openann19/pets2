/**
 * Content Moderation Service
 * Uses AWS Rekognition to detect inappropriate content in uploaded images
 */

const AWS = require('aws-sdk');
const PhotoModeration = require('../models/PhotoModeration');
const logger = require('../utils/logger');

class ContentModerationService {
  constructor() {
    // Initialize AWS Rekognition
    this.rekognition = new AWS.Rekognition({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    // Configurable thresholds
    this.THRESHOLDS = {
      // Auto-reject if confidence exceeds these values
      AUTO_REJECT: {
        explicitNudity: 80,
        violence: 85,
        gore: 80,
        selfHarm: 90,
        drugs: 75,
        hateSpeech: 85
      },
      // Flag for manual review if confidence exceeds these values
      FLAG_FOR_REVIEW: {
        explicitNudity: 50,
        suggestiveNudity: 60,
        violence: 60,
        gore: 50,
        selfHarm: 70,
        drugs: 50,
        weapons: 70,
        hateSpeech: 60
      }
    };
  }

  /**
   * Scan image for inappropriate content
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} imageUrl - Cloudinary URL
   * @param {string} userId - User ID who uploaded
   * @param {string} photoType - Type of photo (profile/pet/gallery/chat)
   * @returns {Promise<Object>} Moderation result
   */
  async scanImage(imageBuffer, imageUrl, cloudinaryPublicId, userId, photoType = 'profile') {
    try {
      logger.info('Starting content moderation scan', { userId, photoType });

      // 1. Detect unsafe content using AWS Rekognition
      const moderationResult = await this.rekognition.detectModerationLabels({
        Image: {
          Bytes: imageBuffer
        },
        MinConfidence: 50 // Detect anything above 50% confidence
      }).promise();

      logger.info('AI scan completed', {
        labelsDetected: moderationResult.ModerationLabels.length
      });

      // 2. Parse and categorize results
      const flags = this.parseModerationLabels(moderationResult.ModerationLabels);
      const maxConfidence = Math.max(...Object.values(flags));

      // 3. Determine action based on thresholds
      const action = this.determineAction(flags);

      // 4. Get user moderation history
      const userHistory = await this.getUserModerationHistory(userId);

      // 5. Calculate priority
      const priority = this.calculatePriority(flags, userHistory);

      // 6. Create moderation record
      const moderation = await PhotoModeration.create({
        userId,
        photoUrl: imageUrl,
        cloudinaryPublicId,
        photoType,
        uploadedAt: new Date(),
        aiScanResults: {
          scannedAt: new Date(),
          provider: 'aws-rekognition',
          confidence: maxConfidence,
          flags,
          labels: moderationResult.ModerationLabels.map(label => ({
            name: label.Name,
            confidence: label.Confidence,
            instances: label.Instances?.length || 0
          })),
          autoRejected: action === 'auto-reject',
          autoRejectionReason: action === 'auto-reject' 
            ? this.getAutoRejectionReason(flags) 
            : null
        },
        status: action === 'auto-reject' ? 'auto-rejected' : 
                action === 'flag' ? 'flagged' : 
                userHistory.isTrustedUser ? 'approved' : 'pending',
        priority,
        userHistory
      });

      logger.info('Moderation record created', {
        moderationId: moderation._id,
        action,
        status: moderation.status,
        priority
      });

      // 7. Handle urgent cases
      if (priority === 'urgent') {
        await this.notifyModeratorsUrgent(moderation);
      }

      return {
        safe: action === 'approve',
        moderation,
        action,
        autoApproved: userHistory.isTrustedUser && action !== 'auto-reject'
      };

    } catch (error) {
      logger.error('Content moderation scan failed', { error: error.message, userId });
      
      // On error, flag for manual review (safety first)
      const moderation = await PhotoModeration.create({
        userId,
        photoUrl: imageUrl,
        cloudinaryPublicId,
        photoType,
        status: 'flagged',
        priority: 'high',
        aiScanResults: {
          scannedAt: new Date(),
          provider: 'aws-rekognition',
          confidence: 0,
          flags: {},
          labels: [],
          autoRejected: false
        },
        reviewNotes: `AI scan failed: ${error.message}`
      });

      return {
        safe: false,
        action: 'flag',
        moderation,
        error: error.message
      };
    }
  }

  /**
   * Parse AWS Rekognition labels into categorized flags
   */
  parseModerationLabels(labels) {
    const flags = {
      explicitNudity: 0,
      suggestiveNudity: 0,
      violence: 0,
      gore: 0,
      selfHarm: 0,
      drugs: 0,
      hateSpeech: 0,
      weapons: 0
    };

    labels.forEach(label => {
      const name = label.Name.toLowerCase();
      const confidence = label.Confidence;

      // Map AWS labels to our categories
      if (name.includes('explicit nudity') || name.includes('nudity')) {
        flags.explicitNudity = Math.max(flags.explicitNudity, confidence);
      } else if (name.includes('suggestive') || name.includes('revealing')) {
        flags.suggestiveNudity = Math.max(flags.suggestiveNudity, confidence);
      } else if (name.includes('violence') || name.includes('graphic') || name.includes('corpse')) {
        flags.violence = Math.max(flags.violence, confidence);
      } else if (name.includes('gore') || name.includes('blood')) {
        flags.gore = Math.max(flags.gore, confidence);
      } else if ((name.includes('self') && name.includes('harm')) || name.includes('cutting')) {
        flags.selfHarm = Math.max(flags.selfHarm, confidence);
      } else if (name.includes('drug') || name.includes('pill') || name.includes('smoking')) {
        flags.drugs = Math.max(flags.drugs, confidence);
      } else if (name.includes('hate') || name.includes('offensive') || name.includes('nazi') || name.includes('kkk')) {
        flags.hateSpeech = Math.max(flags.hateSpeech, confidence);
      } else if (name.includes('weapon') || name.includes('gun') || name.includes('knife')) {
        flags.weapons = Math.max(flags.weapons, confidence);
      }
    });

    return flags;
  }

  /**
   * Determine action based on AI confidence thresholds
   */
  determineAction(flags) {
    // Auto-reject if any flag exceeds auto-reject threshold
    for (const [category, value] of Object.entries(flags)) {
      if (this.THRESHOLDS.AUTO_REJECT[category] && 
          value >= this.THRESHOLDS.AUTO_REJECT[category]) {
        return 'auto-reject';
      }
    }

    // Flag for review if any flag exceeds review threshold
    for (const [category, value] of Object.entries(flags)) {
      if (this.THRESHOLDS.FLAG_FOR_REVIEW[category] && 
          value >= this.THRESHOLDS.FLAG_FOR_REVIEW[category]) {
        return 'flag';
      }
    }

    // Otherwise, approve (or pending if not trusted user)
    return 'approve';
  }

  /**
   * Calculate priority for moderation queue
   */
  calculatePriority(flags, userHistory) {
    const maxConfidence = Math.max(...Object.values(flags));

    // Urgent if self-harm or extreme violence
    if (flags.selfHarm > 70 || flags.violence > 80) {
      return 'urgent';
    }

    // High if any serious flags or user has history of rejections
    if (maxConfidence > 70 || userHistory.rejectedUploads > 2) {
      return 'high';
    }

    // Medium if moderate flags
    if (maxConfidence > 50) {
      return 'medium';
    }

    // Low otherwise
    return 'low';
  }

  /**
   * Generate human-readable auto-rejection reason
   */
  getAutoRejectionReason(flags) {
    const reasons = [];

    if (flags.explicitNudity >= this.THRESHOLDS.AUTO_REJECT.explicitNudity) {
      reasons.push('explicit content');
    }
    if (flags.violence >= this.THRESHOLDS.AUTO_REJECT.violence) {
      reasons.push('violent content');
    }
    if (flags.gore >= this.THRESHOLDS.AUTO_REJECT.gore) {
      reasons.push('graphic content');
    }
    if (flags.selfHarm >= this.THRESHOLDS.AUTO_REJECT.selfHarm) {
      reasons.push('self-harm content');
    }
    if (flags.drugs >= this.THRESHOLDS.AUTO_REJECT.drugs) {
      reasons.push('drug-related content');
    }
    if (flags.hateSpeech >= this.THRESHOLDS.AUTO_REJECT.hateSpeech) {
      reasons.push('hate speech or offensive symbols');
    }

    return reasons.length > 0 
      ? `Photo contains ${reasons.join(', ')}`
      : 'Photo violates community guidelines';
  }

  /**
   * Get user's moderation history and trust score
   */
  async getUserModerationHistory(userId) {
    const User = require('../models/User');
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
    const rejectedUploads = moderationRecords.filter(r => 
      r.status === 'rejected' || r.status === 'auto-rejected'
    ).length;
    const approvedUploads = moderationRecords.filter(r => 
      r.status === 'approved'
    ).length;

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Trust criteria:
    // - 10+ approved uploads
    // - 0 rejected uploads
    // - Account age > 30 days
    // - Email verified
    const isTrustedUser = approvedUploads >= 10 && 
                         rejectedUploads === 0 &&
                         accountAge >= 30 &&
                         user.emailVerified;

    return {
      totalUploads,
      rejectedUploads,
      approvedUploads,
      isTrustedUser,
      accountAge
    };
  }

  /**
   * Notify moderators of urgent content
   */
  async notifyModeratorsUrgent(moderation) {
    // TODO: Send Slack/email notification to moderation team
    logger.warn('URGENT MODERATION REQUIRED', {
      moderationId: moderation._id,
      userId: moderation.userId,
      flags: moderation.aiScanResults.flags,
      priority: moderation.priority
    });

    // If you have Slack webhook configured:
    if (process.env.SLACK_MODERATION_WEBHOOK) {
      try {
        await fetch(process.env.SLACK_MODERATION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 URGENT: Photo moderation required`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Urgent Photo Review Needed*\n` +
                        `User: ${moderation.userId}\n` +
                        `Priority: ${moderation.priority}\n` +
                        `Flags: ${Object.entries(moderation.aiScanResults.flags)
                          .filter(([_, v]) => v > 50)
                          .map(([k, v]) => `${k}: ${v.toFixed(1)}%`)
                          .join(', ')}`
                }
              }
            ]
          })
        });
      } catch (error) {
        logger.error('Failed to send Slack notification', { error: error.message });
      }
    }
  }

  /**
   * Batch scan multiple images (for existing uploads)
   */
  async batchScanImages(imageUrls) {
    const results = [];

    for (const url of imageUrls) {
      try {
        // Download image
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Scan
        const result = await this.scanImage(buffer, url, url, null, 'gallery');
        results.push(result);

        // Rate limiting: AWS allows 1 request/second
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error('Batch scan failed for image', { url, error: error.message });
        results.push({ error: error.message, url });
      }
    }

    return results;
  }
}

module.exports = new ContentModerationService();
