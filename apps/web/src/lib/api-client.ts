import api from '../services/api'
import { logger } from '@pawfectmatch/core';
;
import { io, Socket } from 'socket.io-client';
// WebSocket connection management
class WebSocketManager {
    socket = null;
    userId = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 10;
    reconnectDelay = 1000;
    isConnecting = false;
    connect(userId, token) {
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
            const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
            logger.info('[WebSocket] Connecting to:', { socketUrl });
            this.socket = io(socketUrl, {
                auth: {
                    token: token,
                },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: this.maxReconnectAttempts,
                timeout: 20000,
                upgrade: true,
                rememberUpgrade: true,
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
            socket.on('connect_error', (error) => {
                logger.error('[WebSocket] Connection error:', { error });
                this.isConnecting = false;
                this.reconnectAttempts++;
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
                }
            });
            // Disconnect handler
            socket.on('disconnect', (reason) => {
                logger.info('[WebSocket] Disconnected:', { reason });
                this.isConnecting = false;
            });
            // Error handler
            socket.on('error', (error) => {
                logger.error('[WebSocket] Socket error:', { error });
            });
            // Set up common event listeners
            this.setupEventListeners(socket);
        });
    }
    setupEventListeners(socket) {
        // Handle new messages
        socket.on('new_message', (data) => {
            logger.info('[WebSocket] New message received:', { data });
            // Dispatch custom event for components to listen to
            window.dispatchEvent(new CustomEvent('websocket:new_message', { detail: data }));
        });
        // Handle user online/offline status
        socket.on('user_online', (data) => {
            logger.info('[WebSocket] User online:', { data });
            window.dispatchEvent(new CustomEvent('websocket:user_online', { detail: data }));
        });
        socket.on('user_offline', (data) => {
            logger.info('[WebSocket] User offline:', { data });
            window.dispatchEvent(new CustomEvent('websocket:user_offline', { detail: data }));
        });
        // Handle typing indicators
        socket.on('user_typing', (data) => {
            logger.info('[WebSocket] User typing:', { data });
            window.dispatchEvent(new CustomEvent('websocket:user_typing', { detail: data }));
        });
        // Handle notifications
        socket.on('notification', (data) => {
            logger.info('[WebSocket] Notification received:', { data });
            window.dispatchEvent(new CustomEvent('websocket:notification', { detail: data }));
        });
        // Handle match events
        socket.on('new_match', (data) => {
            logger.info('[WebSocket] New match:', { data });
            window.dispatchEvent(new CustomEvent('websocket:new_match', { detail: data }));
        });
        // Handle message read receipts
        socket.on('messages_read', (data) => {
            logger.info('[WebSocket] Messages read:', { data });
            window.dispatchEvent(new CustomEvent('websocket:messages_read', { detail: data }));
        });
    }
    disconnect() {
        if (this.socket) {
            logger.info('[WebSocket] Disconnecting...');
            this.socket.disconnect();
            this.socket = null;
            this.userId = null;
            this.isConnecting = false;
            this.reconnectAttempts = 0;
        }
    }
    isConnected() {
        return this.socket?.connected || false;
    }
    getSocket() {
        return this.socket;
    }
    // Join a match room for real-time chat
    joinMatch(matchId) {
        if (this.socket?.connected) {
            logger.info('[WebSocket] Joining match room:', { matchId });
            this.socket.emit('join_match', matchId);
        }
    }
    // Leave a match room
    leaveMatch(matchId) {
        if (this.socket?.connected) {
            logger.info('[WebSocket] Leaving match room:', { matchId });
            this.socket.emit('leave_match', matchId);
        }
    }
    // Send a message in a match
    sendMessage(matchId, content, messageType = 'text', attachments = []) {
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
    sendTyping(matchId, isTyping) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { matchId, isTyping });
        }
    }
    // Mark messages as read
    markMessagesRead(matchId) {
        if (this.socket?.connected) {
            this.socket.emit('mark_messages_read', { matchId });
        }
    }
    // Perform match actions (archive, block, etc.)
    performMatchAction(matchId, action) {
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
    // Real WebSocket connection methods
    connectWebSocket: async (userId) => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            return await webSocketManager.connect(userId, token);
        }
        catch (error) {
            logger.error('[WebSocket] Failed to connect:', { error });
            return null;
        }
    },
    disconnectWebSocket: () => {
        webSocketManager.disconnect();
    },
    // WebSocket utility methods
    isWebSocketConnected: () => {
        return webSocketManager.isConnected();
    },
    joinMatchRoom: (matchId) => {
        webSocketManager.joinMatch(matchId);
    },
    leaveMatchRoom: (matchId) => {
        webSocketManager.leaveMatch(matchId);
    },
    sendChatMessage: (matchId, content, messageType = 'text', attachments = []) => {
        webSocketManager.sendMessage(matchId, content, messageType, attachments);
    },
    sendTypingIndicator: (matchId, isTyping) => {
        webSocketManager.sendTyping(matchId, isTyping);
    },
    markMessagesAsRead: (matchId) => {
        webSocketManager.markMessagesRead(matchId);
    },
    performMatchAction: (matchId, action) => {
        webSocketManager.performMatchAction(matchId, action);
    },
    // Event listener helpers
    onWebSocketEvent: (eventName, callback) => {
        const handler = (event) => callback(event.detail);
        window.addEventListener(`websocket:${eventName}`, handler);
        // Return cleanup function
        return () => {
            window.removeEventListener(`websocket:${eventName}`, handler);
        };
    },
};
export default apiClient;
//# sourceMappingURL=api-client.js.map