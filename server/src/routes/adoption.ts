/**
 * Adoption Routes
 * Handles adoption listings, applications, and reviews
 */

import express, { type Request, type Response, Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import {
  getPetDetails,
  submitApplication,
  getUserApplications,
  getPetApplications,
  updateApplicationStatus
} from '../controllers/adoptionController';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    _id: string;
    email: string;
    [key: string]: unknown;
  };
}

const router: Router = express.Router();

// Public routes (with optional auth)
router.get('/pets/:petId', optionalAuth, getPetDetails);

// Protected routes
router.use(authenticateToken);

// Application routes
router.post('/pets/:petId/apply', submitApplication);
router.get('/applications/my', getUserApplications);
router.get('/applications/received', getPetApplications);
router.put('/applications/:applicationId', updateApplicationStatus);

export default router;

