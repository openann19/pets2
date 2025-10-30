/**
 * Logger Service for Web Application
 * Provides consistent logging across the application
 */

enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  sessionId: string;
  userId?: string;
}

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  logLevel: LogLevel;
  isDevelopment: boolean;
  sessionId: string;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sessionId = this.generateSessionId();
  }

  getUserId(): string | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    try {
      const userId = window.localStorage.getItem('userId');
      if (userId === null) {
        return undefined;
      }
      if (userId === '') {
        return undefined;
      }
      return userId;
    }
    catch {
      return undefined;
    }
  }

  generateSessionId(): string {
    return `session_${Date.now().toString()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  formatMessage(level: string, message: string, context?: LogContext): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      sessionId: this.sessionId,
      userId: this.getUserId(),
    };
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = this.formatMessage(level, message, context);

    // Console logging
    if (this.isDevelopment) {
      const consoleMethod: 'error' | 'warn' | 'info' | 'log' = level === LogLevel.ERROR ? 'error' :
        level === LogLevel.WARN ? 'warn' :
          level === LogLevel.INFO ? 'info' : 'log';

      if (context !== undefined) {
        // eslint-disable-next-line no-console
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context);
      }
      else {
        // eslint-disable-next-line no-console
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
      }
    }

    // Send to external logging service in production
    if (!this.isDevelopment && typeof window !== 'undefined') {
      void this.sendToExternalService(logEntry);
    }
  }

  async sendToExternalService(logEntry: LogEntry): Promise<void> {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, etc.)
      if (process.env.NEXT_PUBLIC_SENTRY_DSN !== undefined) {
        // Sentry integration would go here
        // eslint-disable-next-line no-console
        console.log('Sending log to external service:', logEntry);
      }
    }
    catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to send log to external service:', error);
    }
  }

  // Public logging methods
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Specialized logging methods
  apiCall(method: string, url: string, status: number, duration?: number): void {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      status,
      duration: duration !== undefined ? `${duration.toString()}ms` : undefined,
    });
  }

  userAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, context);
  }

  performance(metric: string, value: number, context?: LogContext): void {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      ...context,
    });
  }

  security(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, context);
  }

  // Error tracking
  trackError(error: Error, context?: LogContext): void {
    this.error(`Error: ${error.message}`, {
      name: error.name,
      stack: error.stack,
      ...context,
    });
  }

  // Analytics events
  trackEvent(eventName: string, properties?: LogContext): void {
    this.info(`Analytics event: ${eventName}`, properties);
  }

  // Page tracking
  trackPage(page: string, context?: LogContext): void {
    this.info(`Page view: ${page}`, context);
  }

  // Feature usage
  trackFeature(feature: string, action: string, context?: LogContext): void {
    this.info(`Feature usage: ${feature}.${action}`, context);
  }

  // Network requests
  trackRequest(url: string, method: string, status: number, duration: number): void {
    this.info(`Network request: ${method} ${url}`, {
      url,
      method,
      status,
      duration: `${duration.toString()}ms`,
    });
  }

  // Authentication events
  trackAuth(event: string, context?: LogContext): void {
    this.info(`Auth event: ${event}`, context);
  }

  // Chat events
  trackChat(event: string, matchId: string, context?: LogContext): void {
    this.info(`Chat event: ${event}`, {
      matchId,
      ...context,
    });
  }

  // Match events
  trackMatch(event: string, petId: string, context?: LogContext): void {
    this.info(`Match event: ${event}`, {
      petId,
      ...context,
    });
  }

  // Premium events
  trackPremium(event: string, context?: LogContext): void {
    this.info(`Premium event: ${event}`, context);
  }

  // Utility methods
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Create a child logger with additional context
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level: LogLevel, message: string, childContext?: LogContext): void => {
      originalLog(level, message, { ...context, ...childContext });
    };
    return childLogger;
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the instance and the class
export { Logger, LogLevel };
export { logger };
export default logger;
