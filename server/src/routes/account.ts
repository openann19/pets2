import express, { type Request, type Response, Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { type IUserDocument } from '../models/User';
import {
  getAccountStatus,
  requestDataExport,
  cancelAccountDeletion,
  initiateAccountDeletion,
  getProfileStats,
  confirmAccountDeletion
} from '../controllers/accountController';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

const router: Router = express.Router();

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

// Type-safe wrapper function
const wrapHandler = (handler: (req: any, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req, res);
  };
};

// Routes
router.get('/status', wrapHandler(getAccountStatus));
router.post('/export-data', dataExportValidation, validate, wrapHandler(requestDataExport));
router.post('/cancel-deletion', deletionValidation, validate, wrapHandler(cancelAccountDeletion));
router.post('/delete', [
  body('password').notEmpty().withMessage('Password is required'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('feedback').optional().isString().withMessage('Feedback must be a string')
], validate, wrapHandler(initiateAccountDeletion));

router.delete('/delete-account', [
  body('password').notEmpty().withMessage('Password is required'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('feedback').optional().isString().withMessage('Feedback must be a string')
], validate, wrapHandler(initiateAccountDeletion));

router.post('/confirm-deletion', [
  body('token').notEmpty().withMessage('Confirmation token is required')
], validate, wrapHandler(confirmAccountDeletion));

// Profile stats (different from user stats - includes pets, matches, messages counts)
router.get('/profile-stats', wrapHandler(getProfileStats));

export default router;
