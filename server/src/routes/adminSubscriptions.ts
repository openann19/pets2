/**
 * Admin Subscription Routes
 * Routes for subscription lifecycle management
 */

import { Router } from 'express';
import {
  cancelSubscription,
  reactivateSubscription,
  updateSubscription,
} from '../controllers/admin/subscriptionController';

const router = Router();

/**
 * POST /api/admin/subscriptions/:id/cancel
 * Cancel a subscription
 */
router.post('/:id/cancel', cancelSubscription);

/**
 * POST /api/admin/subscriptions/:id/reactivate
 * Reactivate a subscription
 */
router.post('/:id/reactivate', reactivateSubscription);

/**
 * PUT /api/admin/subscriptions/:id/update
 * Update subscription details
 */
router.put('/:id/update', updateSubscription);

export default router;

