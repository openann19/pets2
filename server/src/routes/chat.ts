import express, { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import type { AuthenticatedRequest, ApiResponse } from '../types';

// Import controllers from CommonJS modules
const chatController = require('../controllers/chatController');

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
} = chatController;

const router: Router = express.Router();

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
  body('query')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query is required and must be less than 100 characters'),
  body('matchId')
    .optional()
    .isMongoId()
    .withMessage('Valid match ID required')
];

// Chat routes
router.get('/history', getChatHistory);
router.get('/online-users', getOnlineUsers);
router.get('/stats', getChatStats);
router.get('/messages/:matchId', getMessages);
router.post('/messages/:matchId', messageValidation, validate, sendMessage);
router.put('/messages/:messageId', editMessageValidation, validate, editMessage);
router.delete('/messages/:messageId', deleteMessage);
router.post('/messages/:messageId/reactions', reactionValidation, validate, addReaction);
router.delete('/messages/:messageId/reactions/:reactionId', removeReaction);
router.post('/search', searchValidation, validate, searchMessages);
router.patch('/messages/read', markMessagesRead);

export default router;
