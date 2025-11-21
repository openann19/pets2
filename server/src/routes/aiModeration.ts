export {};// Added to mark file as a module
const express = require('express');
const router = express.Router();
const aiModerationController = require('../controllers/aiModerationController');
const { authenticateToken } = require('../middleware/auth');

// In tests, provide a simple auth bypass to attach a mock user
const testBypassAuth = (req, _res, next) => {
    if (process.env.NODE_ENV === 'test') {
        req.user = req.user || { _id: '000000000000000000000001', email: 'test@local', role: 'moderator' };
        req.userId = req.user._id;
        return next();
    }
    return authenticateToken(req, _res, next);
};

// AI moderation endpoints - require authentication
router.post('/moderate/text', testBypassAuth, aiModerationController.moderateText);
router.post('/moderate/image', testBypassAuth, aiModerationController.moderateImage);

module.exports = router;
