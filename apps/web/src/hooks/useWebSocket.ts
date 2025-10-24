import { useEffect, useState, useCallback, useRef } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { useAuthStore } from '@/lib/auth-store';
import { WebSocketManager, getWebSocketManager } from '@/lib/websocket-manager';
export function useWebSocket(options = {}) {
    const { autoConnect = true, enableLogging = true, onConnect, onDisconnect, onReconnect, onError } = options;
    const { user, accessToken, isAuthenticated } = useAuthStore();
    const [state, setState] = useState({
        connected: false,
        connecting: false,
        error: null,
        socket: null
    });
    const managerRef = useRef(null);
    const listenersRef = useRef(new Map());
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const baseReconnectDelay = 1000; // 1 second
    // Initialize WebSocket manager
    useEffect(() => {
        if (!managerRef.current) {
            managerRef.current = getWebSocketManager({ enableLogging });
        }
    }, [enableLogging]);
    // Connect to WebSocket with exponential backoff
    const connect = useCallback(async () => {
        if (!user?.id || !accessToken) {
            logger.warn('[useWebSocket] Cannot connect: missing user or token');
            return;
        }
        if (!managerRef.current) {
            logger.error('[useWebSocket] WebSocket manager not initialized');
            return;
        }
        // Check if we've exceeded max reconnect attempts
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            logger.error('[useWebSocket] Max reconnect attempts exceeded');
            setState(prev => ({
                ...prev,
                connecting: false,
                error: new Error('Max reconnect attempts exceeded')
            }));
            return;
        }
        setState(prev => ({ ...prev, connecting: true, error: null }));
        try {
            const socket = await managerRef.current.connect(user.id, accessToken);
            setState({
                connected: true,
                connecting: false,
                error: null,
                socket
            });
            // Reset reconnect attempts on successful connection
            reconnectAttemptsRef.current = 0;
            onConnect?.();
        }
        catch (error) {
            const currentAttempts = reconnectAttemptsRef.current + 1;
            reconnectAttemptsRef.current = currentAttempts;
            setState({
                connected: false,
                connecting: false,
                error: error,
                socket: null
            });
            onError?.(error);
            // Schedule reconnection with exponential backoff + jitter
            if (currentAttempts < maxReconnectAttempts) {
                const jitter = Math.random() * 1000; // 0-1s jitter
                const delay = baseReconnectDelay * Math.pow(2, currentAttempts - 1) + jitter;
                logger.warn(`[useWebSocket] Connection failed, retrying in ${Math.round(delay)}ms (attempt ${currentAttempts}/${maxReconnectAttempts})`);
                setTimeout(() => {
                    if (isAuthenticated && user?.id && accessToken) {
                        connect();
                    }
                }, delay);
            }
        }
    }, [user?.id, accessToken, onError, onConnect, isAuthenticated, maxReconnectAttempts, baseReconnectDelay]);
    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (managerRef.current) {
            managerRef.current.disconnect();
            setState({
                connected: false,
                connecting: false,
                error: null,
                socket: null
            });
        }
    }, []);
    // Emit event
    const emit = useCallback((event, data) => {
        if (!managerRef.current) {
            logger.warn('[useWebSocket] Cannot emit: manager not initialized');
            return;
        }
        managerRef.current.emit(event, data);
    }, []);
    // Subscribe to event
    const on = useCallback((event, callback) => {
        if (!managerRef.current) {
            logger.warn('[useWebSocket] Cannot subscribe: manager not initialized');
            return;
        }
        // Store listener reference for cleanup
        listenersRef.current.set(event, callback);
        managerRef.current.on(event, callback);
        // Return unsubscribe function
        return () => {
            if (managerRef.current) {
                managerRef.current.off(event, callback);
                listenersRef.current.delete(event);
            }
        };
    }, []);
    // Subscribe to event once
    const once = useCallback((event, callback) => {
        if (!managerRef.current) {
            logger.warn('[useWebSocket] Cannot subscribe once: manager not initialized');
            return;
        }
        managerRef.current.once(event, callback);
    }, []);
    // Get connection status
    const getStatus = useCallback(() => {
        if (!managerRef.current) {
            return {
                connected: false,
                connecting: false,
                reconnectAttempts: 0,
                userId: null,
                socketId: null,
                queuedMessages: 0
            };
        }
        return managerRef.current.getConnectionStatus();
    }, []);
    // Auto-connect when authenticated
    useEffect(() => {
        if (autoConnect && isAuthenticated && user?.id && accessToken && !state.connected && !state.connecting) {
            connect();
        }
    }, [autoConnect, isAuthenticated, user?.id, accessToken, state.connected, state.connecting, connect]);
    // Listen for WebSocket status events
    useEffect(() => {
        const handleStatusChange = (event) => {
            const { status } = event.detail;
            switch (status) {
                case 'connected':
                    setState(prev => ({ ...prev, connected: true, connecting: false }));
                    onConnect?.();
                    break;
                case 'disconnected':
                    setState(prev => ({ ...prev, connected: false, connecting: false }));
                    onDisconnect?.();
                    break;
                case 'reconnected':
                    setState(prev => ({ ...prev, connected: true, connecting: false }));
                    onReconnect?.();
                    break;
                case 'failed':
                    setState(prev => ({
                        ...prev,
                        connected: false,
                        connecting: false,
                        error: new Error('Connection failed')
                    }));
                    break;
            }
        };
        const handleAuthError = () => {
            disconnect();
            // Trigger re-authentication flow
            useAuthStore.getState().logout();
        };
        window.addEventListener('websocket_status', handleStatusChange);
        window.addEventListener('websocket_auth_error', handleAuthError);
        return () => {
            window.removeEventListener('websocket_status', handleStatusChange);
            window.removeEventListener('websocket_auth_error', handleAuthError);
        };
    }, [onConnect, onDisconnect, onReconnect, disconnect]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Remove all listeners
            listenersRef.current.forEach((callback, event) => {
                if (managerRef.current) {
                    managerRef.current.off(event, callback);
                }
            });
            listenersRef.current.clear();
        };
    }, []);
    return {
        // State
        connected: state.connected,
        connecting: state.connecting,
        error: state.error,
        socket: state.socket,
        // Methods
        connect,
        disconnect,
        emit,
        on,
        once,
        getStatus,
    };
}
// Specialized hook for chat functionality
export function useChatWebSocket() {
    const websocket = useWebSocket({
        autoConnect: true,
        enableLogging: process.env.NODE_ENV === 'development'
    });
    const sendMessage = useCallback((matchId, message, attachments) => {
        websocket.emit('send_message', {
            matchId,
            message,
            attachments,
            timestamp: new Date().toISOString()
        });
    }, [websocket]);
    const sendTypingIndicator = useCallback((matchId, isTyping) => {
        websocket.emit('typing', {
            matchId,
            isTyping
        });
    }, [websocket]);
    const markMessageAsRead = useCallback((messageId) => {
        websocket.emit('message_read', {
            messageId,
            timestamp: new Date().toISOString()
        });
    }, [websocket]);
    const joinChatRoom = useCallback((matchId) => {
        websocket.emit('join_chat', { matchId });
    }, [websocket]);
    const leaveChatRoom = useCallback((matchId) => {
        websocket.emit('leave_chat', { matchId });
    }, [websocket]);
    return {
        ...websocket,
        sendMessage,
        sendTypingIndicator,
        markMessageAsRead,
        joinChatRoom,
        leaveChatRoom
    };
}
// Specialized hook for video calling
export function useVideoWebSocket() {
    const websocket = useWebSocket({
        autoConnect: true,
        enableLogging: process.env.NODE_ENV === 'development'
    });
    const initiateCall = useCallback((targetUserId, petId) => {
        websocket.emit('initiate_call', {
            targetUserId,
            petId,
            timestamp: new Date().toISOString()
        });
    }, [websocket]);
    const answerCall = useCallback((callId, accept) => {
        websocket.emit('answer_call', {
            callId,
            accept,
            timestamp: new Date().toISOString()
        });
    }, [websocket]);
    const sendSignal = useCallback((callId, targetUserId, signal) => {
        websocket.emit('webrtc_signal', {
            callId,
            targetUserId,
            signal
        });
    }, [websocket]);
    const endCall = useCallback((callId) => {
        websocket.emit('end_call', {
            callId,
            timestamp: new Date().toISOString()
        });
    }, [websocket]);
    return {
        ...websocket,
        initiateCall,
        answerCall,
        sendSignal,
        endCall
    };
}
// Specialized hook for real-time notifications
export function useNotificationWebSocket() {
    const [notifications, setNotifications] = useState([]);
    const websocket = useWebSocket({
        autoConnect: true,
        enableLogging: process.env.NODE_ENV === 'development',
        onConnect: () => {
            logger.info('[Notifications] WebSocket connected');
        }
    });
    useEffect(() => {
        if (!websocket.connected)
            return;
        const handleNotification = (notification) => {
            setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.body,
                    icon: '/icon-192x192.png',
                    tag: notification.id
                });
            }
        };
        const unsubscribe = websocket.on('notification', handleNotification);
        return () => {
            unsubscribe?.();
        };
    }, [websocket.connected, websocket]);
    const markAsRead = useCallback((notificationId) => {
        websocket.emit('notification_read', { notificationId });
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }, [websocket]);
    const clearAll = useCallback(() => {
        websocket.emit('notifications_clear_all');
        setNotifications([]);
    }, [websocket]);
    return {
        ...websocket,
        notifications,
        markAsRead,
        clearAll,
        unreadCount: notifications.filter(n => !n.read).length
    };
}
//# sourceMappingURL=useWebSocket.js.map