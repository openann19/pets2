'use client';
import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/auth-store';
import { logger } from '../services/logger';
const SocketContext = createContext({
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
export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef();
    const pingIntervalRef = useRef();
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Map());
    const [connectionQuality, setConnectionQuality] = useState('offline');
    const { accessToken, user } = useAuthStore();
    // Latency monitoring
    const latencyRef = useRef([]);
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
        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
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
            // Start monitoring connection quality
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
            pingIntervalRef.current = setInterval(() => {
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
        });
        socket.on('disconnect', (reason) => {
            logger.warn('Socket disconnected', { reason });
            setIsConnected(false);
            setConnectionQuality('offline');
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
            }
            // Attempt reconnection for certain disconnect reasons
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                reconnectTimeoutRef.current = setTimeout(() => {
                    socket.connect();
                }, 2000);
            }
        });
        socket.on('connect_error', (error) => {
            logger.error('Socket connection error', error);
            setConnectionQuality('offline');
        });
        // User status events
        socket.on('user_online', (userId) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
            logger.debug('User came online', { userId });
        });
        socket.on('user_offline', (userId) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            logger.debug('User went offline', { userId });
        });
        socket.on('online_users', (users) => {
            setOnlineUsers(new Set(users));
            logger.debug('Online users updated', { count: users.length });
        });
        // Typing indicators
        socket.on('user_typing', ({ matchId, userId, isTyping }) => {
            setTypingUsers(prev => {
                const newMap = new Map(prev);
                const matchTypers = newMap.get(matchId) || new Set();
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
        socket.on('new_message', (message) => {
            logger.debug('New message received', { messageId: message.id });
            // Message handling is done in the chat hooks/components
            window.dispatchEvent(new CustomEvent('socket:new_message', { detail: message }));
        });
        socket.on('message_read', ({ matchId, messageId, userId }) => {
            logger.debug('Message read', { matchId, messageId, userId });
            window.dispatchEvent(new CustomEvent('socket:message_read', { detail: { matchId, messageId, userId } }));
        });
        // Match events
        socket.on('new_match', (match) => {
            logger.info('New match received', { matchId: match.id });
            window.dispatchEvent(new CustomEvent('socket:new_match', { detail: match }));
            // Show notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Match! 🎉', {
                    body: `You matched with ${match.petName}!`,
                    icon: '/icon-192x192.png',
                    tag: `match-${match.id}`,
                });
            }
        });
        // Error handling
        socket.on('error', (error) => {
            logger.error('Socket error', error);
            window.dispatchEvent(new CustomEvent('socket:error', { detail: error }));
        });
        return socket;
    }, [accessToken, user, updateConnectionQuality]);
    /**
     * Join a match room for real-time updates
     */
    const joinMatch = useCallback((matchId) => {
        if (!socketRef.current?.connected) {
            logger.warn('Cannot join match - socket not connected');
            return;
        }
        socketRef.current.emit('join_match', matchId, (response) => {
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
    const leaveMatch = useCallback((matchId) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('leave_match', matchId, (response) => {
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
    const sendMessage = useCallback((matchId, message) => {
        if (!socketRef.current?.connected) {
            logger.warn('Cannot send message - socket not connected');
            throw new Error('Not connected to chat server');
        }
        socketRef.current.emit('send_message', { matchId, message }, (response) => {
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
    const sendTyping = useCallback((matchId, isTyping) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('typing', { matchId, isTyping });
    }, []);
    /**
     * Mark message as read
     */
    const markMessageRead = useCallback((matchId, messageId) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('mark_read', { matchId, messageId }, (response) => {
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