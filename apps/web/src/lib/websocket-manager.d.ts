import { Socket } from 'socket.io-client';
export interface WebSocketConfig {
    maxReconnectAttempts?: number;
    reconnectDelay?: number;
    enableLogging?: boolean;
}
export declare class WebSocketManager {
    private static instance;
    private socket;
    private userId;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    private reconnectTimeout;
    private isConnecting;
    private messageQueue;
    private enableLogging;
    private heartbeatInterval;
    private lastPingTime;
    private connectionPromise;
    private constructor();
    static getInstance(config?: WebSocketConfig): WebSocketManager;
    connect(userId: string, token: string): Promise<Socket>;
    private createConnection;
    private setupEventHandlers;
    private setupCustomEventHandlers;
    private scheduleReconnection;
    private startHeartbeat;
    private stopHeartbeat;
    private processMessageQueue;
    private getStoredToken;
    emit(event: string, data: unknown): void;
    on(event: string, callback: Function): void;
    off(event: string, callback?: Function): void;
    once(event: string, callback: Function): void;
    disconnect(clearUser?: boolean): void;
    getConnectionStatus(): {
        connected: boolean;
        connecting: boolean;
        reconnectAttempts: number;
        userId: string | null;
        socketId: string | null;
        queuedMessages: number;
    };
    private dispatchConnectionEvent;
    private dispatchCustomEvent;
    private log;
    static destroy(): void;
}
export declare const getWebSocketManager: (config?: WebSocketConfig) => WebSocketManager;
//# sourceMappingURL=websocket-manager.d.ts.map