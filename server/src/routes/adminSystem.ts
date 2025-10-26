/**
 * Admin System Routes
 * Routes for system health monitoring
 */

import { Router } from 'express';
import { getSystemHealth } from '../controllers/admin/systemController';

const router = Router();

/**
 * GET /api/admin/system/health
 * Get system health status
 */
router.get('/health', getSystemHealth);

export default router;

