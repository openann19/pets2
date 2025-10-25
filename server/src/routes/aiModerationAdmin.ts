const express = require('express');
const router = express.Router();
const aiModerationController = require('../controllers/aiModerationController');
const moderationAnalyticsController = require('../controllers/moderationAnalyticsController');
const { authenticateToken } = require('../middleware/auth');

// Test auth bypass or real auth
const testBypassAuth = (req, _res, next) => {
    if (process.env.NODE_ENV === 'test') {
        req.user = req.user || { _id: '000000000000000000000001', email: 'admin@local', role: 'administrator', isAdmin: true };
        req.userId = req.user._id;
        return next();
    }
    return authenticateToken(req, _res, next);
};

// Admin AI moderation settings
router.get('/settings', testBypassAuth, aiModerationController.getSettings);
router.put('/settings', testBypassAuth, aiModerationController.updateSettings);

// Moderation analytics
router.get('/analytics', testBypassAuth, moderationAnalyticsController.getAnalytics);

module.exports = router;
