/**
 * Analytics Configuration Controller
 * Manages analytics settings via admin panel
 */

import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/express';
import Configuration from '../models/Configuration';
import { encrypt, decrypt } from '../utils/encryption';
import logger from '../utils/logger';
import { adminActionLogger } from '../middleware/adminLogger';
import { checkPermission } from '../middleware/rbac';

/**
 * Get analytics configuration
 */
export const getAnalyticsConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const config = await Configuration.findOne({ type: 'analytics' });

    if (!config) {
      // Return default config with environment variables
      res.json({
        success: true,
        data: {
          reportEmails: process.env['ADMIN_REPORT_EMAILS']?.split(',').map(e => e.trim()) || [],
          emailService: {
            provider: process.env['EMAIL_SERVICE'] || 'nodemailer',
            host: process.env['EMAIL_HOST'] || '',
            port: parseInt(process.env['EMAIL_PORT'] || '587'),
            user: process.env['EMAIL_USER'] || '',
            from: process.env['EMAIL_FROM'] || 'noreply@pawfectmatch.com',
            // Don't return password in GET
            passwordConfigured: !!process.env['EMAIL_PASS']
          },
          reportSchedule: {
            dailyEnabled: true,
            dailyTime: '09:00',
            weeklyEnabled: true,
            weeklyDay: 'monday',
            weeklyTime: '09:00',
            timezone: 'UTC'
          },
          alertThresholds: {
            churnRate: { warning: 5, critical: 10 },
            conversionRate: { warning: 10, critical: 5 },
            retentionWeek1: { warning: 50, critical: 40 },
            retentionMonth1: { warning: 30, critical: 20 }
          }
        },
        isConfigured: false
      });
      return;
    }

    // Decrypt sensitive fields
    const data = config.data as any;
    const decryptedData = {
      reportEmails: data.reportEmails || [],
      emailService: {
        provider: data.emailService?.provider || 'nodemailer',
        host: data.emailService?.host || process.env['EMAIL_HOST'] || '',
        port: data.emailService?.port || parseInt(process.env['EMAIL_PORT'] || '587'),
        user: data.emailService?.user || process.env['EMAIL_USER'] || '',
        from: data.emailService?.from || process.env['EMAIL_FROM'] || 'noreply@pawfectmatch.com',
        passwordConfigured: !!data.emailService?.password
      },
      reportSchedule: data.reportSchedule || {
        dailyEnabled: true,
        dailyTime: '09:00',
        weeklyEnabled: true,
        weeklyDay: 'monday',
        weeklyTime: '09:00',
        timezone: 'UTC'
      },
      alertThresholds: data.alertThresholds || {
        churnRate: { warning: 5, critical: 10 },
        conversionRate: { warning: 10, critical: 5 },
        retentionWeek1: { warning: 50, critical: 40 },
        retentionMonth1: { warning: 30, critical: 20 }
      }
    };

    res.json({
      success: true,
      data: decryptedData,
      isConfigured: true,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy
    });
  } catch (error: unknown) {
    logger.error('Failed to get analytics config', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update analytics configuration
 */
export const updateAnalyticsConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      reportEmails,
      emailService,
      reportSchedule,
      alertThresholds
    } = req.body;

    // Validate report emails
    if (reportEmails && Array.isArray(reportEmails)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const email of reportEmails) {
        if (typeof email !== 'string' || !emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: `Invalid email address: ${email}`
          });
          return;
        }
      }
    }

    // Validate email service
    if (emailService) {
      if (emailService.provider && !['nodemailer', 'sendgrid'].includes(emailService.provider)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email provider. Must be nodemailer or sendgrid'
        });
        return;
      }

      if (emailService.port && (emailService.port < 1 || emailService.port > 65535)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email port. Must be between 1 and 65535'
        });
        return;
      }
    }

    // Prepare data to save
    const configData: any = {};

    if (reportEmails !== undefined) {
      configData.reportEmails = reportEmails;
    }

    if (emailService) {
      configData.emailService = {
        provider: emailService.provider || 'nodemailer',
        host: emailService.host || '',
        port: emailService.port || 587,
        user: emailService.user || '',
        from: emailService.from || 'noreply@pawfectmatch.com'
      };

      // Encrypt password if provided
      if (emailService.password && emailService.password !== '***configured***') {
        configData.emailService.password = await encrypt(emailService.password);
      } else if (emailService.passwordConfigured) {
        // Keep existing password (don't update)
        const existingConfig = await Configuration.findOne({ type: 'analytics' });
        if (existingConfig?.data?.emailService?.password) {
          configData.emailService.password = existingConfig.data.emailService.password;
        }
      }
    }

    if (reportSchedule) {
      configData.reportSchedule = {
        dailyEnabled: reportSchedule.dailyEnabled !== undefined ? reportSchedule.dailyEnabled : true,
        dailyTime: reportSchedule.dailyTime || '09:00',
        weeklyEnabled: reportSchedule.weeklyEnabled !== undefined ? reportSchedule.weeklyEnabled : true,
        weeklyDay: reportSchedule.weeklyDay || 'monday',
        weeklyTime: reportSchedule.weeklyTime || '09:00',
        timezone: reportSchedule.timezone || 'UTC'
      };
    }

    if (alertThresholds) {
      configData.alertThresholds = {
        churnRate: {
          warning: alertThresholds.churnRate?.warning || 5,
          critical: alertThresholds.churnRate?.critical || 10
        },
        conversionRate: {
          warning: alertThresholds.conversionRate?.warning || 10,
          critical: alertThresholds.conversionRate?.critical || 5
        },
        retentionWeek1: {
          warning: alertThresholds.retentionWeek1?.warning || 50,
          critical: alertThresholds.retentionWeek1?.critical || 40
        },
        retentionMonth1: {
          warning: alertThresholds.retentionMonth1?.warning || 30,
          critical: alertThresholds.retentionMonth1?.critical || 20
        }
      };
    }

    // Save to database
    const updatedConfig = await Configuration.findOneAndUpdate(
      { type: 'analytics' },
      {
        data: configData,
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Log admin action
    await adminActionLogger('UPDATE_ANALYTICS_CONFIG')(req, res, () => {});

    res.json({
      success: true,
      message: 'Analytics configuration updated successfully',
      data: {
        reportEmails: configData.reportEmails || [],
        emailService: {
          ...configData.emailService,
          password: configData.emailService?.password ? '***configured***' : undefined
        },
        reportSchedule: configData.reportSchedule,
        alertThresholds: configData.alertThresholds
      },
      updatedAt: updatedConfig.updatedAt
    });
  } catch (error: unknown) {
    logger.error('Failed to update analytics config', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to update analytics configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Test email configuration
 */
export const testEmailConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required for test'
      });
      return;
    }

    // Get current config
    const config = await Configuration.findOne({ type: 'analytics' });
    const emailService = config?.data?.emailService || {};

    // Use config or fallback to env vars
    const emailHost = emailService.host || process.env['EMAIL_HOST'];
    const emailPort = emailService.port || parseInt(process.env['EMAIL_PORT'] || '587');
    const emailUser = emailService.user || process.env['EMAIL_USER'];
    const emailPassword = emailService.password
      ? await decrypt(emailService.password)
      : process.env['EMAIL_PASS'];

    if (!emailHost || !emailUser || !emailPassword) {
      res.status(400).json({
        success: false,
        message: 'Email service not fully configured. Please configure email settings first.'
      });
      return;
    }

    // Send test email
    const { sendNotificationEmail } = await import('../services/emailService');
    await sendNotificationEmail(
      email,
      'PawfectMatch Analytics Configuration Test',
      '<h1>Test Email</h1><p>This is a test email from PawfectMatch analytics configuration.</p><p>If you received this, your email service is configured correctly!</p>'
    );

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error: unknown) {
    logger.error('Failed to send test email', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

