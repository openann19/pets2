/**
 * Admin System Management Controller
 * Handles system health monitoring and metrics
 */

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from '../../utils/logger';
import { logAdminActivity } from '../../middleware/adminLogger';

interface AdminRequest extends Request {
  userId?: string;
}

/**
 * GET /api/admin/system-health
 * Get system health status
 */
export const getSystemHealth = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const startTime = process.uptime();
    const uptime = Math.floor(startTime);
    
    // Get MongoDB connection status
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    const dbConnected = dbState === 1;

    // Get memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal / 1024 / 1024; // MB
    const usedMemory = memUsage.heapUsed / 1024 / 1024; // MB
    const externalMemory = memUsage.external / 1024 / 1024; // MB

    // Determine overall status
    const status = dbConnected ? 'healthy' : 'unhealthy';

    const systemHealth = {
      status,
      uptime,
      database: {
        status: dbStatus,
        connected: dbConnected,
      },
      memory: {
        used: Math.round(usedMemory * 100) / 100,
        total: Math.round(totalMemory * 100) / 100,
        external: Math.round(externalMemory * 100) / 100,
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };

    await logAdminActivity(req, 'VIEW_SYSTEM_HEALTH');

    res.json({
      success: true,
      data: systemHealth,
    });
  } catch (error: any) {
    logger.error('Failed to get system health', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get system health',
      message: error.message,
    });
  }
};

