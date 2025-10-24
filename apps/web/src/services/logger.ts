/**
 * Logger Service for Web Application
 * Provides consistent logging across the application
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
class Logger {
    logLevel;
    isDevelopment;
    sessionId;
    constructor() {
        this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.sessionId = this.generateSessionId();
    }
    getUserId() {
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
    generateSessionId() {
        return `session_${Date.now().toString()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    shouldLog(level) {
        const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex <= currentLevelIndex;
    }
    formatMessage(level, message, context) {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            sessionId: this.sessionId,
            userId: this.getUserId(),
        };
    }
    log(level, message, context) {
        if (!this.shouldLog(level))
            return;
        const logEntry = this.formatMessage(level, message, context);
        // Console logging
        if (this.isDevelopment) {
            const consoleMethod = level === LogLevel.ERROR ? 'error' :
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
    async sendToExternalService(logEntry) {
        try {
            // Send to your logging service (e.g., Sentry, LogRocket, etc.)
            if (process.env['NEXT_PUBLIC_SENTRY_DSN'] !== undefined) {
                // Sentry integration would go here
                // eslint-disable-next-line no-console
                console.log('Sending log to external service:', logEntry);
            }
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to send log to external service:', error);
        }
    }
    // Public logging methods
    error(message, context) {
        this.log(LogLevel.ERROR, message, context);
    }
    warn(message, context) {
        this.log(LogLevel.WARN, message, context);
    }
    info(message, context) {
        this.log(LogLevel.INFO, message, context);
    }
    debug(message, context) {
        this.log(LogLevel.DEBUG, message, context);
    }
    // Specialized logging methods
    apiCall(method, url, status, duration) {
        this.info(`API ${method} ${url}`, {
            method,
            url,
            status,
            duration: duration !== undefined ? `${duration.toString()}ms` : undefined,
        });
    }
    userAction(action, context) {
        this.info(`User action: ${action}`, context);
    }
    performance(metric, value, context) {
        this.info(`Performance: ${metric}`, {
            metric,
            value,
            ...context,
        });
    }
    security(event, context) {
        this.warn(`Security event: ${event}`, context);
    }
    // Error tracking
    trackError(error, context) {
        this.error(`Error: ${error.message}`, {
            name: error.name,
            stack: error.stack,
            ...context,
        });
    }
    // Analytics events
    trackEvent(eventName, properties) {
        this.info(`Analytics event: ${eventName}`, properties);
    }
    // Page tracking
    trackPage(page, context) {
        this.info(`Page view: ${page}`, context);
    }
    // Feature usage
    trackFeature(feature, action, context) {
        this.info(`Feature usage: ${feature}.${action}`, context);
    }
    // Network requests
    trackRequest(url, method, status, duration) {
        this.info(`Network request: ${method} ${url}`, {
            url,
            method,
            status,
            duration: `${duration.toString()}ms`,
        });
    }
    // Authentication events
    trackAuth(event, context) {
        this.info(`Auth event: ${event}`, context);
    }
    // Chat events
    trackChat(event, matchId, context) {
        this.info(`Chat event: ${event}`, {
            matchId,
            ...context,
        });
    }
    // Match events
    trackMatch(event, petId, context) {
        this.info(`Match event: ${event}`, {
            petId,
            ...context,
        });
    }
    // Premium events
    trackPremium(event, context) {
        this.info(`Premium event: ${event}`, context);
    }
    // Utility methods
    setLogLevel(level) {
        this.logLevel = level;
    }
    getSessionId() {
        return this.sessionId;
    }
    // Create a child logger with additional context
    child(context) {
        const childLogger = new Logger();
        const originalLog = childLogger.log.bind(childLogger);
        childLogger.log = (level, message, childContext) => {
            originalLog(level, message, { ...context, ...childContext });
        };
        return childLogger;
    }
}
// Create singleton instance
const logger = new Logger();
// Export both the instance and the class
export { Logger };
export { logger };
export default logger;
//# sourceMappingURL=logger.js.map