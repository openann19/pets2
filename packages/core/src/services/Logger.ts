/**
 * Centralized Logging Service
 * Production-grade logging with structured output, levels, and multiple transports
 */

/// <reference types="node" />

import { addEventListenerSafely, getWindowObject } from '../utils/environment';

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

class LoggerService {
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private logQueue: LogEntry[] = [];
  private isProcessing = false;
  private performanceMarks = new Map<string, number>();

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: 'info',
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      enablePerformanceLogging: true,
      enableErrorTracking: true,
      ...config,
    };

    this.setupTransports();
    this.setupGlobalHandlers();
  }

  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupTransports();
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogEntry['context']): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogEntry['context']): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogEntry['context']): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogEntry['context']): void {
    this.log('error', message, context, error);
  }

  /**
   * Log critical message
   */
  critical(message: string, error?: Error, context?: LogEntry['context']): void {
    this.log('critical', message, context, error);
  }

  /**
   * Start performance measurement
   */
  startPerformance(label: string): void {
    if (this.config.enablePerformanceLogging) {
      this.performanceMarks.set(label, Date.now());
    }
  }

  /**
   * End performance measurement and log
   */
  endPerformance(label: string, context?: LogEntry['context']): void {
    if (this.config.enablePerformanceLogging) {
      const startTime = this.performanceMarks.get(label);
      if (startTime != null) {
        const duration = Date.now() - startTime;
        this.log('info', `Performance: ${label}`, {
          ...context,
          metadata: {
            ...context?.metadata,
            performance: {
              duration,
              memoryUsage: process.memoryUsage(),
            },
          },
        });
        this.performanceMarks.delete(label);
      }
    }
  }

  /**
   * Log API request
   */
  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: LogEntry['context']
  ): void {
    const level = statusCode >= 400 ? 'error' : 'info';
    this.log(level, `API ${method} ${url}`, {
      ...context,
      action: 'api_request',
      metadata: {
        method,
        url,
        statusCode,
        duration,
      },
    });
  }

  /**
   * Log user action
   */
  logUserAction(
    action: string,
    userId: string,
    metadata?: Record<string, unknown>,
    context?: LogEntry['context']
  ): void {
    this.log('info', `User action: ${action}`, {
      ...context,
      userId,
      action: 'user_action',
      metadata: {
        action,
        ...metadata,
      },
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: LogEntry['context']
  ): void {
    const level = severity === 'critical' ? 'critical' : 
                  severity === 'high' ? 'error' : 
                  severity === 'medium' ? 'warn' : 'info';
    
    this.log(level, `Security event: ${event}`, {
      ...context,
      action: 'security_event',
      metadata: {
        event,
        severity,
      },
    });
  }

  /**
   * Get log statistics
   */
  getStats(): {
    totalLogs: number;
    byLevel: Record<LogLevel, number>;
    byComponent: Record<string, number>;
    recentErrors: LogEntry[];
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentErrors = this.logQueue.filter(
      entry => entry.level === 'error' || entry.level === 'critical'
    ).filter(entry => entry.timestamp >= oneHourAgo);
    
    const byLevel = this.logQueue.reduce<Record<LogLevel, number>>((acc, entry) => {
      acc[entry.level] += 1;
      return acc;
    }, { debug: 0, info: 0, warn: 0, error: 0, critical: 0 });

    const byComponent = this.logQueue.reduce<Record<string, number>>((acc, entry) => {
      const component = entry.context?.component ?? 'unknown';
      acc[component] = (acc[component] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalLogs: this.logQueue.length,
      byLevel,
      byComponent,
      recentErrors: recentErrors.slice(-10),
    };
  }

  /**
   * Clear log queue
   */
  clearQueue(): void {
    this.logQueue = [];
  }

  /**
   * Main logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogEntry['context'],
    error?: Error
  ): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: {
        ...context,
        component: context?.component ?? 'unknown',
      },
    };

    // Add error information if provided
    if (error != null) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: 'code' in error ? (error as { code: string | number }).code : undefined,
      };
    }

    // Add to queue
    this.addToQueue(entry);

    // Process logs asynchronously
    void this.processLogs();
  }

  /**
   * Check if we should log this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Add log entry to queue
   */
  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);
    
    // Maintain queue size (keep last 1000 entries)
    if (this.logQueue.length > 1000) {
      this.logQueue = this.logQueue.slice(-1000);
    }
  }

  /**
   * Process logs through transports
   */
  private async processLogs(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const entries = [...this.logQueue];
      this.logQueue = [];

      for (const entry of entries) {
        await this.writeToTransports(entry);
      }
    } catch (error) {
      console.error('Error processing logs:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Write log entry to all transports
   */
  private async writeToTransports(entry: LogEntry): Promise<void> {
    const promises = this.transports
      .filter(transport => transport.shouldLog(entry.level))
      .map(async (transport) => {
        try {
          await transport.write(entry);
        } catch (error) {
          console.error(`Transport ${transport.name} failed:`, error);
        }
      });

    await Promise.allSettled(promises);
  }

  /**
   * Setup log transports
   */
  private setupTransports(): void {
    this.transports = [];

    // Console transport
    if (this.config.enableConsole) {
      this.transports.push(this.createConsoleTransport());
    }

    // File transport
    if (this.config.enableFile && this.config.filePath != null && this.config.filePath !== '') {
      this.transports.push(this.createFileTransport());
    }

    // Remote transport
    if (this.config.enableRemote && this.config.remoteEndpoint != null && this.config.remoteEndpoint !== '') {
      this.transports.push(this.createRemoteTransport());
    }
  }

  /**
   * Create console transport
   */
  private createConsoleTransport(): LogTransport {
    return {
      name: 'console',
      shouldLog: (level) => this.shouldLog(level),
      write: (entry) => {
        const formattedMessage = this.formatConsoleMessage(entry);
        
        switch (entry.level) {
          case 'debug':
            // eslint-disable-next-line no-console
            console.debug(formattedMessage);
            break;
          case 'info':
            // eslint-disable-next-line no-console
            console.info(formattedMessage);
            break;
          case 'warn':
            console.warn(formattedMessage);
            break;
          case 'error':
          case 'critical':
            console.error(formattedMessage);
            break;
        }
      },
    };
  }

  /**
   * Create file transport
   */
  private createFileTransport(): LogTransport {
    return {
      name: 'file',
      shouldLog: (level) => this.shouldLog(level),
      write: (entry) => {
        // In a real implementation, this would write to a file
        // For now, we'll just log to console in development
        if (process.env['NODE_ENV'] !== 'production') {
          // eslint-disable-next-line no-console
          console.log('File log:', this.formatJsonMessage(entry));
        }
      },
    };
  }

  /**
   * Create remote transport
   */
  private createRemoteTransport(): LogTransport {
    return {
      name: 'remote',
      shouldLog: (level) => this.shouldLog(level),
      write: (entry) => {
        try {
          // In a real implementation, this would send to a remote logging service
          // For now, we'll just log to console in development
          if (process.env['NODE_ENV'] !== 'production') {
            console.warn('Remote log:', this.formatJsonMessage(entry));
          }
        } catch (error) {
          console.error('Remote logging failed:', error);
        }
      },
    };
  }

  /**
   * Format message for console output
   */
  private formatConsoleMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(8);
    const component = entry.context?.component ?? 'unknown';
    const action = entry.context?.action != null && entry.context.action !== '' ? ` [${entry.context.action}]` : '';
    
    let message = `[${timestamp}] ${level} ${component}${action}: ${entry.message}`;
    
    if (entry.error != null) {
      message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack != null && entry.error.stack !== '' && process.env['NODE_ENV'] !== 'production') {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }
    
    if (entry.performance != null) {
      message += `\n  Performance: ${String(entry.performance.duration)}ms`;
    }
    
    if (entry.context?.metadata != null && Object.keys(entry.context.metadata).length > 0) {
      message += `\n  Metadata: ${JSON.stringify(entry.context.metadata, null, 2)}`;
    }
    
    return message;
  }

  /**
   * Format message for JSON output
   */
  private formatJsonMessage(entry: LogEntry): string {
    return JSON.stringify(entry, null, 2);
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    if (this.config.enableErrorTracking) {
      const browserWindow = getWindowObject();
      if (browserWindow == null) {
        return;
      }

      const handleUnhandledRejection = (event: Event): void => {
        if (!isPromiseRejectionEvent(event)) {
          return;
        }

        const reason = event.reason instanceof Error ? event.reason : undefined;
        this.error('Unhandled Promise Rejection', reason, {
          component: 'Global',
          action: 'unhandled_promise_rejection',
          metadata: {
            reason: event.reason,
            promise: event.promise,
          },
        });
      };

      const handleGlobalError = (event: Event): void => {
        if (!isErrorEvent(event)) {
          return;
        }

        const error = event.error instanceof Error ? event.error : undefined;
        this.error('Global Error', error, {
          component: 'Global',
          action: 'global_error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      };

      addEventListenerSafely(browserWindow, 'unhandledrejection', handleUnhandledRejection);
      addEventListenerSafely(browserWindow, 'error', handleGlobalError);
    }
  }
}

// Export singleton instance
export const logger = new LoggerService();
export default logger;

const isPromiseRejectionEvent = (event: Event): event is PromiseRejectionEvent => {
  return 'reason' in event && 'promise' in event;
};

const isErrorEvent = (event: Event): event is ErrorEvent => {
  return 'error' in event && 'filename' in event;
};
