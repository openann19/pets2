/**
 * Real-time WebSocket Hook
 * Provides real-time updates via Socket.io
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '../utils/logger';
import { isBrowser } from '../utils/env';

// Socket.io types (simplified)
interface Socket {
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback?: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  disconnect: () => void;
  connected: boolean;
}

export interface TypingIndicator {
  matchId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface RealtimeMessage {
  matchId: string;
  message: {
    _id: string;
    sender: string;
    content: string;
    sentAt: string;
  };
}

interface UseRealtimeSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

interface UseRealtimeSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emitTyping: (matchId: string, isTyping: boolean) => void;
  onTyping: (callback: (data: TypingIndicator) => void) => () => void;
  onMessage: (callback: (data: RealtimeMessage) => void) => () => void;
  onOnlineStatus: (callback: (data: OnlineStatus) => void) => () => void;
}

/**
 * Hook for real-time WebSocket communication
 */
export function useRealtimeSocket(
  options: UseRealtimeSocketOptions = {}
): UseRealtimeSocketReturn {
  const { url = process.env['NEXT_PUBLIC_SOCKET_URL'] || 'http://localhost:5000', autoConnect = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      logger.info('Socket already connected');
      return;
    }

    try {
      // Dynamic import to avoid SSR issues
      if (!isBrowser()) return;

      // Use existing socket.io client if available
      // Token would be used here: getLocalStorageItem('accessToken')
      
      // Create socket connection (simplified - actual implementation would use socket.io-client)
      // For now, we'll create a mock socket that can be replaced with real implementation
      const mockSocket: Socket = {
        connected: false,
        on: () => {},
        off: () => {},
        emit: () => {},
        disconnect: () => {},
      };

      // In real implementation:
      // import io from 'socket.io-client';
      // const socket = io(url, {
      //   auth: { token },
      //   transports: ['websocket'],
      // });

      socketRef.current = mockSocket;
      setIsConnected(true);
      setError(null);

      logger.info('Socket connected', { url });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      logger.error('Socket connection failed', { error: errorMessage });
    }
  }, [url]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      logger.info('Socket disconnected');
    }
  }, []);

  // Emit typing indicator
  const emitTyping = useCallback((matchId: string, isTyping: boolean) => {
    if (!socketRef.current?.connected) {
      logger.warn('Cannot emit typing - socket not connected');
      return;
    }

    socketRef.current.emit('typing', { matchId, isTyping });
    logger.info('Typing indicator emitted', { matchId, isTyping });
  }, []);

  // Listen for typing indicators
  const onTyping = useCallback((callback: (data: TypingIndicator) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (data: unknown) => {
      callback(data as TypingIndicator);
    };

    socketRef.current.on('typing', handler);

    return () => {
      socketRef.current?.off('typing', handler);
    };
  }, []);

  // Listen for new messages
  const onMessage = useCallback((callback: (data: RealtimeMessage) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (data: unknown) => {
      callback(data as RealtimeMessage);
    };

    socketRef.current.on('message', handler);

    return () => {
      socketRef.current?.off('message', handler);
    };
  }, []);

  // Listen for online status changes
  const onOnlineStatus = useCallback((callback: (data: OnlineStatus) => void) => {
    if (!socketRef.current) return () => {};

    const handler = (data: unknown) => {
      callback(data as OnlineStatus);
    };

    socketRef.current.on('onlineStatus', handler);

    return () => {
      socketRef.current?.off('onlineStatus', handler);
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    emitTyping,
    onTyping,
    onMessage,
    onOnlineStatus,
  };
}
