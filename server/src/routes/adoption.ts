/**
 * Adoption Routes
 * Handles adoption listings, applications, and reviews
 */

import express, { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import {
  getPetDetails,
  submitApplication,
  reviewApplication,
  createListing,
  getMyApplications,
  getApplicationsForMyPets,
  getApplicationById
} from '../controllers/adoptionController';

const router: Router = express.Router();

// Public routes (with optional auth)
router.get('/pets/:petId', optionalAuth, getPetDetails);

// Protected routes
router.use(authenticateToken);

// Application routes
router.post('/pets/:petId/apply', submitApplication);
router.get('/applications/my', getMyApplications);
router.get('/applications/received', getApplicationsForMyPets);
router.get('/applications/:applicationId', getApplicationById);
router.post('/applications/:applicationId/review', reviewApplication);

// Listing routes
router.post('/listings', createListing);

export default router;
