/**
 * Support Screen Types
 * Type definitions for admin support chat management
 */

export interface SupportChat {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
}

export type SupportChatFilter = 'all' | 'open' | 'closed' | 'pending';

