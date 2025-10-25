const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  getAccountStatus,
  requestDataExport,
  cancelAccountDeletion,
  initiateAccountDeletion,
  getProfileStats
} = require('../controllers/accountController');

const router = express.Router();

// All account routes require authentication
router.use(authenticateToken);

// Validation rules
const dataExportValidation = [
  body('format').optional().isIn(['json', 'csv']).withMessage('Format must be json or csv'),
  body('includeMessages').optional().isBoolean().withMessage('includeMessages must be boolean'),
  body('includeMatches').optional().isBoolean().withMessage('includeMatches must be boolean'),
  body('includeProfileData').optional().isBoolean().withMessage('includeProfileData must be boolean'),
  body('includePreferences').optional().isBoolean().withMessage('includePreferences must be boolean')
];

const deletionValidation = [
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('requestId').optional().isString().withMessage('Request ID must be a string')
];

// Routes
router.get('/status', getAccountStatus);
router.post('/export-data', dataExportValidation, validate, requestDataExport);
router.post('/cancel-deletion', deletionValidation, validate, cancelAccountDeletion);
router.post('/delete', [
  body('reason').optional().isString().withMessage('Reason must be a string')
], validate, initiateAccountDeletion);

// Profile stats (different from user stats - includes pets, matches, messages counts)
router.get('/profile-stats', getProfileStats);

module.exports = router;
