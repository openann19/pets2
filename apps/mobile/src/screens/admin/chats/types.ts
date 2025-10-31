/**
 * Types for Admin Chats Screen
 */

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  flagged: boolean;
  flagReason?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: 'approved' | 'removed' | 'warned';
}

export type ChatFilter = 'all' | 'flagged' | 'unreviewed';

