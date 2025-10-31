import { io, Socket } from 'socket.io-client'
import { logger } from '@pawfectmatch/core';

interface WebSocketConfig {
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  enableLogging?: boolean;
}

export class WebSocketManager {
    static instance: WebSocketManager | null = null;
    socket: Socket | null = null;
    userId: string | null = null;
    reconnectAttempts: number = 0;
    maxReconnectAttempts: number = 10;
    reconnectDelay: number = 1000;
    reconnectTimeout: NodeJS.Timeout | null = null;
    isConnecting: boolean = false;
    messageQueue: unknown[] = [];
    enableLogging: boolean = true;
    heartbeatInterval: NodeJS.Timeout | null = null;
    lastPingTime: number = 0;
    connectionPromise: Promise<Socket> | null = null;

    constructor(config?: WebSocketConfig) {
        if (config) {
            this.maxReconnectAttempts = config.maxReconnectAttempts ?? 10;
            this.reconnectDelay = config.reconnectDelay ?? 1000;
            this.enableLogging = config.enableLogging ?? true;
        }
    }

    static getInstance(config?: WebSocketConfig): WebSocketManager {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager(config);
        }
        return WebSocketManager.instance;
    }

    async connect(userId: string, token: string): Promise<Socket> {
        // If already connected with same user, return existing socket
        if (this.socket?.connected && this.userId === userId) {
            this.log('info', 'Already connected with same user');
            return this.socket;
        }
        // If connection in progress, wait for it
        if (this.isConnecting && this.connectionPromise) {
            this.log('info', 'Connection already in progress, waiting...');
            return this.connectionPromise;
        }
        // Create connection promise
        this.connectionPromise = this.createConnection(userId, token);
        return this.connectionPromise;
    }

    async createConnection(userId: string, token: string): Promise<Socket> {
        return new Promise((resolve, reject) => {
            this.isConnecting = true;
            this.userId = userId;
            // Clean up existing connection
            this.disconnect(false);
            const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
                process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
                'http://localhost:5001';
            this.log('info', `Connecting to WebSocket at ${socketUrl}`);
            this.socket = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 10000,
                reconnectionAttempts: this.maxReconnectAttempts,
                timeout: 20000,
                upgrade: true,
                rememberUpgrade: true,
            });
            this.setupEventHandlers(resolve, reject);
        });
    }
    setupEventHandlers(resolve, reject) {
        if (!this.socket)
            return;
        // Connection success
        this.socket.on('connect', () => {
            this.log('success', `Connected successfully (ID: ${this.socket?.id})`);
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.connectionPromise = null;
            // Join user room
            if (this.userId) {
                this.socket?.emit('join_user_room', { userId: this.userId });
            }
            // Process message queue
            this.processMessageQueue();
            // Start heartbeat
            this.startHeartbeat();
            // Dispatch custom event for components
            this.dispatchConnectionEvent('connected');
            resolve(this.socket);
        });
        // Connection error
        this.socket.on('connect_error', (error) => {
            this.log('error', `Connection error: ${error.message}`);
            this.isConnecting = false;
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.log('error', 'Max reconnection attempts reached');
                this.connectionPromise = null;
                reject(new Error('Failed to connect after maximum attempts'));
                this.dispatchConnectionEvent('failed');
            }
            else {
                this.scheduleReconnection();
            }
        });
        // Disconnection
        this.socket.on('disconnect', (reason) => {
            this.log('warn', `Disconnected: ${reason}`);
            this.stopHeartbeat();
            this.dispatchConnectionEvent('disconnected');
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.scheduleReconnection();
            }
        });
        // Reconnection events
        this.socket.on('reconnect', (attemptNumber) => {
            this.log('success', `Reconnected after ${attemptNumber} attempts`);
            this.reconnectAttempts = 0;
            this.processMessageQueue();
            this.startHeartbeat();
            this.dispatchConnectionEvent('reconnected');
        });
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            this.log('info', `Reconnection attempt ${attemptNumber}`);
            this.reconnectAttempts = attemptNumber;
        });
        this.socket.on('reconnect_failed', () => {
            this.log('error', 'Reconnection failed permanently');
            this.dispatchConnectionEvent('failed');
        });
        // Ping/Pong for connection health
        this.socket.on('pong', () => {
            const latency = Date.now() - this.lastPingTime;
            this.log('debug', `Heartbeat latency: ${latency}ms`);
        });
        // Custom events
        this.setupCustomEventHandlers();
    }

    setupCustomEventHandlers(): void {
        if (!this.socket)
            return;
        // Handle server errors
        this.socket.on('error', (error: unknown) => {
            this.log('error', `Server error: ${error instanceof Error ? error.message : error}`);
            this.dispatchCustomEvent('socket_error', error);
        });
        // Handle authentication errors
        this.socket.on('auth_error', (data: unknown) => {
            this.log('error', 'Authentication error, disconnecting...');
            this.disconnect(true);
            this.dispatchCustomEvent('auth_error', data);
        });
    }

    scheduleReconnection(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 30000);
        this.log('info', `Scheduling reconnection in ${delay}ms`);
        this.reconnectTimeout = setTimeout(() => {
            if (this.userId && !this.socket?.connected) {
                const token = this.getStoredToken();
                if (token) {
                    this.connect(this.userId, token);
                }
            }
        }, delay);
    }

    startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.lastPingTime = Date.now();
                this.socket.emit('ping');
            }
        }, 25000); // Every 25 seconds
    }

    stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    processMessageQueue(): void {
        if (!this.socket?.connected)
            return;
        const now = Date.now();
        const maxAge = 30000; // 30 seconds
        // Filter out old messages and send remaining ones
        this.messageQueue = this.messageQueue.filter(msg => {
            if (now - (msg as { timestamp: number }).timestamp > maxAge) {
                this.log('debug', `Dropping old queued message: ${(msg as { event: string }).event}`);
                return false;
            }
            this.log('debug', `Sending queued message: ${(msg as { event: string }).event}`);
            this.socket?.emit((msg as { event: string }).event, (msg as { data: unknown }).data);
            return false;
        });
    }

    getStoredToken(): string | null {
        if (typeof window === 'undefined')
            return null;
        return localStorage.getItem('accessToken');
    }

    // Public methods
    emit(event: string, data: unknown): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        }
        else {
            // Queue message for later delivery
            this.messageQueue.push({
                event,
                data,
                timestamp: Date.now()
            });
            this.log('debug', `Message queued: ${event}`);
        }
    }

    on(event: string, callback: (...args: unknown[]) => void): void {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: unknown[]) => void): void {
        if (callback) {
            this.socket?.off(event, callback);
        }
        else {
            this.socket?.off(event);
        }
    }

    once(event: string, callback: (...args: unknown[]) => void): void {
        this.socket?.once(event, callback);
    }

    disconnect(clearUser: boolean = true): void {
        this.log('info', 'Disconnecting WebSocket');
        this.stopHeartbeat();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        if (clearUser) {
            this.userId = null;
        }
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.connectionPromise = null;
        this.dispatchConnectionEvent('disconnected');
    }

    getConnectionStatus(): {
        connected: boolean;
        connecting: boolean;
        reconnectAttempts: number;
        userId: string | null;
        socketId: string | null;
        queuedMessages: number;
    } {
        return {
            connected: this.socket?.connected || false,
            connecting: this.isConnecting,
            reconnectAttempts: this.reconnectAttempts,
            userId: this.userId,
            socketId: this.socket?.id || null,
            queuedMessages: this.messageQueue.length
        };
    }

    // Event dispatching for UI updates
    dispatchConnectionEvent(status: string): void {
        if (typeof window === 'undefined')
            return;
        window.dispatchEvent(new CustomEvent('websocket_status', {
            detail: { status, manager: this }
        }));
    }

    dispatchCustomEvent(type: string, data: unknown): void {
        if (typeof window === 'undefined')
            return;
        window.dispatchEvent(new CustomEvent(`websocket_${type}`, {
            detail: data
        }));
    }

    // Logging
    log(level: 'error' | 'warn' | 'info' | 'debug' | 'success', message: string): void {
        if (!this.enableLogging)
            return;
        const timestamp = new Date().toISOString();
        const prefix = '[WebSocket]';
        switch (level) {
            case 'error':
                logger.error(`${prefix} ${message}`, { timestamp });
                break;
            case 'warn':
                logger.warn(`${prefix} ${message}`, { timestamp });
                break;
            case 'debug':
                if (process.env.NODE_ENV === 'development') {
                    logger.debug(`${prefix} ${message}`, { timestamp });
                }
                break;
            case 'success':
                logger.info(`${prefix} ${message}`, { color: 'green', timestamp });
                break;
            default:
                logger.info(`${prefix} ${message}`, { timestamp });
        }
    }

    // Singleton cleanup
    static destroy(): void {
        if (WebSocketManager.instance) {
            WebSocketManager.instance.disconnect();
            WebSocketManager.instance = null;
        }
    }
}
// Export singleton getter for convenience
export const getWebSocketManager = (config?: WebSocketConfig): WebSocketManager => WebSocketManager.getInstance(config);