/**
 * Profile Routes
 * Handles user profile and pet profile operations
 */

import express, { type Request, type Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  updatePetProfile,
  createPetProfile,
  getMessageCount,
  getPetCount,
  getPrivacySettings,
  updatePrivacySettings,
  exportUserData,
  deleteAccount
} from '../controllers/profileController';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    _id: string;
    email: string;
    [key: string]: any;
  };
}

const router: Router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Pet profile routes
router.put('/pets/:petId', updatePetProfile);
router.post('/pets', createPetProfile);

// User stats routes
router.get('/stats/messages', getMessageCount);
router.get('/stats/pets', getPetCount);

// Privacy settings routes
router.get('/privacy', getPrivacySettings);
router.put('/privacy', updatePrivacySettings);

// GDPR routes
router.get('/export', exportUserData);
router.delete('/account', deleteAccount);

export default router;

