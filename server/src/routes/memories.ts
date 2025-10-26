import express, { type Request, type Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMemories } from '../controllers/memoriesController';

const router: Router = express.Router();

// All memory routes require authentication
router.use(authenticateToken);

// Type-safe wrapper function
const wrapHandler = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req, res);
  };
};

// Routes
router.get('/:matchId', wrapHandler(getMemories));

export default router;

