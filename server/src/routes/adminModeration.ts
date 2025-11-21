export {};// Added to mark file as a module
const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getContentReviewQueue,
  reviewContent,
  bulkReviewContent,
  createModerationRule,
  getModerationAnalytics,
  getQuarantineQueue,
  releaseFromQuarantine
} = require('../controllers/adminModerationController');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Content review queue management
router.get('/queue', getContentReviewQueue);
router.post('/review', reviewContent);
router.post('/bulk-review', bulkReviewContent);

// Automated moderation rules
router.post('/rules', createModerationRule);

// Moderation analytics and reporting
router.get('/analytics', getModerationAnalytics);

// Content quarantine management
router.get('/quarantine', getQuarantineQueue);
router.post('/quarantine/:contentId/release', releaseFromQuarantine);

module.exports = router;
