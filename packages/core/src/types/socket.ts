/**
 * Socket.io event types for real-time communication
 * Used across web, mobile and backend platforms
 */

import type { Message, Match } from './models';

// Socket event payloads
export interface UserTypingEvent {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageReadEvent {
  matchId: string;
  messageId: string;
  userId: string;
}

export interface NewMessageEvent extends Message {
  id: string;
}

export interface NewMatchEvent extends Match {
  id: string;
  petName: string;
}

export interface SocketErrorEvent {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface SocketResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Socket emit events
export interface JoinMatchRequest {
  matchId: string;
}

export interface LeaveMatchRequest {
  matchId: string;
}

export interface SendMessageRequest {
  matchId: string;
  message: string;
}

export interface MarkReadRequest {
  matchId: string;
  messageId: string;
}

export interface TypingRequest {
  matchId: string;
  isTyping: boolean;
}

// Socket connection events
export interface SocketConnectionInfo {
  id: string;
  connected: boolean;
  latency?: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

// Online users management
export interface OnlineUsersUpdate {
  users: string[];
  added?: string[];
  removed?: string[];
}

// User status events
export interface UserStatusEvent {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}
