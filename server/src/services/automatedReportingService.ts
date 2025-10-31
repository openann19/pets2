/**
 * Automated Reporting Service
 * Sends daily/weekly metric alerts and reports
 */

import logger from '../utils/logger';
import conversionFunnelService from './conversionFunnelService';
import cohortRetentionService from './cohortRetentionService';
import User from '../models/User';
import AdminActivityLog from '../models/AdminActivityLog';
import { sendNotificationEmail } from './emailService';
import configService from './configService';

interface MetricAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
}

interface ReportData {
  timestamp: Date;
  metrics: {
    revenue: {
      mrr: number;
      arpu: number;
      conversionRate: number;
      churnRate: number;
    };
    users: {
      total: number;
      active: number;
      new24h: number;
    };
    conversionFunnel: {
      overallConversionRate: number;
      paywallViews: number;
      premiumSubscribers: number;
    };
    retention: {
      week1: number;
      month1: number;
      month3: number;
    };
  };
  alerts: MetricAlert[];
}

class AutomatedReportingService {
  private async getAlertThresholds() {
    const config = await configService.getAnalyticsConfig();
    return config.alertThresholds;
  }

  /**
   * Generate daily report
   */
  async generateDailyReport(): Promise<ReportData> {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get revenue metrics
      const funnel = await conversionFunnelService.calculateFunnel(30);
      const retention = await cohortRetentionService.getCohortRetentionData(6);

      // Get user metrics
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({
        lastLoginAt: { $gte: yesterday }
      });
      const newUsers24h = await User.countDocuments({
        createdAt: { $gte: yesterday }
      });

      // Calculate MRR (simplified - would use Stripe in production)
      const premiumUsers = await User.countDocuments({
        'premium.isActive': true,
        $or: [
          { 'premium.expiresAt': { $exists: false } },
          { 'premium.expiresAt': null },
          { 'premium.expiresAt': { $gt: now } }
        ]
      });

      const estimatedMRR = premiumUsers * 9.99; // Average $9.99/month
      const estimatedARPU = premiumUsers > 0 ? estimatedMRR / premiumUsers : 0;

      const metrics = {
        revenue: {
          mrr: estimatedMRR,
          arpu: estimatedARPU,
          conversionRate: funnel.overallConversionRate,
          churnRate: 0 // Would calculate from cancellations
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          new24h: newUsers24h
        },
        conversionFunnel: {
          overallConversionRate: funnel.overallConversionRate,
          paywallViews: funnel.paywallViews,
          premiumSubscribers: funnel.premiumSubscribers
        },
        retention: {
          week1: retention.averageRetention.week1,
          month1: retention.averageRetention.month2,
          month3: retention.averageRetention.month3
        }
      };

      // Generate alerts
      const alerts = await this.generateAlerts(metrics);

      const report: ReportData = {
        timestamp: now,
        metrics,
        alerts
      };

      // Log report
      logger.info('Daily report generated', {
        metrics,
        alertCount: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length
      });

      return report;
    } catch (error) {
      logger.error('Error generating daily report', { error });
      throw error;
    }
  }

  /**
   * Generate weekly report
   */
  async generateWeeklyReport(): Promise<ReportData & { weekOverWeek: Record<string, number> }> {
    const dailyReport = await this.generateDailyReport();

    // Calculate week-over-week changes
    const weekOverWeek = {
      userGrowth: 0, // Would compare to previous week
      mrrGrowth: 0,
      conversionRateChange: 0
    };

    return {
      ...dailyReport,
      weekOverWeek
    };
  }

  /**
   * Generate alerts based on thresholds
   */
  private async generateAlerts(metrics: ReportData['metrics']): Promise<MetricAlert[]> {
    const thresholds = await this.getAlertThresholds();
    const alerts: MetricAlert[] = [];

    // Churn rate alert
    if (metrics.revenue.churnRate >= thresholds.churnRate.critical) {
      alerts.push({
        metric: 'churnRate',
        value: metrics.revenue.churnRate,
        threshold: thresholds.churnRate.critical,
        severity: 'critical',
        message: `Critical: Churn rate is ${metrics.revenue.churnRate.toFixed(1)}% (threshold: ${thresholds.churnRate.critical}%)`
      });
    } else if (metrics.revenue.churnRate >= thresholds.churnRate.warning) {
      alerts.push({
        metric: 'churnRate',
        value: metrics.revenue.churnRate,
        threshold: thresholds.churnRate.warning,
        severity: 'warning',
        message: `Warning: Churn rate is ${metrics.revenue.churnRate.toFixed(1)}% (threshold: ${thresholds.churnRate.warning}%)`
      });
    }

    // Conversion rate alert
    if (metrics.revenue.conversionRate <= thresholds.conversionRate.critical) {
      alerts.push({
        metric: 'conversionRate',
        value: metrics.revenue.conversionRate,
        threshold: thresholds.conversionRate.critical,
        severity: 'critical',
        message: `Critical: Conversion rate is ${metrics.revenue.conversionRate.toFixed(1)}% (below threshold: ${thresholds.conversionRate.critical}%)`
      });
    } else if (metrics.revenue.conversionRate <= thresholds.conversionRate.warning) {
      alerts.push({
        metric: 'conversionRate',
        value: metrics.revenue.conversionRate,
        threshold: thresholds.conversionRate.warning,
        severity: 'warning',
        message: `Warning: Conversion rate is ${metrics.revenue.conversionRate.toFixed(1)}% (below threshold: ${thresholds.conversionRate.warning}%)`
      });
    }

    // Retention alerts
    if (metrics.retention.week1 <= thresholds.retentionWeek1.critical) {
      alerts.push({
        metric: 'retentionWeek1',
        value: metrics.retention.week1,
        threshold: thresholds.retentionWeek1.critical,
        severity: 'critical',
        message: `Critical: Week 1 retention is ${metrics.retention.week1.toFixed(1)}% (below threshold: ${thresholds.retentionWeek1.critical}%)`
      });
    } else if (metrics.retention.week1 <= thresholds.retentionWeek1.warning) {
      alerts.push({
        metric: 'retentionWeek1',
        value: metrics.retention.week1,
        threshold: thresholds.retentionWeek1.warning,
        severity: 'warning',
        message: `Warning: Week 1 retention is ${metrics.retention.week1.toFixed(1)}% (below threshold: ${thresholds.retentionWeek1.warning}%)`
      });
    }

    return alerts;
  }

  /**
   * Send report via email/webhook
   */
  async sendReport(report: ReportData, recipients: string[]): Promise<void> {
    try {
      // Format report as HTML email
      const reportHtml = this.formatReportAsHTML(report);

      // Send to each recipient
      for (const email of recipients) {
        try {
          await sendNotificationEmail(
            email,
            `PawfectMatch ${report.timestamp.toLocaleDateString()} Analytics Report`,
            reportHtml
          );
          logger.info('Analytics report sent', { email });
        } catch (error) {
          logger.error('Failed to send report email', { email, error });
        }
      }

      // Log critical alerts to admin activity log
      const criticalAlerts = report.alerts.filter(a => a.severity === 'critical');
      if (criticalAlerts.length > 0) {
        await AdminActivityLog.create({
          adminId: 'system',
          action: 'METRIC_ALERT',
          details: {
            type: 'critical_metrics',
            alerts: criticalAlerts,
            timestamp: report.timestamp
          },
          createdAt: new Date()
        });
      }
    } catch (error) {
      logger.error('Error sending report', { error });
    }
  }

  /**
   * Format report data as HTML email
   */
  private formatReportAsHTML(report: ReportData): string {
    const { metrics, alerts } = report;

    const alertSection = alerts.length > 0
      ? `
        <h2 style="color: ${alerts.some(a => a.severity === 'critical') ? '#dc3545' : '#ffc107'}; margin-top: 30px;">
          ${alerts.filter(a => a.severity === 'critical').length} Critical Alert${alerts.filter(a => a.severity === 'critical').length !== 1 ? 's' : ''}
        </h2>
        <ul>
          ${alerts.map(alert => `
            <li style="margin: 10px 0; padding: 10px; background: ${alert.severity === 'critical' ? '#fff5f5' : '#fffbf0'}; border-left: 4px solid ${alert.severity === 'critical' ? '#dc3545' : '#ffc107'};">
              <strong>${alert.metric}:</strong> ${alert.message}
            </li>
          `).join('')}
        </ul>
      `
      : '<p style="color: #28a745; margin: 20px 0;">✅ No alerts - All metrics within normal thresholds</p>';

    return `
      <h1>📊 PawfectMatch Analytics Report</h1>
      <p><strong>Generated:</strong> ${report.timestamp.toLocaleString()}</p>

      <h2>💰 Revenue Metrics</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>MRR</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${metrics.revenue.mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>ARPU</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${metrics.revenue.arpu.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Conversion Rate</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.revenue.conversionRate.toFixed(2)}%</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Churn Rate</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.revenue.churnRate.toFixed(2)}%</td>
        </tr>
      </table>

      <h2>👥 User Metrics</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Users</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.users.total.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Active Users</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.users.active.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>New Users (24h)</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.users.new24h.toLocaleString()}</td>
        </tr>
      </table>

      <h2>🔄 Conversion & Retention</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Overall Conversion</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.conversionFunnel.overallConversionRate.toFixed(2)}%</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Paywall Views</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.conversionFunnel.paywallViews.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Premium Subscribers</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.conversionFunnel.premiumSubscribers.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Week 1 Retention</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.retention.week1.toFixed(1)}%</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Month 1 Retention</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${metrics.retention.month1.toFixed(1)}%</td>
        </tr>
      </table>

      ${alertSection}

      <p style="margin-top: 30px; color: #6c757d; font-size: 12px;">
        This is an automated report. For questions, contact the analytics team.
      </p>
    `;
  }

  /**
   * Schedule automated reports (call from cron job)
   */
  async scheduleDailyReport(): Promise<void> {
    try {
      const report = await this.generateDailyReport();

      // Get admin emails from configuration
      const config = await configService.getAnalyticsConfig();
      const adminEmails = config.reportEmails;

      if (adminEmails.length > 0) {
        await this.sendReport(report, adminEmails);
      } else {
        logger.warn('No admin emails configured. Configure report recipients in Analytics Configuration.');
      }

      // Also log to database for admin dashboard
      await AdminActivityLog.create({
        adminId: 'system',
        action: 'DAILY_REPORT_GENERATED',
        details: {
          metrics: report.metrics,
          alerts: report.alerts
        },
        createdAt: new Date()
      });
    } catch (error) {
      logger.error('Error in scheduled daily report', { error });
    }
  }

  /**
   * Schedule weekly report (call from cron job)
   */
  async scheduleWeeklyReport(): Promise<void> {
    try {
      const report = await this.generateWeeklyReport();

      const config = await configService.getAnalyticsConfig();
      const adminEmails = config.reportEmails;

      if (adminEmails.length > 0) {
        await this.sendReport(report, adminEmails);
      } else {
        logger.warn('No admin emails configured. Configure report recipients in Analytics Configuration.');
      }

      await AdminActivityLog.create({
        adminId: 'system',
        action: 'WEEKLY_REPORT_GENERATED',
        details: {
          metrics: report.metrics,
          alerts: report.alerts,
          weekOverWeek: report.weekOverWeek
        },
        createdAt: new Date()
      });
    } catch (error) {
      logger.error('Error in scheduled weekly report', { error });
    }
  }
}

export default new AutomatedReportingService();
