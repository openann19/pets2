import User from '../models/User';
import Pet from '../models/Pet';
import Story from '../models/Story';
import ContentModeration from '../models/ContentModeration';
import logger from '../utils/logger';

// Moderation result types
interface ModerationResult {
  approved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
  action: 'approve' | 'flag' | 'quarantine' | 'escalate';
}

interface UserBehaviorMetadata {
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  additionalData?: Record<string, unknown>;
}

// Automated moderation rules configuration
const moderationRules = {
  // Text content rules
  textRules: [
    {
      name: 'profanity_filter',
      pattern: /\b(fuck|shit|cunt|bitch|asshole|bastard|damn|hell)\b/gi,
      severity: 'medium',
      action: 'flag'
    },
    {
      name: 'spam_detection',
      pattern: /(\b(?:free|cheap|discount|buy now|click here|limited time)\b.*){3,}/gi,
      severity: 'medium',
      action: 'flag'
    },
    {
      name: 'contact_info',
      pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
      severity: 'high',
      action: 'quarantine'
    },
    {
      name: 'animal_cruelty',
      pattern: /\b(beat|kick|hit|abuse|cruel|hurt|pain|torture)\b.*\b(animal|pet|dog|cat)\b/gi,
      severity: 'critical',
      action: 'escalate'
    },
    {
      name: 'underage_content',
      pattern: /\b(child|kid|teen|minor|underage|under 18)\b.*\b(date|meet|sex|naked|nude)\b/gi,
      severity: 'critical',
      action: 'escalate'
    }
  ],

  // Image analysis rules (would integrate with AI vision service)
  imageRules: [
    {
      name: 'nsfw_content',
      labels: ['nudity', 'sexual_content', 'adult_content'],
      severity: 'critical',
      action: 'escalate'
    },
    {
      name: 'violence_content',
      labels: ['violence', 'weapon', 'blood', 'gore'],
      severity: 'high',
      action: 'quarantine'
    },
    {
      name: 'animal_abuse',
      labels: ['animal_cruelty', 'animal_abuse', 'neglect'],
      severity: 'critical',
      action: 'escalate'
    }
  ],

  // User behavior rules
  behaviorRules: [
    {
      name: 'rapid_posting',
      threshold: 10, // posts per minute
      severity: 'medium',
      action: 'flag'
    },
    {
      name: 'repeated_violations',
      threshold: 3, // violations in 24 hours
      severity: 'high',
      action: 'quarantine'
    },
    {
      name: 'suspicious_patterns',
      patterns: ['same_content_repeated', 'bot_like_behavior'],
      severity: 'medium',
      action: 'flag'
    }
  ]
};

/**
 * Moderate text content
 * @param content - Text content to moderate
 * @param userId - User ID
 * @param contentType - Type of content
 * @returns Moderation result
 */
export const moderateTextContent = async (content: string, userId: string, contentType: string): Promise<any> => {
  try {
    if (!content || typeof content !== 'string') {
      return { safe: true, confidence: 1.0, flags: [], action: 'approve' };
    }

    const flags: string[] = [];
    let maxSeverity = 'low';
    let recommendedAction = 'approve';

    // Apply text rules
    for (const rule of moderationRules.textRules) {
      if (rule.pattern.test(content)) {
        flags.push(rule.name);
        
        // Update severity and action based on rule
        if (rule.severity === 'critical') {
          maxSeverity = 'critical';
          recommendedAction = 'escalate';
        } else if (rule.severity === 'high' && maxSeverity !== 'critical') {
          maxSeverity = 'high';
          recommendedAction = 'quarantine';
        } else if (rule.severity === 'medium' && maxSeverity === 'low') {
          maxSeverity = 'medium';
          recommendedAction = 'flag';
        }
      }
    }

    // Calculate confidence based on flags
    const confidence = flags.length === 0 ? 1.0 : Math.max(0.1, 1.0 - (flags.length * 0.2));

    const result = {
      safe: flags.length === 0,
      confidence,
      flags,
      severity: maxSeverity,
      action: recommendedAction,
      contentType,
      userId,
      moderatedAt: new Date()
    };

    // Log moderation result
    await logModerationResult(contentType, userId, result);

    return result;
  } catch (error) {
    logger.error('Error moderating text content', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId, 
      contentType 
    });
    
    // Return safe default on error
    return { 
      safe: true, 
      confidence: 0.5, 
      flags: [], 
      action: 'approve',
      error: 'Moderation failed'
    };
  }
};

/**
 * Moderate image content (placeholder for AI integration)
 * @param imageUrl - Image URL
 * @param userId - User ID
 * @param contentType - Type of content
 * @returns Moderation result
 */
export const moderateImageContent = async (imageUrl: string, userId: string, contentType: string): Promise<any> => {
  try {
    if (!imageUrl) {
      return { safe: true, confidence: 1.0, flags: [], action: 'approve' };
    }

    // This would integrate with AI vision service
    // For now, return a placeholder result
    const result = {
      safe: true,
      confidence: 0.8,
      flags: [],
      severity: 'low',
      action: 'approve',
      contentType,
      userId,
      imageUrl,
      moderatedAt: new Date()
    };

    // Log moderation result
    await logModerationResult(contentType, userId, result);

    return result;
  } catch (error) {
    logger.error('Error moderating image content', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId, 
      contentType,
      imageUrl 
    });
    
    return { 
      safe: true, 
      confidence: 0.5, 
      flags: [], 
      action: 'approve',
      error: 'Image moderation failed'
    };
  }
};

/**
 * Moderate user behavior
 * @param userId - User ID
 * @param action - User action
 * @param metadata - Additional metadata
 * @returns Moderation result
 */
export const moderateUserBehavior = async (userId: string, action: string, metadata: UserBehaviorMetadata = {}): Promise<ModerationResult> => {
  try {
    if (!userId || !action) {
      return { safe: true, confidence: 1.0, flags: [], action: 'approve' };
    }

    const flags: string[] = [];
    let maxSeverity = 'low';
    let recommendedAction = 'approve';

    // Check rapid posting
    if (action === 'post_content') {
      const recentPosts = await getRecentUserActivity(userId, 'post_content', 1); // Last minute
      if (recentPosts.length >= moderationRules.behaviorRules[0].threshold) {
        flags.push('rapid_posting');
        maxSeverity = 'medium';
        recommendedAction = 'flag';
      }
    }

    // Check repeated violations
    const recentViolations = await getRecentUserViolations(userId, 24); // Last 24 hours
    if (recentViolations.length >= moderationRules.behaviorRules[1].threshold) {
      flags.push('repeated_violations');
      maxSeverity = 'high';
      recommendedAction = 'quarantine';
    }

    const result = {
      safe: flags.length === 0,
      confidence: flags.length === 0 ? 1.0 : Math.max(0.1, 1.0 - (flags.length * 0.3)),
      flags,
      severity: maxSeverity,
      action: recommendedAction,
      userId,
      actionType: action,
      moderatedAt: new Date()
    };

    // Log moderation result
    await logModerationResult('behavior', userId, result);

    return result;
  } catch (error) {
    logger.error('Error moderating user behavior', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId, 
      action 
    });
    
    return { 
      safe: true, 
      confidence: 0.5, 
      flags: [], 
      action: 'approve',
      error: 'Behavior moderation failed'
    };
  }
};

/**
 * Get recent user activity
 * @param userId - User ID
 * @param action - Action type
 * @param minutes - Time window in minutes
 * @returns Recent activity
 */
const getRecentUserActivity = async (userId: string, action: string, minutes: number): Promise<any[]> => {
  try {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    // This would query the appropriate model based on action type
    // For now, return empty array as placeholder
    return [];
  } catch (error) {
    logger.error('Error getting recent user activity', { error, userId, action, minutes });
    return [];
  }
};

/**
 * Get recent user violations
 * @param userId - User ID
 * @param hours - Time window in hours
 * @returns Recent violations
 */
const getRecentUserViolations = async (userId: string, hours: number): Promise<any[]> => {
  try {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await ContentModeration.find({
      userId,
      status: { $in: ['flagged', 'rejected'] },
      createdAt: { $gte: cutoffTime }
    });
  } catch (error) {
    logger.error('Error getting recent user violations', { error, userId, hours });
    return [];
  }
};

/**
 * Log moderation result
 * @param contentType - Type of content
 * @param userId - User ID
 * @param result - Moderation result
 */
const logModerationResult = async (contentType: string, userId: string, result: ModerationResult): Promise<void> => {
  try {
    await ContentModeration.create({
      contentType,
      userId,
      status: result.safe ? 'approved' : 'flagged',
      aiAnalysis: {
        confidence: result.confidence,
        flags: result.flags,
        safe: result.safe
      },
      flags: result.flags,
      confidence: result.confidence,
      priority: result.severity === 'critical' ? 'urgent' : 
                result.severity === 'high' ? 'high' : 
                result.severity === 'medium' ? 'medium' : 'low',
      createdAt: new Date()
    });
  } catch (error) {
    logger.error('Error logging moderation result', { error, contentType, userId });
  }
};

/**
 * Get moderation statistics
 * @param days - Number of days to analyze
 * @returns Moderation statistics
 */
export const getModerationStats = async (days: number = 7): Promise<any> => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const stats = await ContentModeration.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalModerations: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          flagged: { $sum: { $cond: [{ $eq: ['$status', 'flagged'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          avgConfidence: { $avg: '$confidence' },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          urgentPriority: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
        }
      }
    ]);

    return stats[0] || {
      totalModerations: 0,
      approved: 0,
      flagged: 0,
      rejected: 0,
      avgConfidence: 0,
      highPriority: 0,
      urgentPriority: 0
    };
  } catch (error) {
    logger.error('Error getting moderation stats', { error, days });
    throw error;
  }
};

/**
 * Get flagged content for review
 * @param limit - Number of items to retrieve
 * @returns Flagged content
 */
export const getFlaggedContent = async (limit: number = 50): Promise<any[]> => {
  try {
    return await ContentModeration.find({
      status: { $in: ['flagged', 'pending'] },
      priority: { $in: ['high', 'urgent'] }
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit);
  } catch (error) {
    logger.error('Error getting flagged content', { error, limit });
    throw error;
  }
};

/**
 * Update moderation rules
 * @param rules - New rules configuration
 * @returns Success status
 */
export const updateModerationRules = async (rules: Record<string, unknown>): Promise<void> => {
  try {
    // This would update the rules configuration in the database
    // For now, just log the update
    logger.info('Moderation rules updated', { rules });
  } catch (error) {
    logger.error('Error updating moderation rules', { error, rules });
    throw error;
  }
};

export default {
  moderateTextContent,
  moderateImageContent,
  moderateUserBehavior,
  getModerationStats,
  getFlaggedContent,
  updateModerationRules,
};
