import express, { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { requirePremiumFeature } from '../middleware/auth';
import {
  getRecommendations,
  recordSwipe,
  getMatches,
  getMatch,
  getMessages,
  sendMessage,
  archiveMatch,
  blockMatch,
  favoriteMatch,
  getMatchStats,
  unmatchUser
} from '../controllers/matchController';

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

// Routes
router.get('/recommendations', requirePremiumFeature('aiMatching'), getRecommendations);
router.post('/swipe', recordSwipe);
router.get('/', getMatches);
router.get('/stats', getMatchStats);
router.get('/:matchId', getMatch);
router.get('/:matchId/messages', getMessages);
router.post('/:matchId/messages', messageValidation, validate, sendMessage);
router.patch('/:matchId/archive', archiveMatch);
router.patch('/:matchId/block', blockMatch);
router.patch('/:matchId/favorite', favoriteMatch);
router.delete('/:matchId/unmatch', unmatchUser);

// Premium features
router.get('/recommendations/ai', requirePremiumFeature('aiMatching'), getRecommendations);
router.get('/who-liked-me', requirePremiumFeature('seeWhoLiked'), getMatches); // Show who liked the user

export default router;