import type { Response } from 'express';
import User, { type IUserDocument } from '../models/User';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/express';
import { getErrorMessage } from '../utils/errorHandler';

/**
 * Request interfaces
 */
interface ChangePasswordRequest extends AuthRequest {
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

interface LogoutAllRequest extends AuthRequest {}

/**
 * POST /api/auth/change-password
 */
export const changePassword = async (req: ChangePasswordRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new password are required' });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Type assertion needed because comparePassword is a method defined in schema
    const ok = await (user as unknown as IUserDocument).comparePassword(currentPassword);
    if (!ok) {
      res.status(401).json({ success: false, message: 'Invalid current password' });
      return;
    }

    user.password = newPassword;
    user.refreshTokens = []; // revoke all refresh tokens
    user.tokensInvalidatedAt = new Date(); // any existing access tokens become invalid
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: unknown) {
    logger.error('Change password error', { error: getErrorMessage(error) });
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

/**
 * POST /api/auth/logout-all
 */
export const logoutAll = async (req: LogoutAllRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await User.findByIdAndUpdate(req.userId, {
      $set: { refreshTokens: [], tokensInvalidatedAt: new Date() }
    });
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error: unknown) {
    logger.error('Logout all error', { error: getErrorMessage(error) });
    res.status(500).json({ success: false, message: 'Failed to logout from all devices' });
  }
};

