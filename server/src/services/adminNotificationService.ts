/**
 * Admin Notification Service
 * Sends notifications to administrators for critical system events
 */

import logger from '../utils/logger';
import { sendEmail } from './emailService';

interface AdminNotification {
  type?: 'error' | 'warning' | 'info' | 'success';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send admin notification
 * @param notification - Notification object
 */
export async function sendAdminNotification(type: string, metadata: Record<string, unknown> = {}): Promise<void> {
  try {
    const notification: AdminNotification = {
      type: 'info',
      severity: 'medium',
      title: `System Event: ${type}`,
      message: `A system event occurred: ${type}`,
      metadata
    };

    // Get admin email addresses from environment
    const adminEmails = getAdminEmails();
    
    if (adminEmails.length === 0) {
      logger.warn('No admin emails configured for notifications');
      return;
    }

    // Determine if notification should be sent based on severity
    if (!shouldSendNotification(notification.severity!)) {
      logger.debug('Notification filtered by severity level', {
        severity: notification.severity,
        title: notification.title,
        type: notification.type
      });
      return;
    }

    // Prepare email content
    const emailContent = {
      to: adminEmails,
      subject: `[${notification.severity!.toUpperCase()}] ${notification.title}`,
      html: generateEmailTemplate(notification),
      text: generateTextTemplate(notification)
    };

    // Send email
    await sendEmail(
      emailContent.to.join(', '),
      emailContent.subject,
      emailContent.html,
      emailContent.text
    );

    logger.info('Admin notification sent successfully', {
      type: notification.type,
      severity: notification.severity,
      title: notification.title,
      recipientCount: adminEmails.length
    });

  } catch (error) {
    logger.error('Error sending admin notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type,
      metadata
    });
    throw error;
  }
}

/**
 * Send critical system alert
 * @param alert - Alert details
 */
export async function sendCriticalAlert(alert: {
  title: string;
  message: string;
  component?: string;
  error?: any;
  metadata?: any;
}): Promise<void> {
  try {
    const notification: AdminNotification = {
      type: 'error',
      severity: 'critical',
      title: `🚨 CRITICAL ALERT: ${alert.title}`,
      message: alert.message,
      metadata: {
        component: alert.component,
        error: alert.error,
        timestamp: new Date().toISOString(),
        ...alert.metadata
      }
    };

    await sendAdminNotification('critical_alert', notification);
  } catch (error) {
    logger.error('Error sending critical alert', { error, alert });
    throw error;
  }
}

/**
 * Send system health notification
 * @param health - Health status
 */
export async function sendHealthNotification(health: {
  status: 'healthy' | 'degraded' | 'critical';
  message: string;
  metrics?: any;
}): Promise<void> {
  try {
    const severity = health.status === 'critical' ? 'critical' : 
                    health.status === 'degraded' ? 'high' : 'medium';
    
    const notification: AdminNotification = {
      type: health.status === 'healthy' ? 'success' : 'warning',
      severity,
      title: `System Health: ${health.status.toUpperCase()}`,
      message: health.message,
      metadata: {
        status: health.status,
        metrics: health.metrics,
        timestamp: new Date().toISOString()
      }
    };

    await sendAdminNotification('health_check', notification);
  } catch (error) {
    logger.error('Error sending health notification', { error, health });
    throw error;
  }
}

/**
 * Send security alert
 * @param security - Security alert details
 */
export async function sendSecurityAlert(security: {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  metadata?: any;
}): Promise<void> {
  try {
    const notification: AdminNotification = {
      type: 'error',
      severity: security.severity,
      title: `🔒 SECURITY ALERT: ${security.type}`,
      message: security.description,
      metadata: {
        securityType: security.type,
        ipAddress: security.ipAddress,
        userAgent: security.userAgent,
        userId: security.userId,
        timestamp: new Date().toISOString(),
        ...security.metadata
      }
    };

    await sendAdminNotification('security_alert', notification);
  } catch (error) {
    logger.error('Error sending security alert', { error, security });
    throw error;
  }
}

/**
 * Send performance alert
 * @param performance - Performance alert details
 */
export async function sendPerformanceAlert(performance: {
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}): Promise<void> {
  try {
    const notification: AdminNotification = {
      type: 'warning',
      severity: performance.severity,
      title: `⚡ PERFORMANCE ALERT: ${performance.metric}`,
      message: performance.description || `Performance metric ${performance.metric} exceeded threshold`,
      metadata: {
        metric: performance.metric,
        value: performance.value,
        threshold: performance.threshold,
        timestamp: new Date().toISOString()
      }
    };

    await sendAdminNotification('performance_alert', notification);
  } catch (error) {
    logger.error('Error sending performance alert', { error, performance });
    throw error;
  }
}

/**
 * Get admin email addresses
 * @returns Array of admin email addresses
 */
function getAdminEmails(): string[] {
  const adminEmails = process.env['ADMIN_EMAILS'];
  
  if (!adminEmails) {
    return [];
  }

  return adminEmails.split(',').map(email => email.trim()).filter(email => email);
}

/**
 * Determine if notification should be sent based on severity
 * @param severity - Notification severity
 * @returns Whether to send notification
 */
function shouldSendNotification(severity: string): boolean {
  const minSeverity = process.env['ADMIN_NOTIFICATION_MIN_SEVERITY'] || 'medium';
  const severityLevels = ['low', 'medium', 'high', 'critical'];
  
  const minLevel = severityLevels.indexOf(minSeverity);
  const currentLevel = severityLevels.indexOf(severity);
  
  return currentLevel >= minLevel;
}

/**
 * Generate HTML email template
 * @param notification - Notification object
 * @returns HTML content
 */
function generateEmailTemplate(notification: AdminNotification): string {
  const severityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545'
  };

  const typeIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  const color = severityColors[notification.severity as keyof typeof severityColors] || '#6c757d';
  const icon = typeIcons[notification.type as keyof typeof typeIcons] || 'ℹ️';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${color}; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">${icon} ${notification.title}</h1>
      </div>
      <div style="padding: 30px; background: white;">
        <h2>System Notification</h2>
        <p><strong>Type:</strong> ${notification.type}</p>
        <p><strong>Severity:</strong> ${notification.severity}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr>
        <h3>Message:</h3>
        <p>${notification.message}</p>
        ${notification.metadata ? `
          <h3>Additional Information:</h3>
          <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto;">
            ${JSON.stringify(notification.metadata, null, 2)}
          </pre>
        ` : ''}
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
        <p>This is an automated notification from PawfectMatch Admin System</p>
        <p>© 2024 PawfectMatch. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Generate text email template
 * @param notification - Notification object
 * @returns Text content
 */
function generateTextTemplate(notification: AdminNotification): string {
  return `
    ${notification.title}
    
    Type: ${notification.type}
    Severity: ${notification.severity}
    Time: ${new Date().toISOString()}
    
    Message:
    ${notification.message}
    
    ${notification.metadata ? `
    Additional Information:
    ${JSON.stringify(notification.metadata, null, 2)}
    ` : ''}
    
    ---
    This is an automated notification from PawfectMatch Admin System
  `;
}

/**
 * Send bulk notifications
 * @param notifications - Array of notifications
 */
export async function sendBulkNotifications(notifications: AdminNotification[]): Promise<void> {
  try {
    const promises = notifications.map(notification => 
      sendAdminNotification('bulk_notification', notification)
    );

    await Promise.allSettled(promises);
    
    logger.info('Bulk notifications sent', { count: notifications.length });
  } catch (error) {
    logger.error('Error sending bulk notifications', { error, count: notifications.length });
    throw error;
  }
}

/**
 * Test admin notification system
 * @returns Success status
 */
export async function testAdminNotifications(): Promise<boolean> {
  try {
    await sendAdminNotification('test_notification', {
      message: 'This is a test notification to verify the admin notification system is working correctly.',
      timestamp: new Date().toISOString()
    });
    
    logger.info('Admin notification test completed successfully');
    return true;
  } catch (error) {
    logger.error('Admin notification test failed', { error });
    return false;
  }
}

export default {
  sendAdminNotification,
  sendCriticalAlert,
  sendHealthNotification,
  sendSecurityAlert,
  sendPerformanceAlert,
  sendBulkNotifications,
  testAdminNotifications,
};
