/**
 * Message Scheduling Cron Job
 * Processes scheduled messages every minute
 */

import { processScheduledMessages } from '../services/messageSchedulingService';
import logger from '../utils/logger';

/**
 * Initialize scheduled message processing cron job
 * Runs every minute to check for messages due to be sent
 */
export async function initializeScheduledMessageJob(): Promise<void> {
  try {
    const cron = await import('node-cron');
    
    // Run every minute
    cron.default.schedule('* * * * *', async () => {
      logger.debug('Processing scheduled messages');
      try {
        const result = await processScheduledMessages();
        if (result.processed > 0) {
          logger.info('Scheduled messages processed', result);
        }
      } catch (error) {
        logger.error('Failed to process scheduled messages', { error });
      }
    }, {
      scheduled: true,
      timezone: 'UTC',
    });

    logger.info('✅ Scheduled message processing job initialized (runs every minute)');
  } catch (error) {
    logger.warn('⚠️ node-cron not installed, scheduled message processing disabled');
    logger.warn('Install with: pnpm add node-cron && pnpm add -D @types/node-cron');
  }
}

/**
 * Initialize translation cache cleanup job
 * Runs daily at 2 AM UTC to clean up expired translations
 */
export async function initializeTranslationCleanupJob(): Promise<void> {
  try {
    const cron = await import('node-cron');
    const { cleanupExpiredTranslations } = await import('../services/translationService');
    
    // Run daily at 2 AM UTC
    cron.default.schedule('0 2 * * *', async () => {
      logger.info('Starting translation cache cleanup');
      try {
        const deleted = await cleanupExpiredTranslations();
        logger.info('Translation cache cleanup completed', { deleted });
      } catch (error) {
        logger.error('Translation cache cleanup failed', { error });
      }
    }, {
      scheduled: true,
      timezone: 'UTC',
    });

    logger.info('✅ Translation cache cleanup job initialized (runs daily at 2 AM UTC)');
  } catch (error) {
    logger.warn('⚠️ node-cron not installed, translation cleanup disabled');
  }
}

