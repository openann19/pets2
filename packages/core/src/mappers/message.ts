/**
 * Legacy message shape from web API responses
 */
export interface LegacyWebMessage {
  id: string;
  _id?: string;
  senderId?: string;
  matchId?: string;
  sender?: {
    id: string;
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    [key: string]: unknown;
  } | string;
  content: string;
  text?: string;
  message?: string;
  type?: string;
  messageType?: string;
  attachments?: Array<{
    type?: string;
    url: string;
    fileName?: string;
    fileType?: string;
  }>;
  readBy?: Array<{ user: string; readAt: string }>;
  timestamp?: string;
  sentAt?: string;
  createdAt?: string;
  editedAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  [key: string]: unknown;
}

/**
 * Convert legacy web message to core Message type
 */
import type { Message, User } from '../types';

export function toCoreMessage(legacy: LegacyWebMessage): Message {
  const messageId = legacy._id ?? legacy.id;
  const contentCandidate = [legacy.content, legacy.text, legacy.message].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );
  const content = contentCandidate ?? '';

  // Handle sender - could be string ID or object
  let sender: User;
  if (typeof legacy.sender === 'string' || legacy.sender === undefined) {
    // Create minimal user object
    const senderId = typeof legacy.sender === 'string' && legacy.sender.length > 0
      ? legacy.sender
      : legacy.senderId ?? messageId;
    const now = new Date().toISOString();
    sender = {
      _id: senderId,
      id: senderId, // Alias for _id
      email: '',
      firstName: 'User',
      lastName: '',
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      premium: {
        isActive: false,
        plan: 'basic',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
        },
      },
      profileComplete: false,
      subscriptionStatus: 'free',
      role: 'user',
      isEmailVerified: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
  } else {
    const senderObj = legacy.sender;
    const senderName = senderObj.name ?? 'User';
    const nameParts = senderName.split(' ');
    const firstName = nameParts[0] != null && nameParts[0].trim() !== '' ? nameParts[0] : 'User';
    const lastName = nameParts.slice(1).join(' ').trim();

    const now = new Date().toISOString();
    sender = {
      _id: senderObj._id ?? senderObj.id,
      id: senderObj.id,
      email: senderObj.email ?? '',
      firstName,
      lastName,
      ...(senderObj.avatar != null && senderObj.avatar.trim() !== '' ? { avatar: senderObj.avatar } : {}),
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
      premium: {
        isActive: false,
        plan: 'basic',
        features: {
          unlimitedLikes: false,
          boostProfile: false,
          seeWhoLiked: false,
          advancedFilters: false,
        },
      },
      profileComplete: false,
      subscriptionStatus: 'free',
      role: 'user',
      isEmailVerified: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Normalize message type
  const rawType = (legacy.messageType ?? legacy.type ?? 'text').toLowerCase();
  const validTypes: Array<NonNullable<Message['messageType']>> = ['text', 'image', 'voice', 'video', 'location', 'system'];
  const messageType = validTypes.includes(rawType as NonNullable<Message['messageType']>)
    ? (rawType as NonNullable<Message['messageType']>)
    : 'text';

  // Convert attachments
  const attachments = (legacy.attachments ?? []).map(att => {
    const fileName = att.fileName?.trim();
    const fileNameObj = fileName != null && fileName.length > 0 ? { fileName } : {};
    const resolvedFileType = att.fileType ?? att.type;
    return {
      type: att.type ?? att.fileType ?? 'file',
      url: att.url,
      ...fileNameObj,
      ...(resolvedFileType != null ? { fileType: resolvedFileType } : {}),
    };
  });

  const sentAt = legacy.sentAt ?? legacy.timestamp ?? legacy.createdAt ?? new Date().toISOString();
  const matchId = legacy.matchId ?? legacy.senderId ?? messageId;

  return {
    _id: messageId,
    sender,
    match: matchId,
    content,
    timestamp: sentAt,
    read: false,
    type: messageType,
    status: 'sent',
    messageType,
    ...(attachments.length > 0 ? { attachments } : {}),
    readBy: legacy.readBy ?? [],
    sentAt,
    ...(legacy.editedAt != null ? { editedAt: legacy.editedAt } : {}),
    isEdited: legacy.isEdited ?? false,
    isDeleted: legacy.isDeleted ?? false,
  };
}

/**
 * Convert array of legacy messages to core Message types
 */
export function toCoreMessages(legacyMessages: LegacyWebMessage[]): Message[] {
  return legacyMessages.map(toCoreMessage);
}
