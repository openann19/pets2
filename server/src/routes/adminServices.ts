/**
 * Admin Services Routes
 * Routes for managing AI, upload, moderation, and push services from admin panel
 */

import { Router } from 'express';
import {
  getServicesStatus,
  getServicesAnalytics,
  toggleService,
  getUploadStats,
  getAIStats,
  getPushStats,
  getCombinedStats,
} from '../controllers/admin/servicesController';

const router = Router();

/**
 * GET /api/admin/services/status
 * Get status of all services
 */
router.get('/status', getServicesStatus);

/**
 * GET /api/admin/services/analytics
 * Get usage analytics for services
 */
router.get('/analytics', getServicesAnalytics);

/**
 * POST /api/admin/services/toggle
 * Toggle a service on/off
 */
router.post('/toggle', toggleService);

/**
 * GET /api/admin/services/upload-stats
 * Get upload statistics
 */
router.get('/upload-stats', getUploadStats);

/**
 * GET /api/admin/services/ai-stats
 * Get AI service statistics
 */
router.get('/ai-stats', getAIStats);

/**
 * GET /api/admin/services/push-stats
 * Get push notification statistics
 */
router.get('/push-stats', getPushStats);

/**
 * GET /api/admin/services/combined-stats
 * Get combined statistics for all services
 */
router.get('/combined-stats', getCombinedStats);

export default router;

