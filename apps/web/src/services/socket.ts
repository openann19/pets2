/**
 * WebSocket Service for Real-time Features
 * Handles chat, notifications, and live updates
 */
import { io, Socket } from 'socket.io-client'
import { logger } from '@pawfectmatch/core';
;
import { MessageAttachment, SocketMessageData, SocketNotificationData, SocketUserStatusData, SocketCallData, SocketMatchData, SocketError, SocketTypingData } from '@/types';
class SocketService {
    socket = null;
    config;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    reconnectDelay = 1000;
    isConnected = false;
    eventHandlers = new Map();
    constructor(config) {
        this.config = {
            autoConnect: true,
            ...config,
        };
        if (this.config.autoConnect === true) {
            this.connect();
        }
    }
    connect() {
        if (this.socket?.connected) {
            return;
        }
        try {
            this.socket = io(this.config.url, {
                auth: {
                    token: this.config.token,
                },
                transports: ['websocket', 'polling'],
                timeout: 20000,
                forceNew: true,
            });
            this.setupEventListeners();
        }
        catch (error) {
            logger.error('Failed to connect to WebSocket:', { error });
            this.handleReconnect();
        }
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }
    setupEventListeners() {
        if (this.socket === null)
            return;
        this.socket.on('connect', () => {
            logger.info('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
        });
        this.socket.on('disconnect', (reason) => {
            logger.info('WebSocket disconnected:', { reason });
            this.isConnected = false;
            this.emit('disconnected', reason);
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                this.handleReconnect();
            }
        });
        this.socket.on('connect_error', (error) => {
            logger.error('WebSocket connection error:', { error });
            this.emit('error', error);
            this.handleReconnect();
        });
        // Chat events
        this.socket.on('message', (data) => {
            this.emit('message', data);
        });
        this.socket.on('message_sent', (data) => {
            this.emit('message_sent', data);
        });
        this.socket.on('typing_start', (data) => {
            this.emit('typing_start', data);
        });
        this.socket.on('typing_stop', (data) => {
            this.emit('typing_stop', data);
        });
        // Match events
        this.socket.on('new_match', (data) => {
            this.emit('new_match', data);
        });
        this.socket.on('match_updated', (data) => {
            this.emit('match_updated', data);
        });
        // User status events
        this.socket.on('user_status', (data) => {
            this.emit('user_status', data);
        });
        // Notification events
        this.socket.on('notification', (data) => {
            this.emit('notification', data);
        });
        // Call events
        this.socket.on('call_incoming', (data) => {
            this.emit('call_incoming', data);
        });
        this.socket.on('call_accepted', (data) => {
            this.emit('call_accepted', data);
        });
        this.socket.on('call_rejected', (data) => {
            this.emit('call_rejected', data);
        });
        this.socket.on('call_ended', (data) => {
            this.emit('call_ended', data);
        });
        // Error handling
        this.socket.on('error', (error) => {
            logger.error('WebSocket error:', { error });
            this.emit('error', error);
        });
    }
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('Max reconnection attempts reached');
            this.emit('reconnect_failed');
            return;
        }
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        logger.info(`Attempting to reconnect in ${delay.toString()}ms (attempt ${this.reconnectAttempts.toString()})`);
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    // Event handling
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        const handlers = this.eventHandlers.get(event);
        if (handlers !== undefined) {
            handlers.push(handler);
        }
    }
    off(event, handler) {
        if (!this.eventHandlers.has(event))
            return;
        if (handler !== undefined) {
            const handlers = this.eventHandlers.get(event);
            if (handlers !== undefined) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        }
        else {
            this.eventHandlers.delete(event);
        }
    }
    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
    // Chat methods
    joinMatch(matchId) {
        if (this.socket?.connected === true) {
            this.socket.emit('join_match', matchId);
        }
    }
    leaveMatch(matchId) {
        if (this.socket?.connected === true) {
            this.socket.emit('leave_match', matchId);
        }
    }
    sendMessage(matchId, content, attachments) {
        if (this.socket?.connected === true) {
            this.socket.emit('send_message', {
                matchId,
                content,
                messageType: 'text',
                attachments: attachments ?? []
            });
        }
    }
    startTyping(matchId) {
        if (this.socket?.connected === true) {
            this.socket.emit('typing', { matchId, isTyping: true });
        }
    }
    stopTyping(matchId) {
        if (this.socket?.connected === true) {
            this.socket.emit('typing', { matchId, isTyping: false });
        }
    }
    // Match methods
    swipePet(petId, action) {
        if (this.socket?.connected === true) {
            this.socket.emit('swipe', { petId, action });
        }
    }
    // Call methods
    initiateCall(matchId, type) {
        if (this.socket?.connected === true) {
            this.socket.emit('call_initiate', { matchId, type });
        }
    }
    acceptCall(callId) {
        if (this.socket?.connected === true) {
            this.socket.emit('call_accept', { callId });
        }
    }
    rejectCall(callId) {
        if (this.socket?.connected === true) {
            this.socket.emit('call_reject', { callId });
        }
    }
    endCall(callId) {
        if (this.socket?.connected === true) {
            this.socket.emit('call_end', { callId });
        }
    }
    // Status methods
    updateStatus(status) {
        if (this.socket?.connected === true) {
            this.socket.emit('status_update', { status });
        }
    }
    // Utility methods
    isSocketConnected() {
        return this.isConnected && this.socket?.connected === true;
    }
    getSocketId() {
        return this.socket?.id;
    }
    updateToken(token) {
        this.config.token = token;
        if (this.socket?.connected) {
            this.socket.auth = { token };
        }
    }
    // Cleanup
    destroy() {
        this.disconnect();
        this.eventHandlers.clear();
    }
}
// Create singleton instance
let socketServiceInstance = null;
export const createSocketService = (config) => {
    if (socketServiceInstance) {
        socketServiceInstance.destroy();
    }
    socketServiceInstance = new SocketService(config);
    return socketServiceInstance;
};
export const getSocketService = () => {
    return socketServiceInstance;
};
export default SocketService;
//# sourceMappingURL=socket.js.map