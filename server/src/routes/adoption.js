/**
 * Adoption Routes
 * Handles adoption listings, applications, and reviews
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
  getPetDetails,
  submitApplication,
  reviewApplication,
  createListing,
  getMyApplications,
  getApplicationsForMyPets,
  getApplicationById
} = require('../controllers/adoptionController');

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

module.exports = router;
