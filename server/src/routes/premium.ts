import express, { type Request, type Response, Router } from 'express';
import { authenticateToken, requirePremium } from '../middleware/auth';
import {
  subscribeToPremium,
  cancelSubscription,
  getPremiumFeatures,
  boostProfile,
  getSuperLikes,
  getSubscription,
  getUsage,
  reactivateSubscription,
  getPremiumStatus,
  checkPremiumFeature,
} from '../controllers/premiumController';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    _id: string;
    email: string;
    [key: string]: unknown;
  };
}

const router: Router = express.Router();

// Apply authentication to all premium routes
router.use(authenticateToken);

// Premium status and features
router.get('/status', getPremiumStatus);
router.get('/feature/:feature', checkPremiumFeature);
router.get('/features', getPremiumFeatures);

// Subscription management
router.post('/subscribe', subscribeToPremium);
router.get('/subscription', requirePremium, getSubscription);
router.post('/cancel', cancelSubscription);
router.post('/reactivate', reactivateSubscription);

// Premium features (require premium access)
router.post('/boost/:petId', requirePremium, boostProfile);
router.get('/super-likes', requirePremium, getSuperLikes);

// Usage tracking
router.get('/usage', requirePremium, getUsage);

export default router;

