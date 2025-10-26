import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '@/services/logger';
export const useRealtimeFeed = ({ onUpdate, userId, autoConnect = true, }) => {
    const socketRef = useRef(null);
    const connect = useCallback(() => {
        if (socketRef.current?.connected)
            return;
        const socket = io(process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });
        socket.on('connect', () => {
            logger.info('WebSocket connected');
            if (userId) {
                socket.emit('join:feed', userId);
            }
        });
        socket.on('disconnect', () => {
            logger.warn('WebSocket disconnected');
        });
        socket.on('feed:update', (data) => {
            onUpdate(data);
        });
        socket.on('connect_error', (error) => {
            logger.error('WebSocket connection error', { error });
        });
        socketRef.current = socket;
    }, [userId, onUpdate]);
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);
    const emit = useCallback((event, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        }
    }, []);
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);
    return {
        connect,
        disconnect,
        emit,
        isConnected: socketRef.current?.connected ?? false,
    };
};
// Convenience hooks for specific actions
export const useFeedActions = (userId) => {
    const options = {
        onUpdate: () => { },
        autoConnect: false,
        ...(userId ? { userId } : {}),
    };
    const { emit } = useRealtimeFeed(options);
    return {
        createPost: (post) => { emit('post:create', post); },
        likePost: (postId) => { emit('post:like', { postId, userId }); },
        commentOnPost: (postId, comment) => { emit('post:comment', { postId, userId, comment }); },
        deletePost: (postId) => { emit('post:delete', { postId, userId }); },
    };
};
//# sourceMappingURL=useRealtimeFeed.js.map