import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { likePet, passPet, superLikePet, rewindLastSwipe } from '../controllers/swipeController';

const router: Router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Swipe actions
router.post('/pets/like', likePet);
router.post('/pets/pass', passPet);
router.post('/pets/super-like', superLikePet);

// Rewind feature
router.post('/swipe/rewind', rewindLastSwipe);

export default router;

