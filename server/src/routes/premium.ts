import express, { Router } from 'express';
import { authenticateToken, requirePremium } from '../middleware/auth';
import {
  subscribeToPremium,
  createPaymentSheet,
  confirmPaymentSheet,
  verifyPurchase,
  cancelSubscription,
  getPremiumFeatures,
  boostProfile,
  getSuperLikes,
  getSubscription,
  getUsage,
  getDailySwipeStatus,
  reactivateSubscription,
  getPremiumStatus,
  checkPremiumFeature,
} from '../controllers/premiumController';

const router: Router = express.Router();

// Apply authentication to all premium routes
router.use(authenticateToken);

// Premium status and features
router.get('/status', getPremiumStatus);
router.get('/feature/:feature', checkPremiumFeature);
router.get('/features', getPremiumFeatures);

// Subscription management
router.post('/subscribe', subscribeToPremium);
router.post('/create-payment-sheet', createPaymentSheet);
router.post('/confirm-payment-sheet', confirmPaymentSheet);
router.post('/verify-purchase', verifyPurchase);
router.get('/subscription', requirePremium, getSubscription);
router.post('/cancel', cancelSubscription);
router.post('/reactivate', reactivateSubscription);

// Premium features (require premium access)
router.post('/boost/:petId', requirePremium, boostProfile);
router.get('/super-likes', requirePremium, getSuperLikes);

// Usage tracking
router.get('/usage', requirePremium, getUsage);
router.get('/daily-swipe-status', getDailySwipeStatus); // Available to all users (free + premium)

export default router;

