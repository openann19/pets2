import express, { Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import type { AuthenticatedRequest, ApiResponse } from '../types';

// Import controllers from CommonJS modules
const userController = require('../controllers/userController');

const {
  getCompleteProfile,
  updateAdvancedProfile,
  updatePrivacySettings,
  updateNotificationPreferences,
  uploadProfilePhotos,
  deleteProfilePhoto,
  setPrimaryPhoto,
  getUserAnalytics,
  exportUserData,
  deactivateAccount,
  reactivateAccount,
  getProfile,
  updateProfile,
  updatePreferences,
  updateLocation,
  getUserStats,
  uploadAvatar,
  deleteAccount,
  updatePrivacy,
  updateFilters
} = userController;

const router: Router = express.Router();

// Configure multer for memory storage (Cloudinary upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: AuthenticatedRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const profileUpdateValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required')
];

const profileValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('phone').optional().isMobilePhone('any').withMessage('Valid phone number required')
];

const locationValidation = [
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('coordinates.*').isFloat({}).withMessage('Coordinates must be numbers'),
  body('address').optional().isObject().withMessage('Address must be an object')
];

// Profile management routes
router.get('/profile/complete', getCompleteProfile);
router.put('/profile/advanced', profileUpdateValidation, validate, updateAdvancedProfile);
router.put('/privacy-settings', updatePrivacySettings);
router.put('/notification-preferences', updateNotificationPreferences);

// Photo management routes
router.post('/photos', upload.array('photos', 6) as any, uploadProfilePhotos);
router.delete('/photos/:photoId', deleteProfilePhoto);
router.put('/photos/:photoId/primary', setPrimaryPhoto);

// Analytics and data export
router.get('/analytics', getUserAnalytics);
router.get('/export', exportUserData);

// Account management
router.post('/deactivate', deactivateAccount);
router.post('/reactivate', reactivateAccount);

// Legacy routes (for backward compatibility)
router.get('/profile', getProfile);
router.put('/profile', profileValidation, validate, updateProfile);
router.put('/preferences', updatePreferences);
router.put('/location', locationValidation, validate, updateLocation);
router.get('/stats', getUserStats);
router.post('/avatar', upload.single('avatar') as any, uploadAvatar);
router.delete('/account', deleteAccount);
router.put('/privacy', updatePrivacy);
router.put('/filters', updateFilters);

export default router;
