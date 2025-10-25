const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
    createReport,
    blockUser,
    unblockUser,
    muteUser,
    unmuteUser,
    getMyModerationState
} = require('../controllers/moderationController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Report inappropriate content or behavior
router.post('/report', createReport);

// Block/unblock users
router.post('/block', blockUser);
router.delete('/block/:blockedUserId', unblockUser);

// Mute/unmute users
router.post('/mute', muteUser);
router.delete('/mute/:mutedUserId', unmuteUser);

// Get current user's blocks and mutes
router.get('/me', getMyModerationState);

module.exports = router;
