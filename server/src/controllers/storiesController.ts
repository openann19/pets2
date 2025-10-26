/**
 * Stories Controller for PawfectMatch
 * Handles story creation, feed, interactions, and management
 */

import type { Request, Response } from 'express';
import Story from '../models/Story';
import AnalyticsEvent from '../models/AnalyticsEvent';
import Notification from '../models/Notification';
import { createDMFromStoryReply } from '../services/chatService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import UserAuditLog from '../models/UserAuditLog';
const logger = require('../utils/logger');

// Type definitions
interface AuthRequest extends Request {
  user?: any;
}

interface CreateStoryBody {
  caption?: string;
  duration?: string | number;
  mediaType?: string;
}

interface ReplyToStoryBody {
  content: string;
  type?: 'text' | 'dm';
}

interface StoryFeedQuery {
  limit?: string | number;
  cursor?: string;
  mode?: 'flat' | 'grouped';
}

interface UserStoriesQuery {
  page?: string | number;
  limit?: string | number;
  cursor?: string;
}

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  eager?: Array<{
    secure_url: string;
    format: string;
  }>;
}

interface StoryView {
  userId: string;
  viewedAt: Date;
}

// Constants
const STORY_DEFAULT_DURATION = 5; // seconds for photos
const STORY_MAX_DURATION = 60; // safety cap
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_CAPTION_LENGTH = 2200;

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

// Helper functions
function ok(res: Response, status: number, payload: any) {
  return res.status(status).json({ success: true, ...payload });
}

function fail(res: Response, status: number, message: string, meta?: any) {
  const body: any = { success: false, message };
  if (meta && process.env.NODE_ENV !== 'production') {
    body.meta = meta;
  }
  return res.status(status).json(body);
}

async function track(eventType: string, payload: any = {}) {
  try {
    await AnalyticsEvent.create({
      userId: payload.userId || undefined,
      eventType,
      entityType: payload.entityType,
      entityId: payload.entityId,
      durationMs: payload.durationMs,
      success: payload.success !== false,
      errorCode: payload.errorCode,
      metadata: payload.metadata,
    });
  } catch (e) {
    logger.warn?.('Analytics track failed', { eventType, error: (e as Error)?.message });
  }
}

function requireAuth(req: AuthRequest, res: Response): any {
  const user = req.user;
  if (!user || !user._id) {
    fail(res, 401, 'Unauthorized');
    return null;
  }
  return user;
}

function normalizeMediaType(mediaType: string | undefined, file: any): 'photo' | 'video' {
  const raw = (mediaType || '').toLowerCase();
  if (raw === 'video') return 'video';
  if (raw === 'photo' || raw === 'image') return 'photo';
  if (file && typeof file.mimetype === 'string') {
    if (file.mimetype.startsWith('video/')) return 'video';
    if (file.mimetype.startsWith('image/')) return 'photo';
  }
  return 'photo';
}

function cloudinaryOptions(normalizedType: 'photo' | 'video', userId: string) {
  const common = {
    folder: `stories/${userId}`,
    transformation: [
      { width: 1080, height: 1920, crop: 'limit' },
    ],
  };

  if (normalizedType === 'video') {
    return {
      ...common,
      resource_type: 'video',
      transformation: [
        ...common.transformation,
        { quality: 'auto', fetch_format: 'auto' },
      ],
      eager: [
        { width: 540, height: 960, crop: 'fill', gravity: 'auto', quality: 'auto:best', format: 'jpg' },
      ],
      eager_async: true,
    };
  }

  return {
    ...common,
    resource_type: 'image',
    transformation: [
      ...common.transformation,
      { quality: 'auto:good' },
    ],
  };
}

function deriveVideoThumbnail(uploadResult: CloudinaryUploadResult): string | null {
  const eagerThumb = Array.isArray(uploadResult?.eager)
    ? uploadResult.eager.find(e => /jpe?g|png$/i.test(e.format))
    : null;
  if (eagerThumb?.secure_url) return eagerThumb.secure_url;
  if (typeof uploadResult?.secure_url === 'string') {
    return uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg');
  }
  return null;
}

/**
 * Create a new story
 * POST /api/stories
 */
export const createStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    const { caption, duration, mediaType }: CreateStoryBody = req.body || {};
    const userId = authUser._id;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0 || !req.files[0].buffer) {
      return fail(res, 400, 'Media file is required');
    }

    const file = req.files[0];
    const normalizedType = normalizeMediaType(mediaType, file);
    const options = cloudinaryOptions(normalizedType, userId.toString());

    // File validations: mimetype and size caps
    const { mimetype, size } = file;
    if (normalizedType === 'photo') {
      if (mimetype && !ALLOWED_IMAGE_MIME.has(mimetype)) {
        return fail(res, 415, 'Unsupported image type');
      }
      if (typeof size === 'number' && size > MAX_IMAGE_SIZE_BYTES) {
        return fail(res, 413, 'Image too large');
      }
    } else {
      if (mimetype && !ALLOWED_VIDEO_MIME.has(mimetype)) {
        return fail(res, 415, 'Unsupported video type');
      }
      if (typeof size === 'number' && size > MAX_VIDEO_SIZE_BYTES) {
        return fail(res, 413, 'Video too large');
      }
    }

    // Caption validation
    if (caption && typeof caption === 'string' && caption.length > MAX_CAPTION_LENGTH) {
      return fail(res, 400, `Caption too long (max ${MAX_CAPTION_LENGTH} characters)`);
    }

    // Duration validation
    let storyDuration = STORY_DEFAULT_DURATION;
    if (duration !== undefined) {
      const parsed = parseInt(duration.toString(), 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= STORY_MAX_DURATION) {
        storyDuration = parsed;
      }
    }

    // Upload to Cloudinary
    const uploadResult: CloudinaryUploadResult = await uploadToCloudinary(file.buffer, options);

    // Prepare story data
    const storyData: any = {
      userId,
      mediaType: normalizedType,
      mediaUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      duration: storyDuration,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    if (caption && typeof caption === 'string') {
      storyData.caption = caption.trim();
    }

    if (normalizedType === 'video') {
      storyData.thumbnailUrl = deriveVideoThumbnail(uploadResult);
    }

    // Create story
    const story = await Story.create(storyData);

    // Track analytics
    await track('story_created', {
      userId,
      entityType: 'story',
      entityId: story._id,
      success: true,
      metadata: { mediaType: normalizedType, hasCaption: !!caption }
    });

    return ok(res, 201, {
      message: 'Story created successfully',
      story: {
        _id: story._id,
        mediaType: story.mediaType,
        mediaUrl: story.mediaUrl,
        thumbnailUrl: story.thumbnailUrl,
        duration: story.duration,
        caption: story.caption,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt
      }
    });

  } catch (error) {
    logger.error('Error creating story', { error: (error as Error)?.message, stack: (error as Error)?.stack });
    return fail(res, 500, 'Failed to create story');
  }
};

/**
 * Get stories feed
 * GET /api/stories/feed
 */
export const getStoriesFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    const userId = authUser._id;
    const followingIds = Array.isArray(authUser.following) ? authUser.following : [];
    const { limit: limitStr, cursor, mode }: StoryFeedQuery = req.query || {};
    const limit = Math.max(1, Math.min(parseInt(limitStr?.toString() || '0', 10) || 0, 100));

    if (mode === 'flat') {
      const items = await Story.getActiveFeedStories(userId, followingIds, { cursor, limit });
      const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;
      return ok(res, 200, { stories: items, nextCursor });
    }

    // Default: grouped feed (existing behavior)
    const grouped = await Story.getStoriesGroupedByUser(userId, followingIds, { cursor, limit });
    return ok(res, 200, { stories: grouped });

  } catch (error) {
    logger.error('Error fetching stories feed', { error: (error as Error)?.message, stack: (error as Error)?.stack });
    return fail(res, 500, 'Failed to fetch stories');
  }
};

/**
 * Get user's stories
 * GET /api/stories/:userId
 */
export const getUserStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params || {};
    if (!userId) {
      return fail(res, 400, 'userId is required');
    }

    const { page: pageStr, limit: limitStr, cursor }: UserStoriesQuery = req.query || {};
    const page = Math.max(1, parseInt(pageStr?.toString() || '1', 10));
    const limit = Math.max(1, Math.min(parseInt(limitStr?.toString() || '0', 10) || 0, 100));

    const stories = await Story.getUserActiveStories(userId, { cursor, limit: limit || undefined });
    const nextCursor = stories.length === limit ? stories[stories.length - 1].createdAt : null;

    return ok(res, 200, { stories, nextCursor, page, limit: limit || undefined });

  } catch (error) {
    logger.error('Error fetching user stories', { error: (error as Error)?.message, stack: (error as Error)?.stack });
    return fail(res, 500, 'Failed to fetch user stories');
  }
};

/**
 * Mark story as viewed
 * POST /api/stories/:storyId/view
 */
export const viewStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    const { storyId } = req.params || {};
    const userId = authUser._id;

    if (!storyId) {
      return fail(res, 400, 'storyId is required');
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return fail(res, 404, 'Story not found');
    }

    // Check if already viewed
    const existingView = story.views.find((view: StoryView) => view.userId.toString() === userId.toString());
    if (!existingView) {
      story.views.push({ userId, viewedAt: new Date() });
      story.viewCount = (story.viewCount || 0) + 1;
      await story.save();
    }

    // Track analytics
    await track('story_viewed', {
      userId,
      entityType: 'story',
      entityId: storyId,
      success: true
    });

    return ok(res, 200, { message: 'Story viewed successfully' });

  } catch (error) {
    logger.error('Error viewing story', { error: (error as Error)?.message, stack: (error as Error)?.stack });
    return fail(res, 500, 'Failed to view story');
  }
};

/**
 * Reply to a story
 * POST /api/stories/:storyId/reply
 */
export const replyToStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    const { storyId } = req.params || {};
    const { content, type }: ReplyToStoryBody = req.body;

    if (!storyId) {
      return fail(res, 400, 'storyId is required');
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return fail(res, 400, 'Reply content is required');
    }

    const story = await Story.findById(storyId).populate('userId', 'name username');
    if (!story) {
      return fail(res, 404, 'Story not found');
    }

    // Create reply
    const reply = {
      userId: authUser._id,
      userName: authUser.name || authUser.username,
      content: content.trim(),
      createdAt: new Date()
    };

    story.replies.push(reply);
    await story.save();

    // If user requested DM creation
    if (type === 'dm') {
      try {
        await createDMFromStoryReply(storyId, authUser._id, content.trim());
      } catch (dmError) {
        logger.warn('Failed to create DM from story reply', { error: dmError });
      }
    }

    // Track analytics
    await track('story_replied', {
      userId: authUser._id,
      entityType: 'story',
      entityId: storyId,
      success: true,
      metadata: { replyType: type || 'text' }
    });

    return ok(res, 201, { message: 'Reply added successfully', reply });

  } catch (error) {
    logger.error('Error replying to story', { error: (error as Error)?.message, stack: (error as Error)?.stack });
    return fail(res, 500, 'Failed to reply to story');
  }
};

/**
 * Delete a story
 * DELETE /api/stories/:storyId
 */
export const deleteStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    const { storyId } = req.params || {};
    const userId = authUser._id;

    if (!storyId) {
      return fail(res, 400, 'storyId is required');
    }

    const story = await Story.findOne({ _id: storyId, userId });
    if (!story) {
      return fail(res, 404, 'Story not found or not authorized');
    }

    // Delete from Cloudinary
    try {
      // Note: Cloudinary deletion logic would go here
    } catch (cloudError) {
      logger.warn('Failed to delete story media from cloud', { storyId, error: cloudError });
    }

    // Delete story
    await Story.findByIdAndDelete(storyId);

    // Track analytics
    await track('story_deleted', {
      userId,
      entityType: 'story',
      entityId: storyId,
      success: true
    });

    return ok(res, 200, { message: 'Story deleted successfully' });

  } catch (error) {
    logger.error('Error deleting story', { error: (error as Error)?.message, stack: (error as Error)?.stack });
    return fail(res, 500, 'Failed to delete story');
  }
};

/**
 * Get story views list
 * GET /api/stories/:storyId/views
 */
export const getStoryViews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authUser = requireAuth(req, res);
    if (!authUser) return;

    const { storyId } = req.params || {};
    const userId = authUser._id;

    if (!storyId) {
      return fail(res, 400, 'storyId is required');
    }

    const story = await Story.findOne({ _id: storyId, userId })
      .populate('views.userId', 'name username profilePhoto');

    if (!story) {
      return fail(res, 404, 'Story not found or not authorized');
    }

    return ok(res, 200, { views: story.views, viewCount: story.viewCount });

  } catch (error) {
    logger.error('Error fetching story views', { error: (error as Error)?.message, stack: (error as Error)?.stack });
    return fail(res, 500, 'Failed to fetch story views');
  }
};

export default {
  createStory,
  getStoriesFeed,
  getUserStories,
  viewStory,
  replyToStory,
  deleteStory,
  getStoryViews
};
