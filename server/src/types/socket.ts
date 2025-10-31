/**
 * Socket.IO Type Definitions
 * 
 * Provides proper TypeScript types for Socket.IO server and client interactions
 */

import type { Server as HTTPServer } from 'http';
import type { Server, Socket } from 'socket.io';

// Re-export Socket.IO types
export type { Server, Socket } from 'socket.io';
export type SocketIOServer = Server; // For backward compatibility
export type HTTPServerType = HTTPServer;

/**
 * Extended Socket interface with user data
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

/**
 * Map Socket Event Data Types
 */
export interface JoinMapData {
  userId: string;
}

export interface LeaveMapData {
  userId: string;
}

export interface LocationUpdateData {
  userId?: string;
  petId?: string;
  latitude: number;
  longitude: number;
  activity?: string;
  message?: string;
}

export interface RequestInitialPinsData {
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  userId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
  timeRange?: 'last_hour' | 'today' | 'this_week' | 'this_month' | 'all';
  activityTypes?: string[];
}

export interface ActivityStartData {
  userId: string;
  petId?: string;
  activity: string;
  location: {
    latitude: number;
    longitude: number;
  };
  message?: string;
}

export interface ActivityEndData {
  userId: string;
  activityId?: string;
  pinId?: string;
}

export interface NearbyRequestData {
  userId: string;
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface MatchNotifyData {
  userId: string;
  matchId: string;
  targetUserId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  message?: string;
}

/**
 * Map Pin Types
 */
export interface MapPin {
  _id: string;
  petId: string;
  ownerId: string;
  coordinates: [number, number]; // [longitude, latitude]
  activity: string;
  activityCategory: string;
  message?: string | null;
  createdAt: string;
  timestamp: string;
  expiresAt: string;
}

export interface UserSession {
  socketId: string;
  lastSeen: Date;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface ActivityCount {
  walking: number;
  playing: number;
  feeding: number;
  resting: number;
  training: number;
  grooming: number;
  vet: number;
  park: number;
  other: number;
}

/**
 * WebRTC Socket Types
 */
export interface WebRTCSignalData {
  to: string;
  from: string;
  signal: unknown; // RTCSessionDescription or RTCIceCandidate
  type: 'offer' | 'answer' | 'ice-candidate';
}

export interface WebRTCJoinRoomData {
  roomId: string;
  userId: string;
}

export interface WebRTCCallData {
  callId: string;
  matchId: string;
  callerId: string;
  callerName?: string;
  callType: 'audio' | 'video';
}

export interface WebRTCAnswerData {
  callId: string;
  matchId: string;
  answer: boolean;
}

export interface WebRTCRejectData {
  callId: string;
  reason?: string;
}

export interface WebRTCSignalOfferData {
  callId: string;
  signal: unknown;
}

export interface WebRTCSignalAnswerData {
  callId: string;
  signal: unknown;
}

export interface WebRTCIceCandidateData {
  callId: string;
  candidate: unknown;
}

export interface WebRTCCallEndData {
  callId: string;
  reason?: string;
}

export interface WebRTCActiveCall {
  callerId: string;
  calleeId: string;
  matchId: string;
  callType: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'answered';
  startTime: number;
  answeredTime?: number;
}

/**
 * Live Socket Types
 */
export interface LiveSocketUser {
  id: string;
  socketId: string;
  isOwner?: boolean;
}

export interface LiveMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  reactions?: Array<{ emoji: string; count: number }>;
}

export interface Gift {
  id: string;
  userId: string;
  giftType: string;
  count: number;
  timestamp: Date;
}

/**
 * Pulse Socket Types
 */
export interface PulsePin {
  id: string;
  userId: string;
  petId?: string;
  coordinates: [number, number];
  activity: string;
  message?: string;
  timestamp: Date;
  expiresAt: Date;
}

/**
 * Suggestions Socket Types
 */
export interface SuggestionEvent {
  matchId: string;
  suggestionType: string;
  data: unknown;
}

/**
 * Socket Event Handlers
 */
export type SocketEventHandler<T = unknown> = (data: T) => void | Promise<void>;
export type SocketErrorHandler = (error: Error) => void;

