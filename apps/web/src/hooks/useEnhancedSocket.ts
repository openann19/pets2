/**
 * 🔌 ENHANCED SOCKET HOOK
 * Advanced real-time communication with performance optimization and reliability
 */
'use client';
import { useEffect, useRef, useState, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../lib/auth-store';
import { logger } from '../services/logger';
export const useEnhancedSocket = () => {
    const { user, accessToken } = useAuthStore();
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const pingIntervalRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const latencyHistoryRef = useRef([]);
    const [state, setState] = useState({
        isConnected: false,
        connectionQuality: 'offline',
        latency: 0,
        reconnectAttempts: 0,
    });
    const [typingUsers, setTypingUsers] = useState([]);
    // Enhanced connection quality calculation
    const updateConnectionQuality = useCallback(() => {
        const avgLatency = latencyHistoryRef.current.reduce((a, b) => a + b, 0) / latencyHistoryRef.current.length;
        let quality = 'offline';
        if (state.isConnected) {
            if (avgLatency < 100)
                quality = 'excellent';
            else if (avgLatency < 300)
                quality = 'good';
            else
                quality = 'poor';
        }
        setState(prev => ({ ...prev, connectionQuality: quality, latency: avgLatency }));
    }, [state.isConnected]);
    // Initialize socket connection
    const connect = useCallback(() => {
        if (!accessToken || !user) {
            logger.debug('Skipping socket connection - no auth');
            return;
        }
        // Clean up existing connection
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
        logger.info('Connecting to enhanced socket', { url: socketUrl, userId: user.id });
        socketRef.current = io(socketUrl, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 10,
            timeout: 20000,
            upgrade: true,
            rememberUpgrade: true,
        });
        const socket = socketRef.current;
        // Enhanced connection handlers
        socket.on('connect', () => {
            logger.info('Socket connected successfully', { id: socket.id });
            setState(prev => ({
                ...prev,
                isConnected: true,
                reconnectAttempts: 0
            }));
            // Start latency monitoring
            startLatencyMonitoring();
            // Join user's personal room
            socket.emit('join_user_room', { userId: user.id });
        });
        socket.on('disconnect', (reason) => {
            logger.warn('Socket disconnected', { reason });
            setState(prev => ({
                ...prev,
                isConnected: false,
                connectionQuality: 'offline'
            }));
            stopLatencyMonitoring();
            // Attempt intelligent reconnection
            if (reason === 'io server disconnect') {
                scheduleReconnect();
            }
        });
        socket.on('connect_error', (error) => {
            logger.error('Socket connection error', error);
            setState(prev => ({
                ...prev,
                reconnectAttempts: prev.reconnectAttempts + 1
            }));
        });
        // Enhanced typing handlers (fixes identified inconsistency)
        socket.on('user_typing', (data) => {
            if (data.isTyping) {
                setTypingUsers(prev => {
                    const filtered = prev.filter(u => !(u.userId === data.userId && u.matchId === data.matchId));
                    return [...filtered, {
                            userId: data.userId,
                            userName: data.userName,
                            matchId: data.matchId,
                            timestamp: Date.now(),
                        }];
                });
            }
            else {
                setTypingUsers(prev => prev.filter(u => !(u.userId === data.userId && u.matchId === data.matchId)));
            }
        });
        // Enhanced message handlers
        socket.on('new_message', (data) => {
            logger.info('New message received', { matchId: data.matchId });
            // Trigger notification sound/vibration if page not visible
            if (document.hidden) {
                triggerNotification('New message received!');
            }
        });
        // Connection quality monitoring
        socket.on('pong', (latency) => {
            latencyHistoryRef.current.push(latency);
            if (latencyHistoryRef.current.length > 10) {
                latencyHistoryRef.current.shift();
            }
            updateConnectionQuality();
        });
    }, [accessToken, user, updateConnectionQuality]);
    // Disconnect socket
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        stopLatencyMonitoring();
        clearReconnectTimeout();
    }, []);
    // Enhanced messaging methods
    const sendMessage = useCallback((matchId, message) => {
        if (!socketRef.current?.connected) {
            logger.warn('Cannot send message - socket not connected');
            return;
        }
        const messageData = {
            matchId,
            message: {
                ...message,
                timestamp: new Date().toISOString(),
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
        };
        socketRef.current.emit('send_message', messageData);
        logger.debug('Message sent', { matchId, messageId: messageData.message.id });
    }, []);
    const joinMatch = useCallback((matchId) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('join_match', { matchId });
        logger.debug('Joined match room', { matchId });
    }, []);
    const leaveMatch = useCallback((matchId) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('leave_match', { matchId });
        logger.debug('Left match room', { matchId });
    }, []);
    // Fixed typing indicators (addresses architecture gap)
    const startTyping = useCallback((matchId) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('typing', {
            matchId,
            isTyping: true,
            userId: user?.id,
            userName: user?.name || 'User',
        });
        // Auto-stop typing after 3 seconds
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping(matchId);
        }, 3000);
    }, [user]);
    const stopTyping = useCallback((matchId) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('typing', {
            matchId,
            isTyping: false,
            userId: user?.id,
            userName: user?.name || 'User',
        });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [user]);
    // Presence updates
    const updatePresence = useCallback((status) => {
        if (!socketRef.current?.connected)
            return;
        socketRef.current.emit('presence_update', {
            userId: user?.id,
            status,
            timestamp: new Date().toISOString(),
        });
    }, [user]);
    // Event subscription methods
    const on = useCallback((event, callback) => {
        if (!socketRef.current)
            return;
        socketRef.current.on(event, callback);
    }, []);
    const off = useCallback((event, callback) => {
        if (!socketRef.current)
            return;
        socketRef.current.off(event, callback);
    }, []);
    const emit = useCallback((event, data) => {
        if (!socketRef.current?.connected) {
            logger.warn(`Cannot emit ${event} - socket not connected`);
            return;
        }
        socketRef.current.emit(event, data);
    }, []);
    // Helper methods
    const startLatencyMonitoring = () => {
        if (pingIntervalRef.current)
            return;
        pingIntervalRef.current = setInterval(() => {
            if (socketRef.current?.connected) {
                const start = Date.now();
                socketRef.current.emit('ping', () => {
                    const latency = Date.now() - start;
                    setState(prev => ({ ...prev, latency }));
                });
            }
        }, 5000);
    };
    const stopLatencyMonitoring = () => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
    };
    const scheduleReconnect = () => {
        if (reconnectTimeoutRef.current)
            return;
        const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
            logger.info('Attempting socket reconnection', { attempt: state.reconnectAttempts + 1 });
            connect();
            reconnectTimeoutRef.current = null;
        }, delay);
    };
    const clearReconnectTimeout = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    };
    const triggerNotification = (message) => {
        try {
            // Web vibration
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
            // Browser notification (if permission granted)
            if (Notification.permission === 'granted') {
                new Notification('PawfectMatch', {
                    body: message,
                    icon: '/icons/paw-icon.png',
                    badge: '/icons/paw-badge.png',
                });
            }
            // Audio notification
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Audio failed, that's ok
            });
        }
        catch (error) {
            logger.debug('Notification failed:', { error });
        }
    };
    // Auto-connect on mount
    useEffect(() => {
        if (accessToken && user) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [accessToken, user, connect, disconnect]);
    // Cleanup typing users (remove stale entries)
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            setTypingUsers(prev => prev.filter(user => now - user.timestamp < 5000) // Remove after 5 seconds
            );
        }, 1000);
        return () => clearInterval(cleanup);
    }, []);
    // Page visibility handling
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                updatePresence('away');
            }
            else {
                updatePresence('online');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [updatePresence]);
    return {
        socket: socketRef.current,
        state,
        typingUsers,
        connect,
        disconnect,
        sendMessage,
        joinMatch,
        leaveMatch,
        startTyping,
        stopTyping,
        updatePresence,
        on,
        off,
        emit,
    };
};
//# sourceMappingURL=useEnhancedSocket.js.map