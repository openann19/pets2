/**
 * Reel Uploads Routes for PawfectMatch PawReels
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { signUpload } from '../controllers/uploadSigningController';

const router = Router();

// Authenticated routes only
router.use(authenticateToken);

router.post('/sign', signUpload);

export default router;

