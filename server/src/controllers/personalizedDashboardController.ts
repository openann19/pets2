/**
 * Personalized Dashboard Controller
 * Phase 1 Product Enhancement - Home Screen
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import { getPersonalizedDashboard } from '../services/personalizedDashboardService';
import logger from '../utils/logger';

/**
 * @desc    Get personalized dashboard data
 * @route   GET /api/home/dashboard
 * @access  Private
 */
export const getDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId || req.user?._id?.toString();
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const dashboardData = await getPersonalizedDashboard(userId);

    res.status(200).json(dashboardData);
  } catch (error) {
    logger.error('Failed to get personalized dashboard', {
      error: error instanceof Error ? error.message : String(error),
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

