/**
 * Offline Message Queue Service
 * Queues messages when offline and syncs when connection is restored
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import NetInfo from '@react-native-community/netinfo';

export interface QueuedMessage {
  id: string;
  matchId: string;
  content: string;
  messageType?: string;
  attachments?: unknown[];
  replyTo?: string;
  timestamp: number;
  retries: number;
  status: 'pending' | 'sending' | 'failed';
}

const QUEUE_STORAGE_KEY = '@pawfectmatch:offline_message_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

class OfflineMessageQueue {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private retryTimeout: NodeJS.Timeout | null = null;
  private sendMessageHandler: ((message: QueuedMessage) => Promise<void>) | null = null;
  private networkStateListener: ((isConnected: boolean) => void) | null = null;

  constructor() {
    this.loadQueue();
    this.setupNetworkListener();
  }

  /**
   * Setup network state listener
   */
  private setupNetworkListener(): void {
    this.networkStateListener = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      logger.info('Network state changed', { isConnected });
      
      if (isConnected && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        logger.info('Loaded offline message queue', { count: this.queue.length });
      }
    } catch (error) {
      logger.error('Failed to load offline message queue', { error });
      this.queue = [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      logger.error('Failed to save offline message queue', { error });
    }
  }

  /**
   * Add message to queue
   */
  async enqueue(message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    this.queue.push(queuedMessage);
    await this.saveQueue();

    logger.info('Message queued', { messageId: queuedMessage.id, matchId: message.matchId });

    // Check network status and process if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      this.processQueue();
    }

    return queuedMessage.id;
  }

  /**
   * Remove message from queue (after successful send)
   */
  async dequeue(messageId: string): Promise<void> {
    this.queue = this.queue.filter((msg) => msg.id !== messageId);
    await this.saveQueue();
    logger.info('Message dequeued', { messageId });
  }

  /**
   * Mark message as failed
   */
  async markFailed(messageId: string): Promise<void> {
    const message = this.queue.find((msg) => msg.id === messageId);
    if (message) {
      message.status = 'failed';
      message.retries++;
      await this.saveQueue();

      // Retry if retries haven't exceeded max
      if (message.retries < MAX_RETRIES) {
        this.scheduleRetry(message);
      } else {
        logger.warn('Message failed after max retries', { messageId, retries: message.retries });
      }
    }
  }

  /**
   * Schedule retry for failed message
   */
  private scheduleRetry(message: QueuedMessage): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.retryTimeout = setTimeout(() => {
      message.status = 'pending';
      this.processQueue();
    }, RETRY_DELAY * message.retries); // Exponential backoff
  }

  /**
   * Process queue (send pending messages)
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      logger.debug('Cannot process queue - offline');
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    logger.info('Processing offline message queue', { count: this.queue.length });

    const pendingMessages = this.queue.filter((msg) => msg.status === 'pending' || msg.status === 'failed');

    for (const message of pendingMessages) {
      if (!this.sendMessageHandler) {
        logger.warn('No send message handler registered');
        break;
      }

      try {
        message.status = 'sending';
        await this.saveQueue();

        await this.sendMessageHandler(message);
        await this.dequeue(message.id);
        logger.info('Queued message sent successfully', { messageId: message.id });
      } catch (error) {
        logger.error('Failed to send queued message', { error, messageId: message.id });
        await this.markFailed(message.id);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Register handler for sending messages
   */
  setSendHandler(handler: (message: QueuedMessage) => Promise<void>): void {
    this.sendMessageHandler = handler;
    logger.info('Send message handler registered');
  }

  /**
   * Get all queued messages
   */
  getQueue(): QueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Get queued messages for a specific match
   */
  getQueueForMatch(matchId: string): QueuedMessage[] {
    return this.queue.filter((msg) => msg.matchId === matchId);
  }

  /**
   * Clear all messages from queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    logger.info('Message queue cleared');
  }

  /**
   * Cleanup old messages (older than 7 days)
   */
  async cleanupOldMessages(): Promise<void> {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const initialLength = this.queue.length;
    
    this.queue = this.queue.filter((msg) => {
      // Keep failed messages for manual retry
      if (msg.status === 'failed') {
        return true;
      }
      return msg.timestamp > sevenDaysAgo;
    });

    if (this.queue.length < initialLength) {
      await this.saveQueue();
      logger.info('Cleaned up old messages', { removed: initialLength - this.queue.length });
    }
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    if (this.networkStateListener) {
      this.networkStateListener();
    }
    this.sendMessageHandler = null;
  }
}

// Singleton instance
export const offlineMessageQueue = new OfflineMessageQueue();

// Cleanup on app start
offlineMessageQueue.cleanupOldMessages().catch((error) => {
  logger.error('Failed to cleanup old messages', { error });
});

