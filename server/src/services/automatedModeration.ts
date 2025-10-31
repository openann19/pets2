import User from '../models/User';
import Pet from '../models/Pet';
import Story from '../models/Story';
import ContentModeration from '../models/ContentModeration';
const logger = require('../utils/logger');

// Type definitions
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ActionType = 'flag' | 'quarantine' | 'escalate';
export type ContentType = 'pet' | 'story' | 'user_profile';

// Interface for moderation rule
export interface ModerationRule {
  name: string;
  pattern?: RegExp;
  severity: SeverityLevel;
  action: ActionType;
  labels?: string[];
  condition?: (data: unknown) => boolean;
}

// Interface for moderation flag
export interface ModerationFlag {
  ruleName: string;
  severity: SeverityLevel;
  action: ActionType;
  confidence: number;
  matches?: number;
  flaggedAt: Date;
}

// Interface for content data
export interface ContentData {
  contentId: string;
  contentType: ContentType;
  content: Record<string, unknown>;
  user: {
    _id?: string;
    postsLast24h?: number;
    reportsReceived?: number;
    accountAgeDays?: number;
    postsCount?: number;
    [key: string]: unknown;
  };
}

// Interface for content snapshot
export interface ContentSnapshot {
  title: string;
  description: string;
  mediaUrls: string[];
  textContent: string;
  metadata: Record<string, unknown>;
}

// Interface for moderation result
export interface ModerationResult {
  flags: ModerationFlag[];
  actionTaken: boolean;
}

// Interface for batch reanalysis result
export interface BatchResult {
  contentId: string;
  success: boolean;
  result?: ModerationResult;
  error?: string;
}

// Automated moderation rules configuration
const moderationRules = {
  // Text content rules
  textRules: [
    {
      name: 'profanity_filter',
      pattern: /\b(fuck|shit|cunt|bitch|asshole|bastard|damn|hell)\b/gi,
      severity: 'medium' as SeverityLevel,
      action: 'flag' as ActionType
    },
    {
      name: 'spam_detection',
      pattern: /(\b(?:free|cheap|discount|buy now|click here|limited time)\b.*){3,}/gi,
      severity: 'medium' as SeverityLevel,
      action: 'flag' as ActionType
    },
    {
      name: 'contact_info',
      pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi,
      severity: 'high' as SeverityLevel,
      action: 'quarantine' as ActionType
    },
    {
      name: 'animal_cruelty',
      pattern: /\b(beat|kick|hit|abuse|cruel|hurt|pain|torture)\b.*\b(animal|pet|dog|cat)\b/gi,
      severity: 'critical' as SeverityLevel,
      action: 'escalate' as ActionType
    },
    {
      name: 'underage_content',
      pattern: /\b(child|kid|teen|minor|underage|under 18)\b.*\b(date|meet|sex|naked|nude)\b/gi,
      severity: 'critical' as SeverityLevel,
      action: 'escalate' as ActionType
    }
  ] as ModerationRule[],

  // Image analysis rules (would integrate with AI vision service)
  imageRules: [
    {
      name: 'nsfw_content',
      labels: ['nudity', 'sexual_content', 'adult_content'],
      severity: 'critical' as SeverityLevel,
      action: 'escalate' as ActionType
    },
    {
      name: 'violence',
      labels: ['violence', 'blood', 'injury', 'weapon'],
      severity: 'high' as SeverityLevel,
      action: 'quarantine' as ActionType
    },
    {
      name: 'animal_cruelty_images',
      labels: ['animal_abuse', 'animal_cruelty', 'animal_suffering'],
      severity: 'critical' as SeverityLevel,
      action: 'escalate' as ActionType
    }
  ] as ModerationRule[],

  // User behavior rules
  userRules: [
    {
      name: 'rapid_posting',
      condition: (user: unknown) => {
        const userData = user as { postsLast24h?: number };
        return (userData.postsLast24h || 0) > 20;
      },
      severity: 'medium' as SeverityLevel,
      action: 'flag' as ActionType
    },
    {
      name: 'high_report_rate',
      condition: (user: unknown) => {
        const userData = user as { reportsReceived?: number };
        return (userData.reportsReceived || 0) > 5;
      },
      severity: 'high' as SeverityLevel,
      action: 'quarantine' as ActionType
    },
    {
      name: 'suspicious_account',
      condition: (user: unknown) => {
        const userData = user as { accountAgeDays?: number; postsCount?: number };
        return (userData.accountAgeDays || 0) < 7 && (userData.postsCount || 0) > 10;
      },
      severity: 'medium' as SeverityLevel,
      action: 'flag' as ActionType
    }
  ] as ModerationRule[]
};

class AutomatedModerationService {
  /**
   * Analyze content and apply automated moderation rules
   */
  async analyzeContent({ contentId, contentType, content, user }: ContentData): Promise<ModerationResult> {
    const flags: ModerationFlag[] = [];

    try {
      // Text analysis
      if (content.description || content.bio || content.content) {
        const text = [content.description, content.bio, content.content]
          .filter(Boolean)
          .join(' ');

        if (text) {
          const textFlags = await this.analyzeText(text);
          flags.push(...textFlags);
        }
      }

      // Image analysis (placeholder for AI vision service)
      if (content.photos || content.media) {
        const images = content.photos || content.media || [];
        const imageFlags = await this.analyzeImages(images);
        flags.push(...imageFlags);
      }

      // User behavior analysis
      const userFlags = await this.analyzeUserBehavior(user);
      flags.push(...userFlags);

      // Apply moderation based on flags
      if (flags.length > 0) {
        await this.applyModeration(contentId, contentType, flags, content, user);
      }

      logger.info(`Automated moderation completed for ${contentType}:${contentId}`, {
        flagsCount: flags.length,
        highestSeverity: Math.max(...flags.map(f => this.getSeverityScore(f.severity)))
      });

      return { flags, actionTaken: flags.length > 0 };

    } catch (error) {
      logger.error('Automated moderation analysis failed', { error, contentId, contentType });
      return { flags: [], actionTaken: false };
    }
  }

  /**
   * Analyze text content for violations
   */
  async analyzeText(text: string): Promise<ModerationFlag[]> {
    const flags: ModerationFlag[] = [];

    for (const rule of moderationRules.textRules) {
      if (!rule.pattern) continue;
      const matches = text.match(rule.pattern);
      if (matches) {
        flags.push({
          ruleName: rule.name,
          severity: rule.severity,
          action: rule.action,
          confidence: Math.min(1.0, matches.length * 0.3), // Higher confidence for multiple matches
          matches: matches.length,
          flaggedAt: new Date()
        });
      }
    }

    return flags;
  }

  /**
   * Analyze images for violations (placeholder for AI vision service)
   */
  async analyzeImages(images: Array<{ url?: string }>): Promise<ModerationFlag[]> {
    const flags: ModerationFlag[] = [];

    // This would integrate with services like Google Vision AI, AWS Rekognition, etc.
    // For now, we'll use placeholder logic
    for (const image of images) {
      // Placeholder: Check for suspicious file names or patterns
      if (image.url && /\b(nude|naked|sex|porn)\b/i.test(image.url)) {
        flags.push({
          ruleName: 'suspicious_image_url',
          severity: 'high',
          action: 'quarantine',
          confidence: 0.8,
          flaggedAt: new Date()
        });
      }
    }

    return flags;
  }

  /**
   * Analyze user behavior for suspicious patterns
   */
  async analyzeUserBehavior(user: { _id: string; createdAt: Date; toObject?: () => Record<string, unknown> }): Promise<ModerationFlag[]> {
    const flags: ModerationFlag[] = [];

    // Calculate user metrics (this would be cached in a real implementation)
    const postsLast24h = await this.getUserPostsLast24h(user._id);
    const reportsReceived = await this.getUserReportsReceived(user._id);
    const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    const userData = {
      ...(user.toObject ? user.toObject() : { _id: user._id, createdAt: user.createdAt }),
      postsLast24h,
      reportsReceived,
      accountAgeDays
    };

    for (const rule of moderationRules.userRules) {
      if (!rule.condition) continue;
      if (rule.condition(userData)) {
        flags.push({
          ruleName: rule.name,
          severity: rule.severity,
          action: rule.action,
          confidence: 0.9,
          flaggedAt: new Date()
        });
      }
    }

    return flags;
  }

  /**
   * Apply moderation based on flags
   */
  async applyModeration(
    contentId: string, 
    contentType: ContentType, 
    flags: ModerationFlag[], 
    content: Record<string, unknown>, 
    user: Record<string, unknown>
  ): Promise<void> {
    // Determine the highest severity action
    const severityOrder: Record<SeverityLevel, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const actionOrder: Record<ActionType, number> = { flag: 1, quarantine: 2, escalate: 3 };

    let highestSeverity: SeverityLevel = 'low';
    let recommendedAction: ActionType = 'flag';

    for (const flag of flags) {
      if (severityOrder[flag.severity] > severityOrder[highestSeverity]) {
        highestSeverity = flag.severity;
      }
      if (actionOrder[flag.action] > actionOrder[recommendedAction]) {
        recommendedAction = flag.action;
      }
    }

    // Create or update moderation record
    let moderationRecord = await ContentModeration.findOne({
      contentId,
      contentType
    });

    if (!moderationRecord) {
      moderationRecord = new ContentModeration({
        contentId,
        contentType,
        moderationStatus: 'pending',
        moderationLevel: highestSeverity === 'critical' ? 'senior_review' : 'human_review',
        priority: highestSeverity === 'critical' ? 'urgent' : highestSeverity === 'high' ? 'high' : 'medium',
        automatedFlags: flags,
        contentSnapshot: this.createContentSnapshot(content, contentType)
      });
    } else {
      // Update existing record with new flags
      if (moderationRecord.automatedFlags) {
        moderationRecord.automatedFlags.push(...flags);
      } else {
        moderationRecord.automatedFlags = flags;
      }
      moderationRecord.priority = highestSeverity === 'critical' ? 'urgent' :
                                  highestSeverity === 'high' ? 'high' : 'medium';
      moderationRecord.moderationLevel = highestSeverity === 'critical' ? 'senior_review' : 'human_review';
    }

    // Auto-apply actions for high-confidence critical flags
    const criticalFlags = flags.filter(f => f.severity === 'critical' && f.confidence > 0.8);
    if (criticalFlags.length > 0) {
      moderationRecord.moderationStatus = 'escalated';
      moderationRecord.escalatedAt = new Date();
      moderationRecord.escalationReason = `Automated detection: ${criticalFlags.map(f => f.ruleName).join(', ')}`;
      moderationRecord.escalationLevel = 'legal';
    }

    await moderationRecord.save();

    // Update content status if auto-escalated
    if (moderationRecord.moderationStatus === 'escalated') {
      await this.updateContentStatus(contentId, contentType, 'escalated');
    }

    logger.info(`Moderation applied to ${contentType}:${contentId}`, {
      flagsCount: flags.length,
      highestSeverity,
      recommendedAction,
      autoEscalated: criticalFlags.length > 0,
      userId: user?._id?.toString?.(),
      userRole: user?.role
    });
  }

  /**
   * Create a snapshot of content for review
   */
  createContentSnapshot(content: Record<string, unknown>, contentType: ContentType): ContentSnapshot {
    const snapshot: ContentSnapshot = {
      title: '',
      description: '',
      mediaUrls: [],
      textContent: '',
      metadata: {}
    };

    switch (contentType) {
      case 'pet': {
        const petContent = content as {
          name?: string;
          description?: string;
          photos?: Array<{ url?: string }>;
          species?: unknown;
          breed?: unknown;
          age?: unknown;
          location?: unknown;
        };
        snapshot.title = petContent.name || '';
        snapshot.description = petContent.description || '';
        snapshot.mediaUrls = petContent.photos ? petContent.photos.map((p) => p.url || '').filter(Boolean) : [];
        snapshot.metadata = {
          species: petContent.species,
          breed: petContent.breed,
          age: petContent.age,
          location: petContent.location
        };
        break;
      }

      case 'story': {
        const storyContent = content as {
          title?: string;
          excerpt?: string;
          content?: string | { substring?: (start: number, end: number) => string };
          media?: Array<{ url?: string }>;
        };
        snapshot.title = storyContent.title || '';
        const contentText = typeof storyContent.content === 'string' 
          ? storyContent.content 
          : storyContent.content?.substring?.(0, 200) || '';
        snapshot.description = storyContent.excerpt || contentText;
        snapshot.mediaUrls = storyContent.media ? storyContent.media.map((m) => m.url || '').filter(Boolean) : [];
        snapshot.textContent = typeof storyContent.content === 'string' ? storyContent.content : '';
        break;
      }

      case 'user_profile': {
        const userContent = content as {
          firstName?: string;
          lastName?: string;
          bio?: string;
          avatar?: string;
        };
        snapshot.title = `${userContent.firstName || ''} ${userContent.lastName || ''}`.trim();
        snapshot.description = userContent.bio || '';
        snapshot.mediaUrls = userContent.avatar ? [userContent.avatar] : [];
        break;
      }
    }

    return snapshot;
  }

  /**
   * Update content status based on moderation decision
   */
  async updateContentStatus(contentId: string, contentType: ContentType, status: string): Promise<void> {
    type ModelType = typeof Pet | typeof Story | typeof User;
    let Model: ModelType;
    switch (contentType) {
      case 'pet':
        Model = Pet;
        break;
      case 'story':
        Model = Story;
        break;
      case 'user_profile':
        Model = User;
        break;
      default:
        logger.warn('Unknown content type for status update', { contentType, contentId });
        return;
    }

    const updateData: Record<string, unknown> = { moderationStatus: status };

    // Set specific timestamps and flags
    if (status === 'quarantined') {
      updateData.isActive = false;
      updateData.quarantinedAt = new Date();
    } else if (status === 'rejected') {
      updateData.isActive = false;
      updateData.rejectedAt = new Date();
    } else if (status === 'approved') {
      updateData.isActive = true;
      updateData.approvedAt = new Date();
    }

    await Model.findByIdAndUpdate(contentId, updateData);
  }

  /**
   * Get user's posts in last 24 hours
   */
  async getUserPostsLast24h(userId: string): Promise<number> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [petCount, storyCount] = await Promise.all([
      Pet.countDocuments({ owner: userId, createdAt: { $gte: yesterday } }),
      Story.countDocuments({ author: userId, createdAt: { $gte: yesterday } })
    ]);

    return petCount + storyCount;
  }

  /**
   * Get reports received by user
   */
  async getUserReportsReceived(userId: string): Promise<number> {
    const Report = require('../models/Report');
    return Report.countDocuments({ reportedUserId: userId });
  }

  /**
   * Get severity score for sorting
   */
  getSeverityScore(severity: SeverityLevel): number {
    const scores: Record<SeverityLevel, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[severity] || 1;
  }

  /**
   * Process content for moderation (called from content creation/update hooks)
   */
  async moderateContent(
    contentId: string, 
    contentType: ContentType, 
    content: Record<string, unknown>, 
    user: Record<string, unknown>
  ): Promise<ModerationResult> {
    return this.analyzeContent({ contentId, contentType, content, user });
  }

  /**
   * Bulk re-analyze content with updated rules
   */
  async reanalyzeContentBatch(contentIds: string[], contentType: ContentType): Promise<BatchResult[]> {
    const results: BatchResult[] = [];

    for (const contentId of contentIds) {
      try {
        let fetchedContent: Record<string, unknown> | null = null;
        let fetchedUser: Record<string, unknown> | null = null;

        // Fetch content and user based on type
        switch (contentType) {
          case 'pet': {
            fetchedContent = await Pet.findById(contentId).populate('owner').lean() as Record<string, unknown> | null;
            if (fetchedContent) {
              const petContent = fetchedContent as { owner?: { toString: () => string } | string | Record<string, unknown> };
              const ownerId = typeof petContent.owner === 'string' 
                ? petContent.owner 
                : typeof petContent.owner === 'object' && petContent.owner !== null && '_id' in petContent.owner
                  ? String(petContent.owner._id)
                  : petContent.owner?.toString();
              if (ownerId) {
                fetchedUser = await User.findById(ownerId).lean() as Record<string, unknown> | null;
              }
            }
            break;
          }
          case 'story': {
            fetchedContent = await Story.findById(contentId).populate('author').lean() as Record<string, unknown> | null;
            if (fetchedContent) {
              const storyContent = fetchedContent as { author?: { toString: () => string } | string | Record<string, unknown> };
              const authorId = typeof storyContent.author === 'string'
                ? storyContent.author
                : typeof storyContent.author === 'object' && storyContent.author !== null && '_id' in storyContent.author
                  ? String(storyContent.author._id)
                  : storyContent.author?.toString();
              if (authorId) {
                fetchedUser = await User.findById(authorId).lean() as Record<string, unknown> | null;
              }
            }
            break;
          }
          case 'user_profile':
            fetchedUser = await User.findById(contentId).lean() as Record<string, unknown> | null;
            fetchedContent = fetchedUser;
            break;
        }

        if (fetchedContent && fetchedUser) {
          const result = await this.analyzeContent({
            contentId,
            contentType,
            content: fetchedContent,
            user: fetchedUser
          });
          results.push({ contentId, success: true, result });
        } else {
          results.push({ contentId, success: false, error: 'Content not found' });
        }
      } catch (error) {
        results.push({ contentId, success: false, error: (error as Error).message });
      }
    }

    return results;
  }
}

export default new AutomatedModerationService();
