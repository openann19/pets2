/**
 * IAP Routes for PawfectMatch
 * Handles in-app purchase endpoints
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth';
import * as iapController from '../controllers/iapController';

const router = express.Router();

// All IAP routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/iap/process-purchase
 * @desc    Process IAP purchase and update user balance
 * @access  Private
 */
router.post('/process-purchase', iapController.processPurchase as unknown as express.RequestHandler);

/**
 * @route   GET /api/iap/balance
 * @desc    Get user's IAP balance
 * @access  Private
 */
router.get('/balance', iapController.getBalance as unknown as express.RequestHandler);

/**
 * @route   POST /api/iap/use-item
 * @desc    Use an IAP item (Super Like, Boost, etc.)
 * @access  Private
 */
router.post('/use-item', iapController.useItem as unknown as express.RequestHandler);

export default router;

