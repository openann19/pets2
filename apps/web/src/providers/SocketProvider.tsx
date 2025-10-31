'use client';
import React, { createContext, useContext, useEffect, useRef, useCallback, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth-store';
import { logger } from '../services/logger';
import type { User, Message, SocketTypingData, SocketMatchData, SocketError } from '../types';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken?: string) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
    initializeAuth: () => Promise<void>;
    clearTokens: () => void;
    refreshTokenIfNeeded: () => Promise<boolean>;
}

interface SocketContextValue {
    socket: Socket | null;
    isConnected: boolean;
    joinMatch: (matchId: string) => void;
    leaveMatch: (matchId: string) => void;
    sendMessage: (matchId: string, message: string) => void;
    sendTyping: (matchId: string, isTyping: boolean) => void;
    markMessageRead: (matchId: string, messageId: string) => void;
    onlineUsers: Set<string>;
    typingUsers: Map<string, Set<string>>;
    connectionQuality: 'offline' | 'poor' | 'good' | 'excellent';
}

interface SocketRegisterResponse {
    error?: string;
    success?: boolean;
}

interface SocketJoinResponse {
    error?: string;
    success?: boolean;
}

interface SocketSendMessageResponse {
    error?: string;
    success?: boolean;
    messageId?: string;
}

interface SocketMarkReadResponse {
    error?: string;
    success?: boolean;
}

const SocketContext = createContext<SocketContextValue>({
    socket: null,
    isConnected: false,
    joinMatch: () => { },
    leaveMatch: () => { },
    sendMessage: () => { },
    sendTyping: () => { },
    markMessageRead: () => { },
    onlineUsers: new Set(),
    typingUsers: new Map(),
    connectionQuality: 'offline',
});
export const useSocket = () => useContext(SocketContext);
/**
 * Production-ready WebSocket provider with automatic reconnection,
 * connection quality monitoring, and comprehensive error handling
 */
export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const pingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const reconnectAttemptsRef = useRef(0); // Track reconnection attempts across disconnect events
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
    const [connectionQuality, setConnectionQuality] = useState<'offline' | 'poor' | 'good' | 'excellent'>('offline');
    // Use Zustand selector pattern for type safety - cast selector to handle unknown state type
    const accessToken = useAuthStore((state: unknown) => {
      const authState = state as AuthState;
      return authState.accessToken;
    });
    const user = useAuthStore((state: unknown) => {
      const authState = state as AuthState;
      return authState.user;
    });
    // Latency monitoring
    const latencyRef = useRef<number[]>([]);
    const maxLatencyHistory = 10;
    /**
     * Calculate connection quality based on latency
     */
    const updateConnectionQuality = useCallback(() => {
        if (!isConnected) {
            setConnectionQuality('offline');
            return;
        }
        if (latencyRef.current.length === 0) {
            setConnectionQuality('good');
            return;
        }
        const avgLatency = latencyRef.current.reduce((a, b) => a + b, 0) / latencyRef.current.length;
        if (avgLatency < 50) {
            setConnectionQuality('excellent');
        }
        else if (avgLatency < 150) {
            setConnectionQuality('good');
        }
        else {
            setConnectionQuality('poor');
        }
    }, [isConnected]);
    /**
     * Initialize socket connection with auth
     */
    const initSocket = useCallback(() => {
        if (!accessToken || !user) {
            logger.info('Skipping socket connection - no auth');
            return;
        }
        // Clean up existing connection
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        const socketUrl = process.env['NEXT_PUBLIC_WS_URL'] || process.env['NEXT_PUBLIC_SOCKET_URL'] || 'http://localhost:5001';
        socketRef.current = io(socketUrl, {
            auth: {
                token: accessToken,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 10,
            timeout: 20000,
        });
        const socket = socketRef.current;
        // Connection handlers
        socket.on('connect', () => {
            logger.info('Socket connected', { id: socket.id });
            setIsConnected(true);
            setConnectionQuality('good'); // Reset to good on connect
            
            // Reset reconnection attempts on successful connection
            reconnectAttemptsRef.current = 0;
            
            // Clear any pending reconnection attempts
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = undefined;
            }
            
            // Register user with server (re-emit on reconnect)
            if (user?._id) {
                socket.emit('register_user', { userId: user._id }, (response: SocketRegisterResponse) => {
                    if (response?.error) {
                        logger.error('[Socket] Failed to register user', { error: response.error });
                    } else {
                        logger.debug('[Socket] User registered successfully', { userId: user._id });
                    }
                });
            }
            
            // Start monitoring connection quality
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
            pingIntervalRef.current = setInterval(() => {
                if (!socket.connected) {
                    if (pingIntervalRef.current) {
                        clearInterval(pingIntervalRef.current);
                        pingIntervalRef.current = undefined;
                    }
                    return;
                }
                const start = Date.now();
                socket.emit('ping', () => {
                    const latency = Date.now() - start;
                    latencyRef.current.push(latency);
                    if (latencyRef.current.length > maxLatencyHistory) {
                        latencyRef.current.shift();
                    }
                    updateConnectionQuality();
                });
            }, 5000);
            
            // Notify that connection is restored
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('socket:connected', {
                    detail: { socketId: socket.id }
                }));
            }
        });
        // Reconnect handler - re-register user after reconnection
        socket.on('reconnect', (attemptNumber: number) => {
            logger.info('Socket reconnected', { attemptNumber, socketId: socket.id });
            setIsConnected(true);
            setConnectionQuality('good');
            reconnectAttemptsRef.current = 0;
            
            // Re-register user after reconnection
            if (user?._id) {
                socket.emit('register_user', { userId: user._id }, (response: SocketRegisterResponse) => {
                    if (response?.error) {
                        logger.error('[Socket] Failed to re-register user after reconnect', { error: response.error });
                    } else {
                        logger.info('[Socket] User re-registered successfully after reconnect', { userId: user._id });
                    }
                });
            }
            
            // Re-join user room if needed
            if (user?._id) {
                socket.emit('join_user_room', { userId: user._id });
            }
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('socket:reconnected', {
                    detail: { socketId: socket.id, attemptNumber }
                }));
            }
        });
        socket.on('disconnect', (reason: string) => {
            logger.warn('Socket disconnected', { reason });
            setIsConnected(false);
            setConnectionQuality('offline');
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
            // Enhanced reconnection logic with exponential backoff
            if (reason === 'io server disconnect' || reason === 'transport close') {
                // Server disconnected us or transport closed - attempt reconnection
                const maxReconnectAttempts = 5;
                const scheduleReconnect = () => {
                    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                        logger.error('[Socket] Max reconnection attempts reached');
                        reconnectAttemptsRef.current = 0; // Reset for next connection attempt
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('socket:reconnect_failed', {
                                detail: { reason, attempts: reconnectAttemptsRef.current }
                            }));
                        }
                        return;
                    }
                    reconnectAttemptsRef.current++;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000); // Exponential backoff, max 30s
                    logger.info(`[Socket] Scheduling reconnect attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${delay}ms`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (socketRef.current && !socketRef.current.connected) {
                            socket.connect();
                        }
                    }, delay);
                };
                scheduleReconnect();
            } else if (reason === 'io client disconnect') {
                // Client intentionally disconnected - don't reconnect
                reconnectAttemptsRef.current = 0; // Reset attempts
                logger.info('[Socket] Client disconnected intentionally');
            }
        });
        socket.on('connect_error', (error: Error) => {
            logger.error('Socket connection error', { error: error.message, stack: error.stack });
            setConnectionQuality('offline');
        });
        // User status events
        socket.on('user_online', (userId: string) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
            logger.debug('User came online', { userId });
        });
        socket.on('user_offline', (userId: string) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            logger.debug('User went offline', { userId });
        });
        socket.on('online_users', (users: string[]) => {
            setOnlineUsers(new Set(users));
            logger.debug('Online users updated', { count: users.length });
        });
        // Typing indicators
        socket.on('user_typing', ({ matchId, userId, isTyping }: SocketTypingData) => {
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                const matchTypers = newMap.get(matchId) || new Set<string>();
                if (isTyping) {
                    matchTypers.add(userId);
                }
                else {
                    matchTypers.delete(userId);
                }
                if (matchTypers.size === 0) {
                    newMap.delete(matchId);
                }
                else {
                    newMap.set(matchId, matchTypers);
                }
                return newMap;
            });
        });
        // Message events
        socket.on('new_message', (message: Message) => {
            logger.debug('New message received', { messageId: message._id });
            // Message handling is done in the chat hooks/components
            window.dispatchEvent(new CustomEvent('socket:new_message', { detail: message }));
        });
        socket.on('message_read', ({ matchId, messageId, userId }: { matchId: string; messageId: string; userId: string }) => {
            logger.debug('Message read', { matchId, messageId, userId });
            window.dispatchEvent(new CustomEvent('socket:message_read', { detail: { matchId, messageId, userId } }));
        });
        // Match events
        socket.on('new_match', (match: SocketMatchData) => {
            logger.info('New match received', { matchId: match.matchId });
            window.dispatchEvent(new CustomEvent('socket:new_match', { detail: match }));
            // Show notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
                const petName = match.pets[0]?.name || 'a pet';
                new Notification('New Match! 🎉', {
                    body: `You matched with ${petName}!`,
                    icon: '/icon-192x192.png',
                    tag: `match-${match.matchId}`,
                });
            }
        });
        // Error handling
        socket.on('error', (error: SocketError) => {
            logger.error('Socket error', { 
                message: error.message, 
                code: error.code, 
                details: error.details 
            });
            window.dispatchEvent(new CustomEvent('socket:error', { detail: error }));
        });
        return socket;
    }, [accessToken, user, updateConnectionQuality]);
    /**
     * Join a match room for real-time updates
     */
    const joinMatch = useCallback((matchId: string) => {
        if (!socketRef.current?.connected) {
            logger.warn('Cannot join match - socket not connected');
            return;
        }
        socketRef.current.emit('join_match', matchId, (response: SocketJoinResponse) => {
            if (response?.error) {
                logger.error('Failed to join match', { matchId, error: response.error });
            }
            else {
                logger.debug('Joined match room', { matchId });
            }
        });
    }, []);
    /**
     * Leave a match room
     */
    const leaveMatch = useCallback((matchId: string) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('leave_match', matchId, (response: SocketJoinResponse) => {
            if (response?.error) {
                logger.error('Failed to leave match', { matchId, error: response.error });
            }
            else {
                logger.debug('Left match room', { matchId });
            }
        });
    }, []);
    /**
     * Send a message in a match
     */
    const sendMessage = useCallback((matchId: string, message: string) => {
        if (!socketRef.current?.connected) {
            logger.warn('Cannot send message - socket not connected');
            throw new Error('Not connected to chat server');
        }
        socketRef.current.emit('send_message', { matchId, message }, (response: SocketSendMessageResponse) => {
            if (response?.error) {
                logger.error('Failed to send message', { matchId, error: response.error });
                throw new Error(response.error || 'Failed to send message');
            }
            else {
                logger.debug('Message sent', { matchId });
            }
        });
    }, []);
    /**
     * Send typing indicator
     */
    const sendTyping = useCallback((matchId: string, isTyping: boolean) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('typing', { matchId, isTyping });
    }, []);
    /**
     * Mark message as read
     */
    const markMessageRead = useCallback((matchId: string, messageId: string) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('mark_read', { matchId, messageId }, (response: SocketMarkReadResponse) => {
            if (response?.error) {
                logger.error('Failed to mark message as read', { matchId, messageId, error: response.error });
            }
        });
    }, []);
    // Initialize socket when auth changes
    useEffect(() => {
        if (accessToken && user) {
            const socket = initSocket();
            return () => {
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                }
                if (socket) {
                    socket.disconnect();
                    socketRef.current = null;
                }
            };
        }
        else {
            // Clean up socket if no auth
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
                setConnectionQuality('offline');
            }
        }
        return undefined; // Explicit return for all code paths
    }, [accessToken, user, initSocket]);
    // Request notification permissions on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                logger.info('Notification permission', { permission });
            });
        }
    }, []);
    const value = {
        socket: socketRef.current,
        isConnected,
        joinMatch,
        leaveMatch,
        sendMessage,
        sendTyping,
        markMessageRead,
        onlineUsers,
        typingUsers,
        connectionQuality,
    };
    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
//# sourceMappingURL=SocketProvider.jsx.map