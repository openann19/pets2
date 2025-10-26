import express, { type Request, type Response, Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken, requirePremiumFeature } from '../middleware/auth';
import { type IUserDocument } from '../models/User';
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

interface AuthenticatedRequest extends Request {
  userId: string; // Required - set by authenticateToken middleware
  user?: IUserDocument;
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
const wrapHandler = (handler: (req: any, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req, res);
  };
};

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
router.post('/like-user', async (req: Request, res: Response) => {
  const { userId } = req.body;
  // TODO: Implement actual like logic
  res.json({ success: true });
});

export default router;
