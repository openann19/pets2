import express, { type Request, type Response, Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken, requirePremiumFeature } from '../middleware/auth';
import User from '../models/User';
import Match from '../models/Match';
import type { InferSchemaType } from 'mongoose';
import logger from '../utils/logger';
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
  getMatchStats
} from '../controllers/matchController';
import { createTypeSafeWrapper } from '../types/routes';
import type { MatchRequest } from '../types/routes';

interface AuthenticatedRequest extends Request {
  userId: string; // Required - set by authenticateToken middleware
  user?: InferSchemaType<typeof User>;
}

const router: Router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

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

// Type-safe wrapper functions that cast authenticated requests
const wrapHandler = createTypeSafeWrapper;

// Routes
router.get('/recommendations', requirePremiumFeature('aiMatching'), wrapHandler(getRecommendations));
router.post('/swipe', wrapHandler(recordSwipe));
router.get('/', wrapHandler(getMatches));
router.get('/stats', wrapHandler(getMatchStats));
router.get('/:matchId', wrapHandler(getMatch));
router.get('/:matchId/messages', wrapHandler(getMessages));
router.post('/:matchId/messages', messageValidation, validate, wrapHandler(sendMessage));
router.patch('/:matchId/archive', wrapHandler(archiveMatch));
router.patch('/:matchId/block', wrapHandler(blockMatch));
router.patch('/:matchId/favorite', wrapHandler(favoriteMatch));

// Premium features
router.get('/recommendations/ai', requirePremiumFeature('aiMatching'), wrapHandler(getRecommendations));
router.get('/who-liked-me', requirePremiumFeature('seeWhoLiked'), wrapHandler(getMatches)); // Show who liked the user

// Like user endpoint
router.post('/like-user', wrapHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.body;
    
    if (!targetUserId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    // Cannot like yourself
    if (targetUserId === req.userId) {
      res.status(400).json({
        success: false,
        message: 'Cannot like yourself'
      });
      return;
    }

    // Get current user and their primary pet
    const currentUser = await User.findById(req.userId).populate('pets');
    if (!currentUser || !currentUser.pets || currentUser.pets.length === 0) {
      res.status(400).json({
        success: false,
        message: 'You need to have a pet to like users'
      });
      return;
    }

    // Get target user and their primary pet
    const targetUser = await User.findById(targetUserId).populate('pets');
    if (!targetUser || !targetUser.pets || targetUser.pets.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Target user not found or has no pets'
      });
      return;
    }

    const currentPet = currentUser.pets[0];
    const targetPet = targetUser.pets[0];

    // Check if already swiped on this pet
    const alreadySwiped = (currentUser.swipedPets || []).some(
      (swipe: { petId: { toString: () => string } }) => 
        swipe.petId.toString() === targetPet._id.toString()
    );

    if (alreadySwiped) {
      res.status(400).json({
        success: false,
        message: 'Already swiped on this user\'s pet'
      });
      return;
    }

    // Record the like action
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        swipedPets: {
          petId: targetPet._id,
          action: 'like',
          swipedAt: new Date()
        }
      },
      $inc: {
        'analytics.totalSwipes': 1,
        'analytics.totalLikes': 1
      }
    });

    // Check for mutual match - see if target user has liked current user's pet
    let matchCreated = false;
    let matchId = null;

    const mutualLike = (targetUser.swipedPets || []).some(
      (swipe: { petId: { toString: () => string }; action: string }) => 
        swipe.petId.toString() === currentPet._id.toString() &&
        (swipe.action === 'like' || swipe.action === 'superlike')
    );

    if (mutualLike) {
      // Create a match
      const match = new Match({
        pet1: currentPet._id,
        user1: req.userId,
        pet2: targetPet._id,
        user2: targetUserId,
        matchType: 'general',
        status: 'active',
        initiatedBy: req.userId
      });

      await match.save();

      matchCreated = true;
      matchId = match._id;

      // Update both users' matches
      await User.findByIdAndUpdate(req.userId, {
        $push: { matches: match._id },
        $inc: { 'analytics.totalMatches': 1 }
      });

      await User.findByIdAndUpdate(targetUserId, {
        $push: { matches: match._id },
        $inc: { 'analytics.totalMatches': 1 }
      });
    }

    res.json({
      success: true,
      data: {
        matchCreated,
        matchId,
        message: matchCreated ? 'It\'s a match!' : 'Like recorded'
      }
    });

  } catch (error) {
    logger.error('Like user error', { error, userId: req.userId });
    res.status(500).json({
      success: false,
      message: 'Failed to like user'
    });
  }
}));

export default router;
