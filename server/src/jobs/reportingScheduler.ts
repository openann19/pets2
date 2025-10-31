/**
 * Reporting Scheduler
 * Cron jobs for automated daily/weekly reports
 */

import logger from '../utils/logger';
import automatedReportingService from '../services/automatedReportingService';
import abTestingService from '../services/abTestingService';

/**
 * Initialize A/B tests on startup
 */
export function initializeABTests(): void {
  try {
    abTestingService.initializeDefaultTests();
    logger.info('A/B testing service initialized');
  } catch (error) {
    logger.error('Failed to initialize A/B tests', { error });
  }
}

/**
 * Schedule daily reports (runs at 9 AM UTC)
 */
export async function scheduleDailyReports(): Promise<void> {
  try {
    const cron = await import('node-cron');
    
    cron.default.schedule('0 9 * * *', async () => {
      logger.info('Starting scheduled daily report');
      try {
        await automatedReportingService.scheduleDailyReport();
        logger.info('Daily report completed successfully');
      } catch (error) {
        logger.error('Daily report failed', { error });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    logger.info('✅ Daily reporting scheduled (9 AM UTC)');
  } catch (error) {
    logger.warn('⚠️ node-cron not installed, daily reporting disabled');
    logger.warn('Install with: pnpm add node-cron && pnpm add -D @types/node-cron');
  }
}

/**
 * Schedule weekly reports (runs Monday at 9 AM UTC)
 */
export async function scheduleWeeklyReports(): Promise<void> {
  try {
    const cron = await import('node-cron');
    
    cron.default.schedule('0 9 * * 1', async () => {
      logger.info('Starting scheduled weekly report');
      try {
        await automatedReportingService.scheduleWeeklyReport();
        logger.info('Weekly report completed successfully');
      } catch (error) {
        logger.error('Weekly report failed', { error });
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    logger.info('✅ Weekly reporting scheduled (Monday 9 AM UTC)');
  } catch (error) {
    logger.warn('⚠️ node-cron not installed, weekly reporting disabled');
  }
}

/**
 * Initialize all scheduled jobs
 */
export async function initializeReportingScheduler(): Promise<void> {
  initializeABTests();
  await scheduleDailyReports();
  await scheduleWeeklyReports();
  logger.info('📊 Reporting scheduler initialized');
}
