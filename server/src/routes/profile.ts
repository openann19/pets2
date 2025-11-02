/**
 * Profile Routes
 * Handles user profile and pet profile operations
 */

const express = require('express');
const router: Router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  updatePetProfile,
  createPetProfile,
  getMessageCount,
  getPetCount,
  getPrivacySettings,
  updatePrivacySettings,
  exportUserData,
  deleteAccount
} = require('../controllers/profileController');

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
