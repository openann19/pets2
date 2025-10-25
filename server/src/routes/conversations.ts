const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { strictRateLimiter } = require('../middleware/globalRateLimit');
const conversationController = require('../controllers/conversationController');

// All conversation routes require auth
router.use(authenticateToken);

// Get paginated messages (cursor by message id)
router.get('/:conversationId/messages', conversationController.getMessages);

// Send message
router.post('/:conversationId/messages', strictRateLimiter, conversationController.sendMessage);

// Mark messages as read
router.post('/:conversationId/read', conversationController.markRead);

module.exports = router;
