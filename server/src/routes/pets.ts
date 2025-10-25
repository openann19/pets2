import express, { Router, Response } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { validate } from '../middleware/validation';
import { authenticateToken, requirePremiumFeature } from '../middleware/auth';
import type { AuthenticatedRequest, ApiResponse } from '../types';

// Import controllers from CommonJS modules
const petController = require('../controllers/petController');

const {
  getCompletePetProfile,
  createPet,
  createPetAdvanced,
  discoverPets,
  swipePet,
  getMyPets,
  getPet,
  updatePet,
  updatePetAdvanced,
  getPetAnalytics,
  duplicatePet,
  togglePetArchive,
  deletePet
} = petController;

const router: Router = express.Router();

// Configure multer for memory storage (Cloudinary upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
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
const createPetValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('species').isIn(['dog', 'cat', 'bird', 'rabbit', 'other']).withMessage('Invalid species'),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be 0-30'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Invalid gender'),
  body('size').optional().isIn(['small', 'medium', 'large', 'extra-large']).withMessage('Invalid size'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('breed').optional().trim().isLength({ max: 100 }).withMessage('Breed name too long'),
  body('personality').optional().isArray().withMessage('Personality must be an array'),
  body('activityLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid activity level'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('location.address').optional().isString().withMessage('Address must be a string')
];

const updatePetValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('species').optional().isIn(['dog', 'cat', 'bird', 'rabbit', 'other']).withMessage('Invalid species'),
  body('age').optional().isInt({ min: 0, max: 30 }).withMessage('Age must be 0-30'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Invalid gender'),
  body('size').optional().isIn(['small', 'medium', 'large', 'extra-large']).withMessage('Invalid size'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('breed').optional().trim().isLength({ max: 100 }).withMessage('Breed name too long'),
  body('personality').optional().isArray().withMessage('Personality must be an array'),
  body('activityLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid activity level')
];

const swipeValidation = [
  body('petId').isMongoId().withMessage('Valid pet ID required'),
  body('action').isIn(['like', 'pass', 'superlike']).withMessage('Action must be like, pass, or superlike')
];

// Pet discovery and swiping
router.get('/discover', discoverPets);
router.post('/swipe', swipeValidation, validate, swipePet);

// Pet management
router.get('/my-pets', getMyPets);
router.get('/:petId', getPet);
router.get('/:petId/complete', getCompletePetProfile);
router.get('/:petId/analytics', getPetAnalytics);

// Pet creation
router.post('/', createPetValidation, validate, createPet);
router.post('/advanced', requirePremiumFeature('advanced_pet_profiles'), createPetValidation, validate, createPetAdvanced);

// Pet updates
router.put('/:petId', updatePetValidation, validate, updatePet);
router.put('/:petId/advanced', requirePremiumFeature('advanced_pet_profiles'), updatePetValidation, validate, updatePetAdvanced);

// Pet photos
router.post('/:petId/photos', upload.array('photos', 10), (req: AuthenticatedRequest, res, next) => {
  // Photo upload logic would go here
  next();
});

// Pet actions
router.post('/:petId/duplicate', duplicatePet);
router.patch('/:petId/archive', togglePetArchive);
router.delete('/:petId', deletePet);

export default router;
