import express, { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import {
  deleteAccount,
  exportUserData,
  confirmDeletion,
  cancelDeletion
} from '../controllers/gdprController';

const router: Router = express.Router();

// Apply authentication to all GDPR routes
router.use(authenticateToken);

// Validation rules
const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// GDPR routes
router.post('/delete-account', deleteAccountValidation, validate, deleteAccount);
router.post('/export-data', exportUserData);
router.post('/confirm-deletion', confirmDeletion);
router.post('/cancel-deletion', cancelDeletion);

export default router;

