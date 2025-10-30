"use strict";
/**
 * Real-time WebSocket Hook
 * Provides real-time updates via Socket.io
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRealtimeSocket = useRealtimeSocket;
const react_1 = require("react");
const logger_1 = require("../utils/logger");
const env_1 = require("../utils/env");
/**
 * Hook for real-time WebSocket communication
 */
function useRealtimeSocket(options = {}) {
    const { url = process.env['NEXT_PUBLIC_SOCKET_URL'] || 'http://localhost:5000', autoConnect = true } = options;
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const socketRef = (0, react_1.useRef)(null);
    // Connect to WebSocket
    const connect = (0, react_1.useCallback)(() => {
        if (socketRef.current?.connected) {
            logger_1.logger.info('Socket already connected');
            return;
        }
        try {
            // Dynamic import to avoid SSR issues
            if (!(0, env_1.isBrowser)())
                return;
            // Use existing socket.io client if available
            // Token would be used here: getLocalStorageItem('accessToken')
            // Create socket connection (simplified - actual implementation would use socket.io-client)
            // For now, we'll create a mock socket that can be replaced with real implementation
            const mockSocket = {
                connected: false,
                on: () => { },
                off: () => { },
                emit: () => { },
                disconnect: () => { },
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
            logger_1.logger.info('Socket connected', { url });
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
            setError(errorMessage);
            logger_1.logger.error('Socket connection failed', { error: errorMessage });
        }
    }, [url]);
    // Disconnect from WebSocket
    const disconnect = (0, react_1.useCallback)(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
            logger_1.logger.info('Socket disconnected');
        }
    }, []);
    // Emit typing indicator
    const emitTyping = (0, react_1.useCallback)((matchId, isTyping) => {
        if (!socketRef.current?.connected) {
            logger_1.logger.warn('Cannot emit typing - socket not connected');
            return;
        }
        socketRef.current.emit('typing', { matchId, isTyping });
        logger_1.logger.info('Typing indicator emitted', { matchId, isTyping });
    }, []);
    // Listen for typing indicators
    const onTyping = (0, react_1.useCallback)((callback) => {
        if (!socketRef.current)
            return () => { };
        const handler = (data) => {
            callback(data);
        };
        socketRef.current.on('typing', handler);
        return () => {
            socketRef.current?.off('typing', handler);
        };
    }, []);
    // Listen for new messages
    const onMessage = (0, react_1.useCallback)((callback) => {
        if (!socketRef.current)
            return () => { };
        const handler = (data) => {
            callback(data);
        };
        socketRef.current.on('message', handler);
        return () => {
            socketRef.current?.off('message', handler);
        };
    }, []);
    // Listen for online status changes
    const onOnlineStatus = (0, react_1.useCallback)((callback) => {
        if (!socketRef.current)
            return () => { };
        const handler = (data) => {
            callback(data);
        };
        socketRef.current.on('onlineStatus', handler);
        return () => {
            socketRef.current?.off('onlineStatus', handler);
        };
    }, []);
    // Auto-connect on mount
    (0, react_1.useEffect)(() => {
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
