/**
 * Enhanced API Client with WebSocket Support
 * Production-ready with full type safety
 */
import api from '../services/api';
import { logger } from '@pawfectmatch/core';
import { io, type Socket } from 'socket.io-client';
import { isBrowser, getSafeWindow } from '@pawfectmatch/core/utils/env';

interface SocketEventData {
  matchId?: string;
  userId?: string;
  userName?: string;
  isTyping?: boolean;
  [key: string]: unknown;
}

interface SocketRegisterResponse {
  error?: string;
  success?: boolean;
}

// WebSocket connection management
class WebSocketManager {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly reconnectDelay = 1000;
  private isConnecting = false;

  connect(userId: string, token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }
      if (this.socket?.connected && this.userId === userId) {
        resolve(this.socket);
        return;
      }
      this.isConnecting = true;
      this.userId = userId;
      // Clean up existing connection
      if (this.socket) {
        this.socket.disconnect();
      }
      const socketUrl = process.env['NEXT_PUBLIC_API_URL']?.replace('/api', '') || 'http://localhost:5001';
      logger.info('[WebSocket] Connecting to:', { socketUrl });
      // SECURITY: Tokens are in httpOnly cookies, automatically sent with Socket.IO handshake
      // Socket.IO will send cookies automatically if CORS credentials: true is set (already configured)
      // Server reads token from cookies - see server/src/services/chatSocket.ts
      this.socket = io(socketUrl, {
        // Note: auth.token is optional - server will read from httpOnly cookies if not provided
        // For backwards compatibility, we can still accept token if provided (e.g., dev mode)
        ...(token ? { auth: { token } } : {}),
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
        upgrade: true,
        rememberUpgrade: true,
        // Socket.IO automatically sends cookies if same-origin or CORS credentials enabled
        // No explicit credentials option needed for Socket.IO client
      });
      const socket = this.socket;
      // Connection success handler
      socket.on('connect', () => {
        logger.info('[WebSocket] Connected successfully', { id: socket.id, userId });
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        // Join user's personal room for notifications
        socket.emit('join_user_room', { userId });
        resolve(socket);
      });
      // Connection error handler
      socket.on('connect_error', (error: Error) => {
        logger.error('[WebSocket] Connection error:', { error });
        this.isConnecting = false;
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
        }
      });
      // Disconnect handler
      socket.on('disconnect', (reason: string) => {
        logger.info('[WebSocket] Disconnected:', { reason });
        this.isConnecting = false;
      });
      // Reconnect handler - re-register user on reconnect
      socket.on('reconnect', (attemptNumber: number) => {
        logger.info('[WebSocket] Reconnected after', { attemptNumber, userId });
        this.reconnectAttempts = 0;
        // Re-register user after reconnection
        if (userId && socket.connected) {
          socket.emit('join_user_room', { userId });
          logger.info('[WebSocket] Re-registered user after reconnect:', { userId });
        }
      });
      // Error handler
      socket.on('error', (error: Error) => {
        logger.error('[WebSocket] Socket error:', { error });
      });
      // Set up common event listeners
      this.setupEventListeners(socket);
    });
  }

  private setupEventListeners(socket: Socket): void {
    // Handle new messages
    socket.on('new_message', (data: SocketEventData) => {
      logger.info('[WebSocket] New message received:', { data });
      // Dispatch custom event for components to listen to
      const win = getSafeWindow();
      if (win) {
        win.dispatchEvent(new CustomEvent('websocket:new_message', { detail: data }));
      }
    });
    // Handle user online/offline status
    socket.on('user_online', (data: SocketEventData) => {
      logger.info('[WebSocket] User online:', { data });
      const win = getSafeWindow();
      if (win) {
        win.dispatchEvent(new CustomEvent('websocket:user_online', { detail: data }));
      }
    });
    socket.on('user_offline', (data: SocketEventData) => {
      logger.info('[WebSocket] User offline:', { data });
      const win = getSafeWindow();
      if (win) {
        win.dispatchEvent(new CustomEvent('websocket:user_offline', { detail: data }));
      }
    });
    // Handle typing indicators
    socket.on('user_typing', (data: SocketEventData) => {
      logger.info('[WebSocket] User typing:', { data });
      const win = getSafeWindow();
      if (win) {
        win.dispatchEvent(new CustomEvent('websocket:user_typing', { detail: data }));
      }
    });
    // Handle notifications
    socket.on('notification', (data: SocketEventData) => {
      logger.info('[WebSocket] Notification received:', { data });
      const win = getSafeWindow();
      if (win) {
        win.dispatchEvent(new CustomEvent('websocket:notification', { detail: data }));
      }
    });
    // Handle match events
    socket.on('new_match', (data: SocketEventData) => {
      logger.info('[WebSocket] New match:', { data });
      const win = getSafeWindow();
      if (win) {
        win.dispatchEvent(new CustomEvent('websocket:new_match', { detail: data }));
      }
    });
    // Handle message read receipts
    socket.on('messages_read', (data: SocketEventData) => {
      logger.info('[WebSocket] Messages read:', { data });
      const win = getSafeWindow();
      if (win) {
        win.dispatchEvent(new CustomEvent('websocket:messages_read', { detail: data }));
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      logger.info('[WebSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Join a match room for real-time chat
  joinMatch(matchId: string): void {
    if (this.socket?.connected) {
      logger.info('[WebSocket] Joining match room:', { matchId });
      this.socket.emit('join_match', matchId);
    }
  }

  // Leave a match room
  leaveMatch(matchId: string): void {
    if (this.socket?.connected) {
      logger.info('[WebSocket] Leaving match room:', { matchId });
      this.socket.emit('leave_match', matchId);
    }
  }

  // Send a message in a match
  sendMessage(matchId: string, content: string, messageType = 'text', attachments: unknown[] = []): void {
    if (this.socket?.connected) {
      logger.info('[WebSocket] Sending message to match:', { matchId });
      this.socket.emit('send_message', {
        matchId,
        content,
        messageType,
        attachments
      });
    }
  }

  // Send typing indicator
  sendTyping(matchId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', { matchId, isTyping });
    }
  }

  // Mark messages as read
  markMessagesRead(matchId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_messages_read', { matchId });
    }
  }

  // Perform match actions (archive, block, etc.)
  performMatchAction(matchId: string, action: string): void {
    if (this.socket?.connected) {
      this.socket.emit('match_action', { matchId, action });
    }
  }
}

// Create singleton instance
const webSocketManager = new WebSocketManager();

// Enhanced API client with real WebSocket implementation
const apiClient = {
  ...api,
  // Get swipe queue with filters support
  getSwipeQueue: (filters?: Record<string, unknown>) => {
    return api.getSwipeQueue(filters || {});
  },
  // Swipe with proper action support
  swipe: (request: { petId: string; action: 'like' | 'pass' | 'superlike' }) => {
    return api.swipe(request.petId, request.action);
  },
  // Real WebSocket connection methods
  connectWebSocket: async (userId: string): Promise<Socket | null> => {
    try {
      // SECURITY: Tokens are in httpOnly cookies, not accessible via JavaScript
      // WebSocket connection should use cookie-based authentication
      // Note: Socket.IO doesn't automatically send httpOnly cookies
      // We need to use a token-based approach or configure server to accept cookies
      // For now, we'll attempt connection without token (server should read from cookies)
      // In production, consider using a token endpoint that returns a short-lived token for WebSocket
      logger.info('[WebSocket] Connecting with cookie-based auth (httpOnly cookies)');
      // Pass null - server should read token from cookie or use cookie-based auth
      return await webSocketManager.connect(userId, '');
    }
    catch (error) {
      logger.error('[WebSocket] Failed to connect:', { error });
      return null;
    }
  },
  disconnectWebSocket: (): void => {
    webSocketManager.disconnect();
  },
  // WebSocket utility methods
  isWebSocketConnected: (): boolean => {
    return webSocketManager.isConnected();
  },
  joinMatchRoom: (matchId: string): void => {
    webSocketManager.joinMatch(matchId);
  },
  leaveMatchRoom: (matchId: string): void => {
    webSocketManager.leaveMatch(matchId);
  },
  sendChatMessage: (matchId: string, content: string, messageType = 'text', attachments: unknown[] = []): void => {
    webSocketManager.sendMessage(matchId, content, messageType, attachments);
  },
  sendTypingIndicator: (matchId: string, isTyping: boolean): void => {
    webSocketManager.sendTyping(matchId, isTyping);
  },
  markMessagesAsRead: (matchId: string): void => {
    webSocketManager.markMessagesRead(matchId);
  },
  performMatchAction: (matchId: string, action: string): void => {
    webSocketManager.performMatchAction(matchId, action);
  },
  // Event listener helpers
  onWebSocketEvent: (eventName: string, callback: (data: SocketEventData) => void) => {
    const handler = (event: Event): void => {
      const customEvent = event as CustomEvent<SocketEventData>;
      callback(customEvent.detail);
    };
    const win = getSafeWindow();
    if (win) {
      win.addEventListener(`websocket:${eventName}`, handler);
      // Return cleanup function
      return () => {
        win.removeEventListener(`websocket:${eventName}`, handler);
      };
    }
    return () => {
      // No-op cleanup if window doesn't exist
    };
  },
};

export default apiClient;
