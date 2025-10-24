/**
 * Stories Routes
 * 
 * Handles ephemeral story endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
// Zod validation
const { zodValidate } = require('../src/middleware/zodValidator');
// Prefer shared core schemas; fall back to local server schemas if interop fails
let createStorySchema, replySchema;
try {
    ({ storyCreateSchema: createStorySchema, storyReplySchema: replySchema } = require('@pawfectmatch/core/schemas'));
} catch (e) {
    ({ createStorySchema, replySchema } = require('../src/schemas/storySchemas'));
}
const { authenticateToken } = require('../src/middleware/auth');
const { uploadRateLimiter, strictRateLimiter } = require('../src/middleware/globalRateLimit');
const { storyDailyLimiter } = require('../src/middleware/storyDailyLimiter');
const storiesController = require('../src/controllers/storiesController');

// Use memory storage for Cloudinary streaming
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for videos
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'video/mp4',
            'video/quicktime', // MOV files
            'video/webm',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    },
});

// All routes require authentication
router.use(authenticateToken);

// ============================================================================
// Story CRUD
// ============================================================================

/**
 * @route   POST /api/stories
 * @desc    Create a new story
 * @access  Private
 */
router.post('/',
    uploadRateLimiter,
    storyDailyLimiter,
    upload.single('media'),
    zodValidate({ body: createStorySchema }),
    storiesController.createStory
);

/**
 * @route   GET /api/stories
 * @desc    Get stories feed (own + following)
 * @access  Private
 */
router.get(
    '/',
    storiesController.getStoriesFeed
);

/**
 * @route   GET /api/stories/:userId
 * @desc    Get user's stories
 * @access  Private
 */
router.get(
    '/:userId',
    storiesController.getUserStories
);

/**
 * @route   DELETE /api/stories/:storyId
 * @desc    Delete own story
 * @access  Private
 */
router.delete(
    '/:storyId',
    storiesController.deleteStory
);

// ============================================================================
// Story Interactions
// ============================================================================

/**
 * @route   POST /api/stories/:storyId/view
 * @desc    Mark story as viewed
 * @access  Private
 */
router.post(
    '/:storyId/view',
    storiesController.viewStory
);

/**
 * @route   POST /api/stories/:storyId/reply
 * @desc    Reply to a story (creates DM)
 * @access  Private
 */
router.post(
    '/:storyId/reply',
    strictRateLimiter,
    zodValidate({ body: replySchema }),
    storiesController.replyToStory
);

/**
 * @route   GET /api/stories/:storyId/views
 * @desc    Get story views list (owner only)
 * @access  Private
 */
router.get(
    '/:storyId/views',
    storiesController.getStoryViews
);

module.exports = router;
