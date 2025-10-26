import logger from '../utils/logger';
import { sendNotificationEmail } from './emailService';
import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';

// Notification type definitions
export type NotificationType = 'error' | 'warning' | 'info' | 'security';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

// Admin notification interface
export interface AdminNotification {
  type?: NotificationType;
  severity?: SeverityLevel;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

// Health data interface
export interface SystemHealthData {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks?: Record<string, any>;
  timestamp?: string;
}

// Security alert interface
export interface SecurityAlert {
  type: string;
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
}

// Payment failure data interface
export interface PaymentFailureData {
  userId: string;
  amount: number;
  currency: string;
  error: string;
  paymentMethod?: string;
}

// Email content interface
export interface EmailContent {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

// Severity color mapping
const severityColors: Record<SeverityLevel, string> = {
  low: '#28a745',
  medium: '#ffc107',
  high: '#fd7e14',
  critical: '#dc3545'
};

/**
 * Send admin notification
 * @param notification - Notification object with type, severity, title, message, and metadata
 * @returns Promise that resolves when notification is sent
 */
export async function sendAdminNotification(notification: AdminNotification): Promise<void> {
  try {
    const {
      type = 'info',
      severity = 'medium',
      title,
      message,
      metadata = {}
    } = notification;

    // Get admin email addresses from environment
    const adminEmails = getAdminEmails();
    
    if (adminEmails.length === 0) {
      logger.warn('No admin emails configured for notifications');
      return;
    }

    // Determine if notification should be sent based on severity
    if (!shouldSendNotification(severity)) {
      logger.debug('Notification filtered by severity level', {
        severity,
        title,
        type
      });
      return;
    }

    // Prepare email content
    const subject = `[${severity.toUpperCase()}] ${title}`;
    const html = generateEmailTemplate(notification);

    // Send email notifications to all admins
    for (const adminEmail of adminEmails) {
      try {
        await sendNotificationEmail(adminEmail, subject, html);
      } catch (emailError) {
        logger.error('Failed to send admin notification email', {
          email: adminEmail,
          error: (emailError as Error).message
        });
      }
    }

    // Log notification sent
    logger.info('Admin notification sent', {
      type,
      severity,
      title,
      message,
      recipientCount: adminEmails.length,
      metadata
    });

    // Store notification in database for audit trail
    await storeNotification(notification);

  } catch (error) {
    logger.error('Failed to send admin notification', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      notification: {
        type: notification.type,
        severity: notification.severity,
        title: notification.title
      }
    });
    throw error;
  }
}

/**
 * Get admin email addresses from environment
 * @returns Array of admin email addresses
 */
function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS;
  
  if (!adminEmails) {
    return [];
  }

  return adminEmails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * Determine if notification should be sent based on severity
 * @param severity - Severity level of the notification
 * @returns True if notification should be sent
 */
function shouldSendNotification(severity: SeverityLevel): boolean {
  const minSeverity = (process.env.ADMIN_NOTIFICATION_MIN_SEVERITY || 'high') as SeverityLevel;
  
  const severityLevels: Record<SeverityLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  return severityLevels[severity] >= severityLevels[minSeverity];
}

/**
 * Generate HTML email template
 * @param notification - Notification object
 * @returns HTML string
 */
function generateEmailTemplate(notification: AdminNotification): string {
  const {
    type = 'info',
    severity = 'medium',
    title,
    message,
    metadata = {}
  } = notification;

  const color = severityColors[severity] || '#6c757d';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 20px; text-align: center; }
        .content { background: #f8f9fa; padding: 20px; }
        .metadata { background: #e9ecef; padding: 15px; margin-top: 20px; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          <p>Severity: ${severity.toUpperCase()} | Type: ${type.toUpperCase()}</p>
        </div>
        <div class="content">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          
          ${Object.keys(metadata).length > 0 ? `
            <div class="metadata">
              <h3>Additional Information:</h3>
              <pre>${JSON.stringify(metadata, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>This is an automated notification from PawfectMatch Admin System</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate text email template
 * @param notification - Notification object
 * @returns Plain text string
 */
function generateTextTemplate(notification: AdminNotification): string {
  const {
    type = 'info',
    severity = 'medium',
    title,
    message,
    metadata = {}
  } = notification;

  let text = `
${title}
Severity: ${severity.toUpperCase()}
Type: ${type.toUpperCase()}

Message:
${message}
`;

  if (Object.keys(metadata).length > 0) {
    text += `
Additional Information:
${JSON.stringify(metadata, null, 2)}
`;
  }

  text += `
---
This is an automated notification from PawfectMatch Admin System
Timestamp: ${new Date().toISOString()}
`;

  return text;
}

/**
 * Store notification in database for audit trail
 * @param notification - Notification object to store
 */
async function storeNotification(notification: AdminNotification): Promise<void> {
  try {
    // Dynamic import to avoid circular dependencies
    const AuditLog = (await import('../models/AuditLog')).default;
    
    await AuditLog.create({
      action: 'admin_notification',
      userId: null, // System action
      metadata: {
        type: notification.type,
        severity: notification.severity,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata
      },
      ip: 'system',
      userAgent: 'admin-notification-service'
    });
  } catch (error) {
    logger.error('Failed to store notification in database', {
      error: (error as Error).message,
      notification: notification.title
    });
    // Don't throw error here as notification was already sent
  }
}

/**
 * Send system health notification
 * @param healthData - System health data
 */
export async function sendSystemHealthNotification(healthData: SystemHealthData): Promise<void> {
  const isHealthy = healthData.status === 'healthy';
  
  await sendAdminNotification({
    type: 'info',
    severity: isHealthy ? 'low' : 'high',
    title: `System Health ${isHealthy ? 'OK' : 'Issues Detected'}`,
    message: isHealthy 
      ? 'System is running normally'
      : 'System health issues detected. Please check the dashboard.',
    metadata: healthData
  });
}

/**
 * Send security alert notification
 * @param alert - Security alert data
 */
export async function sendSecurityAlert(alert: SecurityAlert): Promise<void> {
  await sendAdminNotification({
    type: 'security',
    severity: 'critical',
    title: 'Security Alert',
    message: alert.message,
    metadata: {
      alertType: alert.type,
      userId: alert.userId,
      ip: alert.ip,
      userAgent: alert.userAgent,
      timestamp: alert.timestamp
    }
  });
}

/**
 * Send payment failure notification
 * @param paymentData - Payment failure data
 */
export async function sendPaymentFailureNotification(paymentData: PaymentFailureData): Promise<void> {
  await sendAdminNotification({
    type: 'error',
    severity: 'high',
    title: 'Payment Processing Failure',
    message: `Payment failed for user ${paymentData.userId}`,
    metadata: {
      userId: paymentData.userId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      error: paymentData.error,
      paymentMethod: paymentData.paymentMethod
    }
  });
}

// Export default object for backward compatibility
export default {
  sendAdminNotification,
  sendSystemHealthNotification,
  sendSecurityAlert,
  sendPaymentFailureNotification
};

