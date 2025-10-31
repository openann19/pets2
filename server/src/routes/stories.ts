/**
 * Stories Routes
 * 
 * Handles ephemeral story endpoints
 */

import express, { Router } from 'express';
import multer from 'multer';
import { zodValidate } from '../middleware/zodValidator';
import { authenticateToken } from '../middleware/auth';
import { uploadRateLimiter, strictRateLimiter } from '../middleware/globalRateLimit';
import { storyDailyLimiter } from '../middleware/storyDailyLimiter';
import * as storiesController from '../controllers/storiesController';

// Prefer shared core schemas; fall back to local server schemas if interop fails
import { createStorySchema as localCreateStorySchema, replySchema as localReplySchema } from '../schemas/storySchemas';

let createStorySchema: typeof localCreateStorySchema;
let replySchema: typeof localReplySchema;

try {
  // Try to use core schemas if available
  const coreSchemas = require('@pawfectmatch/core/schemas');
  createStorySchema = coreSchemas.storyCreateSchema || localCreateStorySchema;
  replySchema = coreSchemas.storyReplySchema || localReplySchema;
} catch (e) {
  // Fall back to local schemas
  createStorySchema = localCreateStorySchema;
  replySchema = localReplySchema;
}

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

const router: Router = express.Router();

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

export default router;

