export {};// Added to mark file as a module
/**
 * Admin Notification Service
 * Sends notifications to administrators for critical system events
 */

const logger = require('../utils/logger');
const { sendEmail } = require('./emailService');

/**
 * Send admin notification
 * @param {Object} notification - Notification object
 * @param {string} notification.type - Type of notification (error, warning, info)
 * @param {string} notification.severity - Severity level (low, medium, high, critical)
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {Object} notification.metadata - Additional metadata
 */
async function sendAdminNotification(notification) {
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
    const emailContent = {
      to: adminEmails,
      subject: `[${severity.toUpperCase()}] ${title}`,
      html: generateEmailTemplate(notification),
      text: generateTextTemplate(notification)
    };

    // Send email notification
    await sendEmail(emailContent);

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
      error: error.message,
      stack: error.stack,
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
 */
function getAdminEmails() {
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
 */
function shouldSendNotification(severity) {
  const minSeverity = process.env.ADMIN_NOTIFICATION_MIN_SEVERITY || 'high';
  
  const severityLevels = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  return severityLevels[severity] >= severityLevels[minSeverity];
}

/**
 * Generate HTML email template
 */
function generateEmailTemplate(notification) {
  const {
    type,
    severity,
    title,
    message,
    metadata
  } = notification;

  const severityColors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545'
  };

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
 */
function generateTextTemplate(notification) {
  const {
    type,
    severity,
    title,
    message,
    metadata
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
 */
async function storeNotification(notification) {
  try {
    // Import here to avoid circular dependencies
    const AuditLog = require('../models/AuditLog');
    
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
      error: error.message,
      notification: notification.title
    });
    // Don't throw error here as notification was already sent
  }
}

/**
 * Send system health notification
 */
async function sendSystemHealthNotification(healthData) {
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
 */
async function sendSecurityAlert(alert) {
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
 */
async function sendPaymentFailureNotification(paymentData) {
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

module.exports = {
  sendAdminNotification,
  sendSystemHealthNotification,
  sendSecurityAlert,
  sendPaymentFailureNotification
};
