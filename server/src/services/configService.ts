/**
 * Configuration Service
 * Reads configuration from database with environment variable fallback
 */

import Configuration from '../models/Configuration';
import { decrypt } from '../utils/encryption';
import logger from '../utils/logger';

class ConfigService {
  /**
   * Get analytics configuration
   * Returns database config if available, otherwise uses environment variables
   */
  async getAnalyticsConfig(): Promise<{
    reportEmails: string[];
    emailService: {
      provider: string;
      host: string;
      port: number;
      user: string;
      password?: string;
      from: string;
    };
    reportSchedule: {
      dailyEnabled: boolean;
      dailyTime: string;
      weeklyEnabled: boolean;
      weeklyDay: string;
      weeklyTime: string;
      timezone: string;
    };
    alertThresholds: {
      churnRate: { warning: number; critical: number };
      conversionRate: { warning: number; critical: number };
      retentionWeek1: { warning: number; critical: number };
      retentionMonth1: { warning: number; critical: number };
    };
  }> {
    try {
      const config = await Configuration.findOne({ type: 'analytics' });

      if (config && config.data) {
        const data = config.data as any;
        return {
          reportEmails: data.reportEmails || process.env['ADMIN_REPORT_EMAILS']?.split(',').map(e => e.trim()).filter(Boolean) || [],
          emailService: {
            provider: data.emailService?.provider || process.env['EMAIL_SERVICE'] || 'nodemailer',
            host: data.emailService?.host || process.env['EMAIL_HOST'] || 'smtp.gmail.com',
            port: data.emailService?.port || parseInt(process.env['EMAIL_PORT'] || '587'),
            user: data.emailService?.user || process.env['EMAIL_USER'] || '',
            password: data.emailService?.password ? await decrypt(data.emailService.password) : process.env['EMAIL_PASS'],
            from: data.emailService?.from || process.env['EMAIL_FROM'] || 'noreply@pawfectmatch.com'
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
      }

      // Fallback to environment variables
      return {
        reportEmails: process.env['ADMIN_REPORT_EMAILS']?.split(',').map(e => e.trim()).filter(Boolean) || [],
        emailService: {
          provider: process.env['EMAIL_SERVICE'] || 'nodemailer',
          host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
          port: parseInt(process.env['EMAIL_PORT'] || '587'),
          user: process.env['EMAIL_USER'] || '',
          password: process.env['EMAIL_PASS'],
          from: process.env['EMAIL_FROM'] || 'noreply@pawfectmatch.com'
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
      };
    } catch (error) {
      logger.error('Error getting analytics config', { error });
      // Return safe defaults
      return {
        reportEmails: [],
        emailService: {
          provider: 'nodemailer',
          host: '',
          port: 587,
          user: '',
          from: 'noreply@pawfectmatch.com'
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
      };
    }
  }
}

export default new ConfigService();

