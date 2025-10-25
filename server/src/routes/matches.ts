import express, { Router, Response } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { requirePremiumFeature } from '../middleware/auth';
import type { AuthenticatedRequest, ApiResponse } from '../types';

// Import controllers from CommonJS modules
const matchController = require('../controllers/matchController');

const {
  getRecommendations,
  recordSwipe,
  getMatches,
  getMatch,
  getMessages,
  sendMessage,
  archiveMatch,
  blockMatch,
  favoriteMatch,
  getMatchStats
} = matchController;

const router: Router = express.Router();

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'location'])
    .withMessage('Invalid message type')
];

const swipeValidation = [
  body('petId').isMongoId().withMessage('Valid pet ID required'),
  body('action').isIn(['like', 'pass', 'superlike']).withMessage('Action must be like, pass, or superlike'),
  body('targetPetId').optional().isMongoId().withMessage('Valid target pet ID required')
];

// Routes
router.get('/recommendations', requirePremiumFeature('aiMatching'), getRecommendations);
router.post('/swipe', swipeValidation, validate, recordSwipe);
router.get('/', getMatches);
router.get('/stats', getMatchStats);
router.get('/:matchId', getMatch);
router.get('/:matchId/messages', getMessages);
router.post('/:matchId/messages', messageValidation, validate, sendMessage);
router.patch('/:matchId/archive', archiveMatch);
router.patch('/:matchId/block', blockMatch);
router.patch('/:matchId/favorite', favoriteMatch);

// Premium features
router.get('/recommendations/ai', requirePremiumFeature('aiMatching'), getRecommendations);
router.get('/who-liked-me', requirePremiumFeature('seeWhoLiked'), getMatches); // Show who liked the user

export default router;
