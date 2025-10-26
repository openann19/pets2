/**
 * Admin Controller Facade for PawfectMatch
 * Re-exports all admin functions from specialized controllers
 */

import * as AdminUserController from './admin/AdminUserController';
import * as AdminChatController from './admin/AdminChatController';
import * as AdminAPIController from './admin/AdminAPIController';
import * as AdminKYCController from './admin/AdminKYCController';

// Re-export individual functions
export {
  getAllUsers,
  getUserDetails,
  suspendUser,
  banUser,
  activateUser,
  updateUserRole,
  getUserActivity
} from './admin/AdminUserController';

export * from './admin/AdminChatController';
export * from './admin/AdminAPIController';
export * from './admin/AdminKYCController';

// Default export for compatibility
export default {
  ...AdminUserController,
  ...AdminChatController,
  ...AdminAPIController,
  ...AdminKYCController
};

