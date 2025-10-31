/**
 * Offline Outbox Sync Service (Mobile)
 * Phase 2 Product Enhancement - Offline message sync
 */

import type {
  OutboxItem,
  OutboxSyncRequest,
  OutboxSyncResponse,
} from '@pawfectmatch/core/types/phase2-contracts';
import { api } from './api';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OUTBOX_STORAGE_KEY = '@pawfectmatch:outbox';

class OutboxSyncService {
  /**
   * Queue a message for offline sending
   */
  async queueMessage(item: Omit<OutboxItem, 'id' | 'timestamp' | 'status' | 'retries'>): Promise<string> {
    try {
      const id = `outbox_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const outboxItem: OutboxItem = {
        ...item,
        id,
        timestamp: Date.now(),
        status: 'queued',
        retries: 0,
      };

      // Get existing queue
      const existing = await AsyncStorage.getItem(OUTBOX_STORAGE_KEY);
      const queue: OutboxItem[] = existing ? JSON.parse(existing) : [];

      // Add new item
      queue.push(outboxItem);

      // Save back
      await AsyncStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(queue));

      logger.debug('Message queued for offline sync', { id, matchId: item.matchId });
      return id;
    } catch (error) {
      logger.error('Failed to queue message', { error });
      throw error;
    }
  }

  /**
   * Get queued messages
   */
  async getQueuedMessages(): Promise<OutboxItem[]> {
    try {
      const existing = await AsyncStorage.getItem(OUTBOX_STORAGE_KEY);
      if (!existing) return [];

      const queue: OutboxItem[] = JSON.parse(existing);
      return queue.filter(item => item.status === 'queued' || item.status === 'failed');
    } catch (error) {
      logger.error('Failed to get queued messages', { error });
      return [];
    }
  }

  /**
   * Sync queued messages with server
   */
  async syncQueuedMessages(): Promise<OutboxSyncResponse> {
    try {
      const queued = await this.getQueuedMessages();

      if (queued.length === 0) {
        return {
          success: true,
          synced: 0,
          failed: 0,
          results: [],
        };
      }

      // Update status to sending
      await this.updateItemsStatus(
        queued.map(item => item.id),
        'sending'
      );

      // Send to server
      const response = await api.request<OutboxSyncResponse>(
        '/chat/outbox/sync',
        {
          method: 'POST',
          body: JSON.stringify({ items: queued }),
        }
      );

      if (!response.success) {
        // Revert status on failure
        await this.updateItemsStatus(
          queued.map(item => item.id),
          'queued'
        );
        throw new Error(response.error || 'Failed to sync outbox');
      }

      // Update local storage based on results
      const existing = await AsyncStorage.getItem(OUTBOX_STORAGE_KEY);
      const queue: OutboxItem[] = existing ? JSON.parse(existing) : [];

      for (const result of response.results) {
        const index = queue.findIndex(item => item.id === result.id);
        if (index >= 0) {
          if (result.status === 'sent') {
            // Remove from queue
            queue.splice(index, 1);
          } else {
            // Update status to failed
            queue[index].status = 'failed';
            queue[index].retries = (queue[index].retries || 0) + 1;
            queue[index].error = result.error;
          }
        }
      }

      await AsyncStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(queue));

      logger.info('Outbox sync completed', {
        synced: response.synced,
        failed: response.failed,
      });

      return response;
    } catch (error) {
      logger.error('Failed to sync outbox', { error });
      throw error;
    }
  }

  /**
   * Update status of items in local storage
   */
  private async updateItemsStatus(ids: string[], status: OutboxItem['status']): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(OUTBOX_STORAGE_KEY);
      if (!existing) return;

      const queue: OutboxItem[] = JSON.parse(existing);
      for (const item of queue) {
        if (ids.includes(item.id)) {
          item.status = status;
        }
      }

      await AsyncStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      logger.error('Failed to update items status', { error });
    }
  }

  /**
   * Clear sent messages from queue
   */
  async clearSentMessages(): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(OUTBOX_STORAGE_KEY);
      if (!existing) return;

      const queue: OutboxItem[] = JSON.parse(existing);
      const filtered = queue.filter(item => item.status !== 'sent');

      await AsyncStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logger.error('Failed to clear sent messages', { error });
    }
  }
}

export const outboxSyncService = new OutboxSyncService();
export default outboxSyncService;

