import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { likePet, passPet, superLikePet, rewindLastSwipe } from '../controllers/swipeController';
import {
  getUsage,
  useRewindAction,
  useSuperLikeAction,
  activateBoostAction,
} from '../controllers/swipePremiumController';

const router: Router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Swipe actions
router.post('/pets/like', likePet);
router.post('/pets/pass', passPet);
router.post('/pets/super-like', superLikePet);

// Rewind feature
router.post('/swipe/rewind', rewindLastSwipe);

// Phase 2: Premium Swipe Features
router.get('/premium/usage', getUsage);
router.post('/premium/rewind', useRewindAction);
router.post('/premium/super-like', useSuperLikeAction);
router.post('/premium/boost', activateBoostAction);

export default router;

