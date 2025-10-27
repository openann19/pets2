/**
 * Socket.io event types for type-safe event handling
 */

/**
 * Client to server events
 */
export interface ClientToServerEvents {
  // Map/Discovery events
  'location:update': (data: { latitude: number; longitude: number }) => void;
  'nearby:request': (data: { latitude: number; longitude: number; radius?: number }) => void;
  'map:subscribe': () => void;
  'map:unsubscribe': () => void;

  // Matching events
  'match:like': (data: { petId: string }) => void;
  'match:pass': (data: { petId: string }) => void;
  'match:superlike': (data: { petId: string }) => void;

  // Chat events
  'chat:join': (data: { conversationId: string }) => void;
  'chat:leave': (data: { conversationId: string }) => void;
  'chat:message': (data: { conversationId: string; text: string; attachments?: string[] }) => void;
  'chat:typing': (data: { conversationId: string; isTyping: boolean }) => void;
  'chat:read': (data: { conversationId: string; messageId: string }) => void;

  // Voice/video events
  'webrtc:offer': (data: { conversationId: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer': (data: { conversationId: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice-candidate': (data: { conversationId: string; candidate: RTCIceCandidate }) => void;
  'webrtc:end-call': (data: { conversationId: string }) => void;

  // Pulse/heartbeat
  'pulse:ping': () => void;

  // Suggestions
  'suggestions:request': (data: { petId: string }) => void;

  // Admin events
  'admin:subscribe': () => void;
  'admin:unsubscribe': () => void;
}

/**
 * Server to client events
 */
export interface ServerToClientEvents {
  // Map/Discovery events
  'location:updated': (data: { success: boolean }) => void;
  'nearby:results': (data: { pets: unknown[]; count: number }) => void;
  'map:ready': () => void;

  // Matching events
  'match:liked': (data: { matchId: string; matchedUser: unknown }) => void;
  'match:pass': () => void;

  // Chat events
  'chat:joined': (data: { conversationId: string }) => void;
  'chat:left': (data: { conversationId: string }) => void;
  'chat:message': (data: { message: unknown }) => void;
  'chat:typing': (data: { userId: string; isTyping: boolean }) => void;
  'chat:read': (data: { messageId: string; readAt: Date }) => void;
  'chat:error': (data: { error: string }) => void;

  // Voice/video events
  'webrtc:offer': (data: { from: string; offer: RTCSessionDescriptionInit }) => void;
  'webrtc:answer': (data: { from: string; answer: RTCSessionDescriptionInit }) => void;
  'webrtc:ice-candidate': (data: { from: string; candidate: RTCIceCandidate }) => void;
  'webrtc:call-ended': () => void;

  // Suggestions
  'suggestions:results': (data: { suggestions: unknown[] }) => void;

  // Admin events
  'admin:activity': (data: { type: string; data: unknown }) => void;
  'admin:notification': (data: { message: string; severity: 'info' | 'warning' | 'error' }) => void;

  // System events
  'system:error': (data: { error: string }) => void;
  'system:message': (data: { message: string }) => void;
}

/**
 * Inter-server events
 */
export interface InterServerEvents {
  'ping': () => void;
}

/**
 * Socket data (authentication, etc.)
 */
export interface SocketData {
  userId?: string;
  user?: unknown;
  role?: string;
  isAuthenticated: boolean;
}

