/**
 * Message Scheduling Service
 * Phase 2 Product Enhancement - Message Scheduling with timezone handling
 */

import ScheduledMessage from '../models/ScheduledMessage';
import Conversation from '../models/Conversation';
import logger from '../utils/logger';
import type { CreateScheduledMessageRequest, ScheduledMessage as ScheduledMessageType } from '@pawfectmatch/core/types/phase2-contracts';
import type { RichContent } from '@pawfectmatch/core/types/phase1-contracts';

/**
 * Convert local timezone datetime to UTC
 * Handles DST automatically using Intl API
 * @param dateTime ISO-8601 string (YYYY-MM-DDTHH:mm:ss) - local time in specified timezone
 * @param timezone IANA timezone identifier (e.g., 'America/New_York')
 */
function convertToUTC(dateTime: string, timezone: string): Date {
  try {
    // Parse date components (YYYY-MM-DDTHH:mm:ss)
    const match = dateTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    if (!match) {
      throw new Error('Invalid date format');
    }

    const [, year, month, day, hour, minute, second] = match;
    
    // Use Intl to create a date in the target timezone, then convert to UTC
    // Strategy: Create date components, format in UTC to find offset
    const testDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    
    // Get what this time would be in the target timezone
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Get what this same moment would be in UTC
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Calculate offset between timezone and UTC
    const utcParts = utcFormatter.formatToParts(testDate);
    const tzParts = tzFormatter.formatToParts(testDate);
    
    const hourUtc = parseInt(utcParts.find(p => p.type === 'hour')?.value || '0', 10);
    const hourTz = parseInt(tzParts.find(p => p.type === 'hour')?.value || '0', 10);
    const offsetHours = hourTz - hourUtc;
    
    // Create UTC date by adjusting
    const utcDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
    utcDate.setUTCHours(utcDate.getUTCHours() - offsetHours);
    
    return utcDate;
  } catch (error) {
    logger.error('Failed to convert timezone to UTC', { error, dateTime, timezone });
    // Fallback: if dateTime is already UTC (has 'Z' suffix), use as-is
    if (dateTime.endsWith('Z')) {
      return new Date(dateTime);
    }
    // Otherwise, try parsing as-is (assumes UTC)
    logger.warn('Assuming dateTime is UTC due to conversion error', { dateTime, timezone });
    return new Date(dateTime + 'Z');
  }
}

/**
 * Create a scheduled message
 */
export async function createScheduledMessage(
  userId: string,
  request: CreateScheduledMessageRequest
): Promise<ScheduledMessageType> {
  try {
    // Validate conversation exists
    const conversation = await Conversation.findById(request.convoId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Convert scheduledAt from timezone to UTC
    const scheduledAtUTC = convertToUTC(request.scheduledAt, request.tz);

    // Validate scheduled time is in the future
    const now = new Date();
    if (scheduledAtUTC <= now) {
      throw new Error('Scheduled time must be in the future');
    }

    // Create scheduled message
    const scheduledMessage = await ScheduledMessage.create({
      convoId: request.convoId,
      senderId: userId,
      body: request.body,
      scheduledAt: scheduledAtUTC,
      tz: request.tz,
      status: 'scheduled',
      attempts: 0,
    });

    logger.info('Scheduled message created', {
      id: scheduledMessage._id.toString(),
      userId,
      convoId: request.convoId,
      scheduledAt: scheduledAtUTC.toISOString(),
    });

    return {
      id: scheduledMessage._id.toString(),
      convoId: scheduledMessage.convoId,
      senderId: scheduledMessage.senderId,
      body: scheduledMessage.body as RichContent,
      scheduledAt: scheduledMessage.scheduledAt.toISOString(),
      tz: scheduledMessage.tz,
      status: scheduledMessage.status,
      createdAt: scheduledMessage.createdAt.toISOString(),
      updatedAt: scheduledMessage.updatedAt.toISOString(),
      attempts: scheduledMessage.attempts,
    };
  } catch (error) {
    logger.error('Failed to create scheduled message', { error, userId, request });
    throw error;
  }
}

/**
 * Get scheduled messages for a user
 */
export async function getScheduledMessages(
  userId: string,
  convoId?: string,
  status?: 'scheduled' | 'sent' | 'canceled' | 'failed'
): Promise<ScheduledMessageType[]> {
  try {
    interface ScheduledMessageQuery {
      senderId: string;
      convoId?: string;
      status?: 'scheduled' | 'sent' | 'canceled' | 'failed';
    }
    
    const query: ScheduledMessageQuery = { senderId: userId };
    if (convoId) {
      query.convoId = convoId;
    }
    if (status) {
      query.status = status;
    }

    const messages = await ScheduledMessage.find(query)
      .sort({ scheduledAt: 1 })
      .lean();

    return messages.map((msg) => ({
      id: msg._id.toString(),
      convoId: msg.convoId,
      senderId: msg.senderId,
      body: msg.body as RichContent,
      scheduledAt: msg.scheduledAt.toISOString(),
      tz: msg.tz,
      status: msg.status,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
      attempts: msg.attempts,
      error: msg.error,
    }));
  } catch (error) {
    logger.error('Failed to get scheduled messages', { error, userId });
    throw error;
  }
}

/**
 * Cancel a scheduled message
 */
export async function cancelScheduledMessage(
  userId: string,
  messageId: string
): Promise<void> {
  try {
    const message = await ScheduledMessage.findOne({
      _id: messageId,
      senderId: userId,
      status: 'scheduled',
    });

    if (!message) {
      throw new Error('Scheduled message not found or already processed');
    }

    message.status = 'canceled';
    await message.save();

    logger.info('Scheduled message canceled', { messageId, userId });
  } catch (error) {
    logger.error('Failed to cancel scheduled message', { error, userId, messageId });
    throw error;
  }
}

/**
 * Process scheduled messages (called by cron job)
 * Sends messages that are due (±30s tolerance)
 */
export async function processScheduledMessages(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  try {
    const now = new Date();
    const toleranceMs = 30000; // 30 seconds
    const windowStart = new Date(now.getTime() - toleranceMs);
    const windowEnd = new Date(now.getTime() + toleranceMs);

    // Find messages due to be sent
    const dueMessages = await ScheduledMessage.find({
      status: 'scheduled',
      scheduledAt: {
        $gte: windowStart,
        $lte: windowEnd,
      },
    }).lean();

    let sent = 0;
    let failed = 0;

    for (const msg of dueMessages as Array<typeof dueMessages[0] & { body: { text?: string; attachments?: Array<{ url: string }> } }>) {
      try {
        // Get conversation
        const conversation = await Conversation.findById(msg.convoId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }

        // Send message
        const attachments = (msg.body.attachments || []).map((a: { url: string }) => a.url);
        await conversation.addMessage(msg.senderId, msg.body.text || '', attachments);

        // Update status
        await ScheduledMessage.updateOne(
          { _id: msg._id },
          {
            status: 'sent',
            updatedAt: new Date(),
          }
        );

        sent++;
      } catch (error) {
        const attempts = (msg.attempts || 0) + 1;
        const maxAttempts = 3;

        if (attempts >= maxAttempts) {
          // Mark as failed after max retries
          await ScheduledMessage.updateOne(
            { _id: msg._id },
            {
              status: 'failed',
              attempts,
              error: error instanceof Error ? error.message : 'Unknown error',
              updatedAt: new Date(),
            }
          );
          failed++;
        } else {
          // Retry later (will be picked up in next cron run)
          await ScheduledMessage.updateOne(
            { _id: msg._id },
            {
              attempts,
              error: error instanceof Error ? error.message : 'Unknown error',
              updatedAt: new Date(),
            }
          );
        }

        logger.error('Failed to send scheduled message', {
          messageId: msg._id.toString(),
          error,
          attempts,
        });
      }
    }

    logger.info('Processed scheduled messages', { processed: dueMessages.length, sent, failed });

    return {
      processed: dueMessages.length,
      sent,
      failed,
    };
  } catch (error) {
    logger.error('Failed to process scheduled messages', { error });
    throw error;
  }
}

