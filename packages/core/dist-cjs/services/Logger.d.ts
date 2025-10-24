/**
 * Centralized Logging Service
 * Production-grade logging with structured output, levels, and multiple transports
 */
interface MemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
}
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: {
        userId?: string;
        sessionId?: string;
        component?: string;
        action?: string;
        requestId?: string;
        metadata?: Record<string, unknown>;
    };
    error?: {
        name: string;
        message: string;
        stack?: string | undefined;
        code?: string | number | undefined;
    };
    performance?: {
        duration: number;
        memoryUsage?: MemoryUsage;
    };
}
export interface LogTransport {
    name: string;
    write: (entry: LogEntry) => Promise<void> | void;
    shouldLog: (level: LogLevel) => boolean;
}
export interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableFile: boolean;
    enableRemote: boolean;
    filePath?: string;
    remoteEndpoint?: string;
    maxFileSize?: number;
    maxFiles?: number;
    enablePerformanceLogging: boolean;
    enableErrorTracking: boolean;
}
declare class LoggerService {
    private config;
    private transports;
    private logQueue;
    private isProcessing;
    private performanceMarks;
    constructor(config?: Partial<LoggerConfig>);
    /**
     * Update logger configuration
     */
    updateConfig(config: Partial<LoggerConfig>): void;
    /**
     * Log debug message
     */
    debug(message: string, context?: LogEntry['context']): void;
    /**
     * Log info message
     */
    info(message: string, context?: LogEntry['context']): void;
    /**
     * Log warning message
     */
    warn(message: string, context?: LogEntry['context']): void;
    /**
     * Log error message
     */
    error(message: string, error?: Error, context?: LogEntry['context']): void;
    /**
     * Log critical message
     */
    critical(message: string, error?: Error, context?: LogEntry['context']): void;
    /**
     * Start performance measurement
     */
    startPerformance(label: string): void;
    /**
     * End performance measurement and log
     */
    endPerformance(label: string, context?: LogEntry['context']): void;
    /**
     * Log API request
     */
    logApiRequest(method: string, url: string, statusCode: number, duration: number, context?: LogEntry['context']): void;
    /**
     * Log user action
     */
    logUserAction(action: string, userId: string, metadata?: Record<string, unknown>, context?: LogEntry['context']): void;
    /**
     * Log security event
     */
    logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogEntry['context']): void;
    /**
     * Get log statistics
     */
    getStats(): {
        totalLogs: number;
        byLevel: Record<LogLevel, number>;
        byComponent: Record<string, number>;
        recentErrors: LogEntry[];
    };
    /**
     * Clear log queue
     */
    clearQueue(): void;
    /**
     * Main logging method
     */
    private log;
    /**
     * Check if we should log this level
     */
    private shouldLog;
    /**
     * Add log entry to queue
     */
    private addToQueue;
    /**
     * Process logs through transports
     */
    private processLogs;
    /**
     * Write log entry to all transports
     */
    private writeToTransports;
    /**
     * Setup log transports
     */
    private setupTransports;
    /**
     * Create console transport
     */
    private createConsoleTransport;
    /**
     * Create file transport
     */
    private createFileTransport;
    /**
     * Create remote transport
     */
    private createRemoteTransport;
    /**
     * Format message for console output
     */
    private formatConsoleMessage;
    /**
     * Format message for JSON output
     */
    private formatJsonMessage;
    /**
     * Setup global error handlers
     */
    private setupGlobalHandlers;
}
export declare const logger: LoggerService;
export default logger;
//# sourceMappingURL=Logger.d.ts.map