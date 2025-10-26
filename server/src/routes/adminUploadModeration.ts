/**
 * Admin Upload Moderation Routes
 * Routes for upload moderation
 */

import { Router } from 'express';
import {
  getUploads,
  moderateUpload,
  getUploadModerationStats,
} from '../controllers/admin/uploadModerationController';

const router = Router();

/**
 * GET /api/admin/uploads
 * Get uploads for moderation review
 */
router.get('/', getUploads);

/**
 * POST /api/admin/uploads/:uploadId/moderate
 * Moderate an upload
 */
router.post('/:uploadId/moderate', moderateUpload);

/**
 * GET /api/admin/uploads/stats
 * Get upload moderation statistics
 */
router.get('/stats', getUploadModerationStats);

export default router;

