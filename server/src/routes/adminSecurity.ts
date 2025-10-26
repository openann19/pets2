/**
 * Admin Security Routes
 * Routes for security management including IP blocking
 */

import { Router } from 'express';
import {
  getSecurityMetrics,
  blockIP,
  getBlockedIPs,
  unblockIP,
} from '../controllers/admin/securityController';

const router = Router();

/**
 * GET /api/admin/security/metrics
 * Get security metrics summary
 */
router.get('/metrics', getSecurityMetrics);

/**
 * POST /api/admin/security/block-ip
 * Block an IP address
 */
router.post('/block-ip', blockIP);

/**
 * GET /api/admin/security/blocked-ips
 * List all blocked IPs
 */
router.get('/blocked-ips', getBlockedIPs);

/**
 * DELETE /api/admin/security/blocked-ips/:ip
 * Unblock an IP address
 */
router.delete('/blocked-ips/:ip', unblockIP);

export default router;

