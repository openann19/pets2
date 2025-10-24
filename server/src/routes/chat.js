const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const {
  getChatHistory,
  markMessagesRead,
  getOnlineUsers,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  searchMessages,
  getChatStats
} = require('../controllers/chatController');

const router = express.Router();

// Apply authentication to all chat routes
router.use(authenticateToken);

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'location', 'file'])
    .withMessage('Invalid message type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

const editMessageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters')
];

const reactionValidation = [
  body('emoji')
    .isLength({ min: 1, max: 10 })
    .withMessage('Valid emoji is required')
];

const searchValidation = [
  body('q')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
];

// Message management routes
router.get('/history/:matchId', getChatHistory);
router.get('/:matchId/messages', getMessages);
router.post('/:matchId/messages', messageValidation, validate, sendMessage);
router.put('/messages/:messageId', editMessageValidation, validate, editMessage);
router.delete('/messages/:messageId', deleteMessage);

// Message reactions
router.post('/messages/:messageId/reactions', reactionValidation, validate, addReaction);
router.delete('/messages/:messageId/reactions/:emoji', removeReaction);

// Message search
router.get('/:matchId/search', searchValidation, validate, searchMessages);

// Chat statistics
router.get('/stats', getChatStats);

// Legacy routes (for backward compatibility)
router.post('/:matchId/send', messageValidation, validate, sendMessage);
router.post('/:matchId/read', markMessagesRead);
router.get('/online', getOnlineUsers);

module.exports = router;