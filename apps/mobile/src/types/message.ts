/**
 * Unified Message Type System
 * Provides type-safe conversion between mobile hook format and core package format
 */

import type { Message as CoreMessage, User, ReadReceipt } from '@pawfectmatch/core';

/**
 * Mobile hook Message format (simplified for UI)
 * Used by useChatData hook and most UI components
 */
export interface MobileMessage {
  _id: string;
  matchId?: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji' | 'voice' | 'file' | 'location';
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  error?: boolean;
  audioUrl?: string;
  duration?: number;
  replyTo?: { _id: string; author?: string; text?: string };
  deliveredAt?: string;
  readAt?: string;
  reactions?: Record<string, number>;
  attachment?: {
    type: 'image' | 'video' | 'file';
    url: string;
    name?: string;
    size?: number;
  };
  voiceNote?: {
    url: string;
    duration: number;
    waveform?: number[];
  };
}

/**
 * Enhanced Message with thread support
 */
export interface MessageWithReplies extends MobileMessage {
  replies: MobileMessage[];
}

/**
 * Convert core Message format to mobile Message format
 */
export function toMobileMessage(
  coreMsg: CoreMessage,
  currentUserId?: string,
): MobileMessage {
  const senderId =
    typeof coreMsg.sender === 'string'
      ? coreMsg.sender
      : coreMsg.sender?._id || coreMsg.sender?.id || 'unknown';

  const readBy = coreMsg.readBy || [];
  const isRead =
    currentUserId
      ? readBy.some((receipt) => {
          const userId = typeof receipt.user === 'string' ? receipt.user : receipt.user;
          return userId === currentUserId;
        })
      : readBy.length > 0;

  // Determine status from readBy array
  let status: MobileMessage['status'] = 'sent';
  if (isRead) {
    status = 'read';
  } else if (readBy.length > 0) {
    status = 'delivered';
  }

  // Map messageType to type
  const typeMap: Record<string, MobileMessage['type']> = {
    text: 'text',
    image: 'image',
    video: 'image', // Treat video as image for UI compatibility
    voice: 'voice',
    audio: 'voice',
    file: 'file',
    location: 'location',
    gif: 'image',
    sticker: 'image',
    emoji: 'emoji',
  };

  const type = typeMap[coreMsg.messageType] || 'text';

  // Convert replyTo
  let replyToObj: { _id: string; author?: string; text?: string } | undefined;
  if (coreMsg.replyTo) {
    const replyId =
      typeof coreMsg.replyTo === 'string' ? coreMsg.replyTo : coreMsg.replyTo._id;
    replyToObj = { _id: replyId };
    if (typeof coreMsg.replyTo === 'object' && coreMsg.replyTo.author) {
      replyToObj.author = coreMsg.replyTo.author;
    }
    if (typeof coreMsg.replyTo === 'object' && coreMsg.replyTo.text) {
      replyToObj.text = coreMsg.replyTo.text;
    }
  }

  const result: MobileMessage = {
    _id: coreMsg._id?.toString() || coreMsg._id,
    content: coreMsg.content,
    senderId,
    timestamp: coreMsg.sentAt || new Date().toISOString(),
    read: isRead,
    type,
    status,
    error: false,
    ...(coreMsg.duration !== undefined && { duration: coreMsg.duration }),
  };

  if (replyToObj) {
    result.replyTo = replyToObj;
  }

  // Extract deliveredAt and readAt from readBy
  const userReadReceipt = readBy.find((r) => {
    const userId = typeof r.user === 'string' ? r.user : r.user;
    return userId === currentUserId;
  });
  if (userReadReceipt?.readAt) {
    result.readAt = new Date(userReadReceipt.readAt).toISOString();
  }

  // Handle attachments
  if (coreMsg.attachments && coreMsg.attachments.length > 0) {
    const attachment = coreMsg.attachments[0];
    result.attachment = {
      type: (attachment.type as 'image' | 'video' | 'file') || 'file',
      url: attachment.url || '',
      ...(attachment.fileName && { name: attachment.fileName }),
      ...(attachment.fileSize && { size: attachment.fileSize }),
    };
  }

  return result;
}

/**
 * Convert mobile Message format to core Message format
 * Note: This is a partial conversion as mobile format lacks some core fields
 */
export function toCoreMessage(
  mobileMsg: MobileMessage,
  sender?: User,
): Partial<CoreMessage> {
  const messageTypeMap: Record<MobileMessage['type'], CoreMessage['messageType']> = {
    text: 'text',
    image: 'image',
    emoji: 'text', // Map emoji to text
    voice: 'voice',
    file: 'file',
    location: 'location',
  };

  return {
    _id: mobileMsg._id,
    content: mobileMsg.content,
    sender: sender || (mobileMsg.senderId as unknown as User),
    messageType: messageTypeMap[mobileMsg.type] || 'text',
    sentAt: mobileMsg.timestamp,
    readBy: mobileMsg.read
      ? [
          {
            userId: mobileMsg.senderId,
            readAt: mobileMsg.readAt || new Date().toISOString(),
          } as ReadReceipt,
        ]
      : [],
    duration: mobileMsg.duration,
    replyTo: mobileMsg.replyTo,
  };
}

/**
 * Type guard to check if message is in mobile format
 */
export function isMobileMessage(
  msg: CoreMessage | MobileMessage,
): msg is MobileMessage {
  return 'senderId' in msg && 'timestamp' in msg && 'type' in msg;
}

/**
 * Type guard to check if message is in core format
 */
export function isCoreMessage(
  msg: CoreMessage | MobileMessage,
): msg is CoreMessage {
  return 'sender' in msg && 'sentAt' in msg && 'messageType' in msg;
}

