/**
 * Admin Services Management Controller
 * Handles admin panel endpoints for managing AI, upload, moderation, and push services
 */

import type { Request, Response } from 'express';
import logger from '../../utils/logger';
import { FLAGS } from '../../config/flags';
import AnalyticsEvent from '../../models/AnalyticsEvent';
import { logAdminActivity } from '../../middleware/adminLogger';
import { getErrorMessage } from '../../utils/errorHandler';

interface AdminRequest extends Request {
  userId?: string;
}

/**
 * GET /api/admin/services/status
 * Get status of all services
 */
export const getServicesStatus = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const services = {
      ai: {
        enabled: FLAGS.aiEnabled,
        openai: !!process.env.OPENAI_API_KEY,
        deepseek: !!process.env.DEEPSEEK_API_KEY,
        configStatus: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      },
      moderation: {
        enabled: true,
        awsRekognition: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        googleVision: !!process.env.GOOGLE_VISION_API_KEY,
        configStatus: process.env.AWS_ACCESS_KEY_ID ? 'aws_configured' : 'fallback_mode',
      },
      upload: {
        cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD),
        s3: !!(process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET),
        configStatus: process.env.CLOUDINARY_CLOUD_NAME ? 'cloudinary_configured' : 's3_configured',
      },
      push: {
        enabled: !!process.env.FCM_SERVER_KEY,
        fcmConfigured: !!process.env.FCM_SERVER_KEY,
        configStatus: process.env.FCM_SERVER_KEY ? 'configured' : 'not_configured',
      },
      payments: {
        enabled: FLAGS.paymentsEnabled,
        stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
        configStatus: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      },
      live: {
        enabled: FLAGS.liveEnabled,
        livekitConfigured: !!(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY),
        configStatus: (process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY) ? 'configured' : 'not_configured',
      },
    };

    await logAdminActivity(req, 'VIEW_SERVICES_STATUS');

    res.json({
      success: true,
      data: services,
    });
  } catch (error: unknown) {
    logger.error('Failed to get services status', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get services status',
      message: getErrorMessage(error),
    });
  }
};

/**
 * GET /api/admin/services/analytics
 * Get usage analytics for services
 */
export const getServicesAnalytics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get analytics events for the period
    const events = await AnalyticsEvent.countDocuments({
      ts: { $gte: startDate },
    });

    // Count AI generations
    const aiGenerations = await AnalyticsEvent.countDocuments({
      event: { $regex: /ai_|bio_|photo_analysis/ },
      ts: { $gte: startDate },
    });

    // Count uploads
    const uploads = await AnalyticsEvent.countDocuments({
      event: { $regex: /upload_|photo_/ },
      ts: { $gte: startDate },
    });

    // Count push notifications
    const pushNotifications = await AnalyticsEvent.countDocuments({
      event: { $regex: /push_|notification_/ },
      ts: { $gte: startDate },
    });

    const analytics = {
      period,
      eventsTotal: events,
      aiGenerations,
      uploads,
      pushNotifications,
      timestamp: new Date().toISOString(),
    };

    await logAdminActivity(req, 'VIEW_SERVICES_ANALYTICS', { period });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: unknown) {
    logger.error('Failed to get services analytics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get services analytics',
      message: getErrorMessage(error),
    });
  }
};

/**
 * POST /api/admin/services/toggle
 * Toggle a service on/off
 */
export const toggleService = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { service, enabled } = req.body as { service: string; enabled: boolean };

    // In a real implementation, you would update the configuration
    // For now, just log the action
    logger.info('Service toggle requested', { service, enabled });

    await logAdminActivity(req, 'TOGGLE_SERVICE', { service, enabled });

    res.json({
      success: true,
      message: `Service ${service} ${enabled ? 'enabled' : 'disabled'}`,
      data: { service, enabled },
    });
  } catch (error: unknown) {
    logger.error('Failed to toggle service', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to toggle service',
      message: getErrorMessage(error),
    });
  }
};

/**
 * GET /api/admin/services/upload-stats
 * Get upload statistics
 */
export const getUploadStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const photoUploads = await AnalyticsEvent.countDocuments({
      event: 'photo_upload_success',
      ts: { $gte: startDate },
    });

    const voiceUploads = await AnalyticsEvent.countDocuments({
      event: 'voice_upload_success',
      ts: { $gte: startDate },
    });

    const uploadErrors = await AnalyticsEvent.countDocuments({
      event: 'upload_error',
      ts: { $gte: startDate },
    });

    const stats = {
      period,
      photoUploads,
      voiceUploads,
      totalUploads: photoUploads + voiceUploads,
      uploadErrors,
      successRate: photoUploads + voiceUploads > 0
        ? ((photoUploads + voiceUploads) / (photoUploads + voiceUploads + uploadErrors)) * 100
        : 0,
    };

    await logAdminActivity(req, 'VIEW_UPLOAD_STATS');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    logger.error('Failed to get upload stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get upload stats',
      message: getErrorMessage(error),
    });
  }
};

/**
 * GET /api/admin/services/ai-stats
 * Get AI service statistics
 */
export const getAIStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const bioGenerations = await AnalyticsEvent.countDocuments({
      event: 'ai_bio_generated',
      ts: { $gte: startDate },
    });

    const photoAnalyses = await AnalyticsEvent.countDocuments({
      event: 'photo_analysis_completed',
      ts: { $gte: startDate },
    });

    const compatChecks = await AnalyticsEvent.countDocuments({
      event: 'compatibility_check',
      ts: { $gte: startDate },
    });

    const aiErrors = await AnalyticsEvent.countDocuments({
      event: 'ai_error',
      ts: { $gte: startDate },
    });

    const stats = {
      period,
      bioGenerations,
      photoAnalyses,
      compatChecks,
      totalAICalls: bioGenerations + photoAnalyses + compatChecks,
      aiErrors,
      successRate: (bioGenerations + photoAnalyses + compatChecks) > 0
        ? ((bioGenerations + photoAnalyses + compatChecks) / (bioGenerations + photoAnalyses + compatChecks + aiErrors)) * 100
        : 0,
    };

    await logAdminActivity(req, 'VIEW_AI_STATS');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    logger.error('Failed to get AI stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get AI stats',
      message: getErrorMessage(error),
    });
  }
};

/**
 * GET /api/admin/services/push-stats
 * Get push notification statistics
 */
export const getPushStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    const pushSent = await AnalyticsEvent.countDocuments({
      event: { $regex: /push_|notification_sent/ },
      ts: { $gte: startDate },
    });

    const pushReceived = await AnalyticsEvent.countDocuments({
      event: 'push_received',
      ts: { $gte: startDate },
    });

    const pushErrors = await AnalyticsEvent.countDocuments({
      event: 'push_error',
      ts: { $gte: startDate },
    });

    const stats = {
      period,
      pushSent,
      pushReceived,
      pushErrors,
      deliveryRate: pushSent > 0 ? (pushReceived / pushSent) * 100 : 0,
    };

    await logAdminActivity(req, 'VIEW_PUSH_STATS');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    logger.error('Failed to get push stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get push stats',
      message: getErrorMessage(error),
    });
  }
};

/**
 * GET /api/admin/services/combined-stats
 * Get combined statistics for all services
 */
export const getCombinedStats = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    let startDate: Date;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // AI Stats
    const bioGenerations = await AnalyticsEvent.countDocuments({
      event: 'ai_bio_generated',
      ts: { $gte: startDate },
    });
    const photoAnalyses = await AnalyticsEvent.countDocuments({
      event: 'photo_analysis_completed',
      ts: { $gte: startDate },
    });
    const aiErrors = await AnalyticsEvent.countDocuments({
      event: 'ai_error',
      ts: { $gte: startDate },
    });

    // Upload Stats
    const photoUploads = await AnalyticsEvent.countDocuments({
      event: 'photo_upload_success',
      ts: { $gte: startDate },
    });
    const voiceUploads = await AnalyticsEvent.countDocuments({
      event: 'voice_upload_success',
      ts: { $gte: startDate },
    });
    const uploadErrors = await AnalyticsEvent.countDocuments({
      event: 'upload_error',
      ts: { $gte: startDate },
    });

    // Push Stats
    const pushSent = await AnalyticsEvent.countDocuments({
      event: { $regex: /push_|notification_sent/ },
      ts: { $gte: startDate },
    });
    const pushReceived = await AnalyticsEvent.countDocuments({
      event: 'push_received',
      ts: { $gte: startDate },
    });

    const stats = {
      period,
      ai: {
        bioGenerations,
        photoAnalyses,
        totalAICalls: bioGenerations + photoAnalyses,
        aiErrors,
        successRate: bioGenerations + photoAnalyses > 0
          ? ((bioGenerations + photoAnalyses) / (bioGenerations + photoAnalyses + aiErrors)) * 100
          : 0,
      },
      upload: {
        photoUploads,
        voiceUploads,
        totalUploads: photoUploads + voiceUploads,
        uploadErrors,
        successRate: photoUploads + voiceUploads > 0
          ? ((photoUploads + voiceUploads) / (photoUploads + voiceUploads + uploadErrors)) * 100
          : 0,
      },
      push: {
        pushSent,
        pushReceived,
        deliveryRate: pushSent > 0 ? (pushReceived / pushSent) * 100 : 0,
      },
      timestamp: new Date().toISOString(),
    };

    await logAdminActivity(req, 'VIEW_COMBINED_SERVICES_STATS');

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    logger.error('Failed to get combined stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get combined stats',
      message: getErrorMessage(error),
    });
  }
};

