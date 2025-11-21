/**
 * Stories Controller
 *
 * Ephemeral story creation, feed, interactions, and management
 * Fully rewritten for robust validation, consistent responses, and safer media handling.
 */

'use strict';

const Story = require('../models/Story');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Notification = require('../models/Notification');
const { createDMFromStoryReply } = require('../services/chatService');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const UserAuditLog = require('../models/UserAuditLog');
const logger = require('../utils/logger');

// ——————————————————————————————————————————————————————————————————————————————
// Helpers
// ——————————————————————————————————————————————————————————————————————————————

/**
 * Send a success JSON response
 * @param {import('express').Response} res
 * @param {number} status
 * @param {object} payload
 */
function ok(res, status, payload) {
    return res.status(status).json({ success: true, ...payload });
}

/**
 * Send an error JSON response
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} message
 * @param {object} [meta]
 */
function fail(res, status, message, meta) {
    const body = { success: false, message };
    if (meta && process.env.NODE_ENV !== 'production') {
        body.meta = meta;
    }
    return res.status(status).json(body);
}

/**
 * Track analytics events (non-blocking)
 * @param {string} eventType
 * @param {object} payload
 */
async function track(eventType, payload = {}) {
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
        // Do not throw; best-effort analytics
        logger.warn?.('Analytics track failed', { eventType, error: e?.message });
    }
}

/**
 * Ensure an authenticated user is present on the request
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {{_id: string, name?: string, username?: string, following?: string[]}|null}
 */
function requireAuth(req, res) {
    const user = req.user;
    if (!user || !user._id) {
        fail(res, 401, 'Unauthorized');
        return null;
    }
    return user;
}

/**
 * Normalize the media type from request body/file
 * @param {string|undefined} mediaType
 * @param {import('multer').File|undefined} file
 * @returns {'photo'|'video'}
 */
function normalizeMediaType(mediaType, file) {
    const raw = (mediaType || '').toLowerCase();
    if (raw === 'video') return 'video';
    if (raw === 'photo' || raw === 'image') return 'photo';
    if (file && typeof file.mimetype === 'string') {
        if (file.mimetype.startsWith('video/')) return 'video';
        if (file.mimetype.startsWith('image/')) return 'photo';
    }
    return 'photo';
}

/**
 * Build Cloudinary upload options
 * @param {'photo'|'video'} normalizedType
 * @param {string} userId
 */
function cloudinaryOptions(normalizedType, userId) {
    const common = {
        folder: `stories/${userId}`,
        // 9:16 portrait, quality tuned for mobile consumption
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
            // Request a JPEG eager thumbnail to improve reliability of preview URL
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

/**
 * Derive a thumbnail URL for videos; fallback to replacing extension with .jpg.
 * @param {any} uploadResult
 */
function deriveVideoThumbnail(uploadResult) {
    // Prefer eager transformation results if present
    const eagerThumb = Array.isArray(uploadResult?.eager)
        ? uploadResult.eager.find(e => /jpe?g|png$/i.test(e.format))
        : null;
    if (eagerThumb?.secure_url) return eagerThumb.secure_url;
    if (typeof uploadResult?.secure_url === 'string') {
        return uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg');
    }
    return null;
}

const STORY_DEFAULT_DURATION = 5; // seconds for photos
const STORY_MAX_DURATION = 60; // safety cap
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_CAPTION_LENGTH = 2200;

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

// ——————————————————————————————————————————————————————————————————————————————
// Controllers
// ——————————————————————————————————————————————————————————————————————————————

/**
 * Create a new story
 * POST /api/stories
 */
exports.createStory = async (req, res) => {
    try {
        const authUser = requireAuth(req, res);
        if (!authUser) return; // response already sent

        const { caption, duration, mediaType } = req.body || {};
        const userId = authUser._id;

        if (!req.file || !req.file.buffer) {
            return fail(res, 400, 'Media file is required');
        }

        const normalizedType = normalizeMediaType(mediaType, req.file);
        const options = cloudinaryOptions(normalizedType, userId);

        // File validations: mimetype and size caps
        const { mimetype, size } = req.file;
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

        // Upload to Cloudinary using memory buffer
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'pawfectmatch/stories', options);
        if (!uploadResult || !uploadResult.secure_url) {
            logger.error('Cloudinary upload failed: no secure_url', { userId, normalizedType });
            return fail(res, 502, 'Media processing failed');
        }

        const mediaUrl = uploadResult.secure_url;
        let thumbnailUrl = null;
        let actualDuration = Number.isFinite(Number(duration)) ? Math.max(1, Math.min(Number(duration), STORY_MAX_DURATION)) : STORY_DEFAULT_DURATION;

        if (normalizedType === 'video') {
            thumbnailUrl = deriveVideoThumbnail(uploadResult);
            // Prefer Cloudinary-provided duration when available
            const cloudDuration = Number(uploadResult.duration);
            if (Number.isFinite(cloudDuration) && cloudDuration > 0) {
                actualDuration = Math.min(cloudDuration, STORY_MAX_DURATION);
            } else if (actualDuration < 5) {
                // Sensible default for short videos if not provided
                actualDuration = 30;
            }
        }

        // 24-hour expiry
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const safeCaption = typeof caption === 'string' ? caption.trim().slice(0, MAX_CAPTION_LENGTH) : undefined;
        const story = new Story({
            userId,
            mediaType: normalizedType,
            mediaUrl,
            thumbnailUrl,
            caption: safeCaption,
            duration: actualDuration,
            expiresAt,
        });

        await story.save();
        await story.populate('userId', 'name username profilePhoto');

        // Track analytics
        track('story_created', {
            userId,
            entityType: 'Story',
            entityId: story._id,
            metadata: { mediaType: normalizedType, hasThumbnail: Boolean(thumbnailUrl) }
        });

        // Emit socket event for real-time updates
        try {
            if (req.io) {
                req.io.emit('story:created', {
                    userId,
                    storyId: story._id,
                    userName: authUser.name,
                    mediaType: normalizedType,
                });
            }
        } catch (socketErr) {
            logger.warn?.('Socket emit failed for story:created', { error: socketErr?.message });
        }

        logger.info('Story created', { userId, storyId: story._id, mediaType: normalizedType });

        // User-facing audit log
        try {
            await UserAuditLog.create({
                userId,
                action: 'story_create',
                resourceType: 'story',
                resourceId: story._id,
                details: { mediaType: normalizedType, captionLength: safeCaption?.length || 0 },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                requestId: req.id,
            });
        } catch (auditErr) {
            logger.warn?.('UserAuditLog create failed (story_create)', { error: auditErr?.message });
        }
        return ok(res, 201, { story });
    } catch (error) {
        logger.error('Error creating story', { error: error?.message, stack: error?.stack });
        return fail(res, 500, 'Failed to create story');
    }
};

/**
 * Get stories feed (own + following)
 * GET /api/stories
 */
exports.getStoriesFeed = async (req, res) => {
    try {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const userId = authUser._id;

        // Following list may be provided on req.user depending on User model
        const followingIds = Array.isArray(authUser.following) ? authUser.following : [];
        const { limit: limitStr, cursor, mode } = req.query || {};
        const limit = Math.max(1, Math.min(parseInt(limitStr, 10) || 0, 100));

        if (mode === 'flat') {
            const items = await Story.getActiveFeedStories(userId, followingIds, { cursor, limit });
            const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;
            return ok(res, 200, { stories: items, nextCursor });
        }

        // Default: grouped feed (existing behavior)
        const grouped = await Story.getStoriesGroupedByUser(userId, followingIds, { cursor, limit });
        return ok(res, 200, { stories: grouped });
    } catch (error) {
        logger.error('Error fetching stories feed', { error: error?.message, stack: error?.stack });
        return fail(res, 500, 'Failed to fetch stories');
    }
};

/**
 * Get user's stories
 * GET /api/stories/:userId
 */
exports.getUserStories = async (req, res) => {
    try {
        const { userId } = req.params || {};
        if (!userId) {
            return fail(res, 400, 'userId is required');
        }
        const { page: pageStr, limit: limitStr, cursor } = req.query || {};
        const page = Math.max(1, parseInt(pageStr, 10) || 1);
        const limit = Math.max(1, Math.min(parseInt(limitStr, 10) || 0, 100));

        const stories = await Story.getUserActiveStories(userId, { cursor, limit: limit || undefined });
        const nextCursor = stories.length === limit ? stories[stories.length - 1].createdAt : null;
        return ok(res, 200, { stories, nextCursor, page, limit: limit || undefined });
    } catch (error) {
        logger.error('Error fetching user stories', { error: error?.message, stack: error?.stack });
        return fail(res, 500, 'Failed to fetch user stories');
    }
};

/**
 * Mark story as viewed
 * POST /api/stories/:storyId/view
 */
exports.viewStory = async (req, res) => {
    try {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const { storyId } = req.params || {};
        const userId = authUser._id;

        if (!storyId) return fail(res, 400, 'storyId is required');

        const story = await Story.findById(storyId);
        if (!story) return fail(res, 404, 'Story not found');
        if (typeof story.isExpired === 'function' && story.isExpired()) {
            return fail(res, 410, 'Story has expired');
        }

        const isNewView = typeof story.addView === 'function' ? story.addView(userId) : false;
        await story.save();

        // Track view analytics (dedup-aware)
        if (isNewView) {
            track('story_viewed', {
                userId,
                entityType: 'Story',
                entityId: story._id,
                metadata: { ownerId: String(story.userId) }
            });
        }

        // Emit socket event to story owner
        try {
            if (isNewView && req.io) {
                req.io.to(String(story.userId)).emit('story:viewed', {
                    storyId: story._id,
                    viewerId: userId,
                    viewerName: authUser.name,
                    viewCount: story.viewCount,
                });
            }
        } catch (socketErr) {
            logger.warn?.('Socket emit failed for story:viewed', { error: socketErr?.message });
        }

        return ok(res, 200, { isNewView, viewCount: story.viewCount });
    } catch (error) {
        logger.error('Error viewing story', { error: error?.message, stack: error?.stack });
        return fail(res, 500, 'Failed to view story');
    }
};

/**
 * Reply to a story (creates a DM)
 * POST /api/stories/:storyId/reply
 */
exports.replyToStory = async (req, res) => {
    try {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const { storyId } = req.params || {};
        const { message } = req.body || {};
        const userId = authUser._id;

        if (!storyId) return fail(res, 400, 'storyId is required');
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return fail(res, 400, 'Reply message is required');
        }

        const story = await Story.findById(storyId);
        if (!story) return fail(res, 404, 'Story not found');
        if (typeof story.isExpired === 'function' && story.isExpired()) {
            return fail(res, 410, 'Cannot reply to expired story');
        }

        if (typeof story.addReply === 'function') {
            story.addReply(userId, message.trim());
        }
        await story.save();

        // Track reply analytics
        track('story_replied', {
            userId,
            entityType: 'Story',
            entityId: story._id,
            metadata: { ownerId: String(story.userId) }
        });

        // Try DM integration first; fallback to Notification if it fails
        let dmFailed = false;
        try {
            await createDMFromStoryReply(userId, story.userId, message, story._id, req.io);
        } catch (dmErr) {
            dmFailed = true;
            logger.warn?.('DM creation failed, falling back to notification', { error: dmErr?.message });
        }

        if (dmFailed) {
            try {
                await Notification.create({
                    userId: story.userId,
                    type: 'message',
                    title: 'New story reply',
                    body: message.trim(),
                    data: {
                        storyId: String(story._id),
                        replierId: String(userId),
                        replierName: authUser.name,
                    },
                    priority: 'normal',
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                });
            } catch (notifyErr) {
                logger.warn?.('Failed to create notification for story reply', { error: notifyErr?.message });
            }
        }

        // Emit socket event to story owner (stories channel)
        try {
            if (req.io) {
                req.io.to(String(story.userId)).emit('story:reply', {
                    storyId: story._id,
                    replierId: userId,
                    replierName: authUser.name,
                    message: message.trim(),
                });
            }
        } catch (socketErr) {
            logger.warn?.('Socket emit failed for story:reply', { error: socketErr?.message });
        }

        logger.info('Story reply created', { storyId, userId, replyCount: story.replyCount });

        // User-facing audit log
        try {
            await UserAuditLog.create({
                userId,
                action: 'story_reply',
                resourceType: 'story',
                resourceId: story._id,
                details: { messageLength: message.trim().length, ownerId: String(story.userId) },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                requestId: req.id,
            });
        } catch (auditErr) {
            logger.warn?.('UserAuditLog create failed (story_reply)', { error: auditErr?.message });
        }
        return ok(res, 200, { replyCount: story.replyCount });
    } catch (error) {
        logger.error('Error replying to story', { error: error?.message, stack: error?.stack });
        return fail(res, 500, 'Failed to reply to story');
    }
};

/**
 * Delete own story
 * DELETE /api/stories/:storyId
 */
exports.deleteStory = async (req, res) => {
    try {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const { storyId } = req.params || {};
        const userId = authUser._id;

        if (!storyId) return fail(res, 400, 'storyId is required');

        const story = await Story.findOne({ _id: storyId, userId });
        if (!story) return fail(res, 404, 'Story not found or not authorized');

        await story.deleteOne();

        // Track delete analytics
        track('story_deleted', {
            userId,
            entityType: 'Story',
            entityId: story._id,
        });

        // Emit socket event
        try {
            if (req.io) {
                req.io.emit('story:deleted', { storyId: story._id, userId });
            }
        } catch (socketErr) {
            logger.warn?.('Socket emit failed for story:deleted', { error: socketErr?.message });
        }

        logger.info('Story deleted', { storyId, userId });
        // User-facing audit log
        try {
            await UserAuditLog.create({
                userId,
                action: 'story_delete',
                resourceType: 'story',
                resourceId: story._id,
                details: {},
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                requestId: req.id,
            });
        } catch (auditErr) {
            logger.warn?.('UserAuditLog create failed (story_delete)', { error: auditErr?.message });
        }
        return ok(res, 200, { message: 'Story deleted successfully' });
    } catch (error) {
        logger.error('Error deleting story', { error: error?.message, stack: error?.stack });
        return fail(res, 500, 'Failed to delete story');
    }
};

/**
 * Get story views list
 * GET /api/stories/:storyId/views
 */
exports.getStoryViews = async (req, res) => {
    try {
        const authUser = requireAuth(req, res);
        if (!authUser) return;
        const { storyId } = req.params || {};
        const userId = authUser._id;

        if (!storyId) return fail(res, 400, 'storyId is required');

        const story = await Story.findOne({ _id: storyId, userId })
            .populate('views.userId', 'name username profilePhoto');

        if (!story) return fail(res, 404, 'Story not found or not authorized');

        return ok(res, 200, { views: story.views, viewCount: story.viewCount });
    } catch (error) {
        logger.error('Error fetching story views', { error: error?.message, stack: error?.stack });
        return fail(res, 500, 'Failed to fetch story views');
    }
};
