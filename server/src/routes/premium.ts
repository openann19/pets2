const express = require('express');
const { authenticateToken, requirePremium } = require('../middleware/auth');
const {
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
} = require('../controllers/premiumController');

const router = express.Router();

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

module.exports = router;