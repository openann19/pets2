const User = require('../models/User');
const Pet = require('../models/Pet');
const Story = require('../models/Story');
const ContentModeration = require('../models/ContentModeration');
const logger = require('../utils/logger');

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
      name: 'violence',
      labels: ['violence', 'blood', 'injury', 'weapon'],
      severity: 'high',
      action: 'quarantine'
    },
    {
      name: 'animal_cruelty_images',
      labels: ['animal_abuse', 'animal_cruelty', 'animal_suffering'],
      severity: 'critical',
      action: 'escalate'
    }
  ],

  // User behavior rules
  userRules: [
    {
      name: 'rapid_posting',
      condition: (user) => user.postsLast24h > 20,
      severity: 'medium',
      action: 'flag'
    },
    {
      name: 'high_report_rate',
      condition: (user) => user.reportsReceived > 5,
      severity: 'high',
      action: 'quarantine'
    },
    {
      name: 'suspicious_account',
      condition: (user) => user.accountAgeDays < 7 && user.postsCount > 10,
      severity: 'medium',
      action: 'flag'
    }
  ]
};

class AutomatedModerationService {
  /**
   * Analyze content and apply automated moderation rules
   * @param {Object} contentData - Content to analyze
   * @param {string} contentData.contentId - Content ID
   * @param {string} contentData.contentType - Type of content
   * @param {Object} contentData.content - The actual content object
   * @param {Object} contentData.user - User who created the content
   */
  async analyzeContent({ contentId, contentType, content, user }) {
    const flags = [];

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
  async analyzeText(text) {
    const flags = [];

    for (const rule of moderationRules.textRules) {
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
  async analyzeImages(images) {
    const flags = [];

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
  async analyzeUserBehavior(user) {
    const flags = [];

    // Calculate user metrics (this would be cached in a real implementation)
    const postsLast24h = await this.getUserPostsLast24h(user._id);
    const reportsReceived = await this.getUserReportsReceived(user._id);
    const accountAgeDays = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

    const userData = {
      ...user.toObject(),
      postsLast24h,
      reportsReceived,
      accountAgeDays
    };

    for (const rule of moderationRules.userRules) {
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
  async applyModeration(contentId, contentType, flags, content, user) {
    // Determine the highest severity action
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const actionOrder = { flag: 1, quarantine: 2, escalate: 3 };

    let highestSeverity = 'low';
    let recommendedAction = 'flag';

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
      moderationRecord.automatedFlags.push(...flags);
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
  createContentSnapshot(content, contentType) {
    const snapshot = {
      title: '',
      description: '',
      mediaUrls: [],
      textContent: '',
      metadata: {}
    };

    switch (contentType) {
      case 'pet':
        snapshot.title = content.name || '';
        snapshot.description = content.description || '';
        snapshot.mediaUrls = content.photos ? content.photos.map(p => p.url) : [];
        snapshot.metadata = {
          species: content.species,
          breed: content.breed,
          age: content.age,
          location: content.location
        };
        break;

      case 'story':
        snapshot.title = content.title || '';
        snapshot.description = content.excerpt || content.content?.substring(0, 200) || '';
        snapshot.mediaUrls = content.media ? content.media.map(m => m.url) : [];
        snapshot.textContent = content.content || '';
        break;

      case 'user_profile':
        snapshot.title = `${content.firstName} ${content.lastName}`;
        snapshot.description = content.bio || '';
        snapshot.mediaUrls = content.avatar ? [content.avatar] : [];
        break;
    }

    return snapshot;
  }

  /**
   * Update content status based on moderation decision
   */
  async updateContentStatus(contentId, contentType, status) {
    let Model;
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
        return;
    }

    const updateData = { moderationStatus: status };

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
  async getUserPostsLast24h(userId) {
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
  async getUserReportsReceived(userId) {
    const Report = require('../models/Report');
    return Report.countDocuments({ reportedUserId: userId });
  }

  /**
   * Get severity score for sorting
   */
  getSeverityScore(severity) {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 };
    return scores[severity] || 1;
  }

  /**
   * Process content for moderation (called from content creation/update hooks)
   */
  async moderateContent(contentId, contentType, content, user) {
    return this.analyzeContent({ contentId, contentType, content, user });
  }

  /**
   * Bulk re-analyze content with updated rules
   */
  async reanalyzeContentBatch(contentIds, contentType) {
    const results = [];

    for (const contentId of contentIds) {
      try {
        let content, user;

        // Fetch content and user based on type
        switch (contentType) {
          case 'pet':
            content = await Pet.findById(contentId).populate('owner');
            user = content?.owner;
            break;
          case 'story':
            content = await Story.findById(contentId).populate('author');
            user = content?.author;
            break;
          case 'user_profile':
            content = await User.findById(contentId);
            user = content;
            break;
        }

        if (content && user) {
          const result = await this.analyzeContent({
            contentId,
            contentType,
            content,
            user
          });
          results.push({ contentId, success: true, result });
        } else {
          results.push({ contentId, success: false, error: 'Content not found' });
        }
      } catch (error) {
        results.push({ contentId, success: false, error: error.message });
      }
    }

    return results;
  }
}

module.exports = new AutomatedModerationService();
