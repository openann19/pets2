// User Management Routes (using optimized adminController)
import express, { type Request, type Response, Router } from 'express';
import { checkPermission } from '../middleware/rbac';
import { adminActionLogger } from '../middleware/adminLogger';
import {
  getAllUsers,
  getUserDetails,
  getUserActivity
} from '../controllers/adminController';
import {
  getAllChats,
  getChatDetails
} from '../controllers/admin/AdminChatController';

const router: Router = express.Router();

// Type-safe wrapper function
const wrapHandler = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req, res);
  };
};

// User Management Routes
router.get('/users', checkPermission('users:read'), adminActionLogger('VIEW_USERS'), wrapHandler(getAllUsers));
router.get('/users/:id', checkPermission('users:read'), adminActionLogger('VIEW_USER_DETAILS'), wrapHandler(getUserDetails));
router.get('/users/:id/activity', checkPermission('users:read'), adminActionLogger('VIEW_USER_ACTIVITY'), wrapHandler(getUserActivity));

// Chat Moderation Routes
router.get('/chats', checkPermission('chats:read'), adminActionLogger('VIEW_CHATS'), wrapHandler(getAllChats));
router.get('/chats/:id', checkPermission('chats:read'), adminActionLogger('VIEW_CHAT_DETAILS'), wrapHandler(getChatDetails));

export default router;

