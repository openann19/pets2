/**
 * MessageBubbleTypes
 * Type definitions for MessageBubble component and its sub-components
 */

import type { Message } from '@pawfectmatch/core';
import type { MessageStatus } from './MessageStatusTicks';

/**
 * Message with optional status field for UI display
 * Extends the core Message type with status information
 */
export type MessageWithStatus = Message & {
  status?: MessageStatus;
};
