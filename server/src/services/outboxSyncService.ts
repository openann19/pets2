/**
 * Offline Outbox Sync Service
 * Phase 2 Product Enhancement - Offline message sync
 * Handles syncing messages queued while offline
 */

import Conversation from '../models/Conversation';
import logger from '../utils/logger';
import type {
  OutboxSyncRequest,
  OutboxSyncResponse,
  OutboxItem,
} from '@pawfectmatch/core/types/phase2-contracts';

/**
 * Sync outbox items (messages queued while offline)
 */
export async function syncOutbox(
  userId: string,
  request: OutboxSyncRequest
): Promise<OutboxSyncResponse> {
  try {
    const results: Array<{ id: string; status: 'sent' | 'failed'; error?: string }> = [];
    let synced = 0;
    let failed = 0;

    // Process items in order (FIFO)
    const sortedItems = request.items.sort((a, b) => a.timestamp - b.timestamp);

    for (const item of sortedItems) {
      try {
        // Find conversation
        const conversation = await Conversation.findById(item.matchId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }

        // Verify user is a participant
        if (!conversation.participants.includes(userId)) {
          throw new Error('Unauthorized: user not in conversation');
        }

        // Send message
        const attachments = item.attachments?.map((a) => a.url) || [];
        await conversation.addMessage(
          userId,
          item.content,
          attachments
        );

        results.push({
          id: item.id,
          status: 'sent',
        });
        synced++;
      } catch (error) {
        logger.error('Failed to sync outbox item', {
          error,
          userId,
          itemId: item.id,
        });

        results.push({
          id: item.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failed++;
      }
    }

    logger.info('Outbox sync completed', {
      userId,
      total: request.items.length,
      synced,
      failed,
    });

    return {
      success: true,
      synced,
      failed,
      results,
    };
  } catch (error) {
    logger.error('Failed to sync outbox', { error, userId });
    throw error;
  }
}

