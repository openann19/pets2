const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { validate } = require('../middleware/validation');
const { authenticateToken, requirePremiumFeature } = require('../middleware/auth');
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
} = require('../controllers/petController');

const router = express.Router();

// Configure multer for memory storage (Cloudinary upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
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
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long')
];

const swipeValidation = [
  body('action').isIn(['like', 'pass', 'superlike']).withMessage('Invalid swipe action')
];

// Pet management routes
router.get('/discover', discoverPets);
router.get('/my-pets', getMyPets);
router.post('/', upload.array('photos', 10), createPetValidation, validate, createPet);
router.post('/advanced', upload.array('photos', 10), createPetAdvanced);
router.get('/:id', getPet);
router.get('/:id/complete', getCompletePetProfile);
router.get('/:id/analytics', getPetAnalytics);
router.put('/:id', upload.array('photos', 5), updatePet);
router.put('/:id/advanced', upload.array('photos', 5), updatePetAdvanced);
router.post('/:id/archive', togglePetArchive);
router.post('/:id/duplicate', duplicatePet);
router.post('/:id/swipe', swipeValidation, validate, swipePet);
router.delete('/:id', deletePet);

// Premium features
router.get('/discover/premium', requirePremiumFeature('advancedFilters'), discoverPets);

module.exports = router;