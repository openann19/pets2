"use strict";
/**
 * 📝 Enhanced Logger Service
 * A comprehensive logging utility for the entire application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaLogger = exports.notificationLogger = exports.analyticsLogger = exports.storageLogger = exports.navigationLogger = exports.uiLogger = exports.authLogger = exports.apiLogger = exports.logger = exports.LogLevel = void 0;
// Define severity levels for logging
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 100] = "NONE"; // Used to disable logging
})(LogLevel || (exports.LogLevel = LogLevel = {}));
// Default configuration
const DEFAULT_CONFIG = {
    minLevel: LogLevel.INFO,
    useTimestamps: true,
    serverReporting: false,
    context: 'App'
};
// In development mode, allow a lower minimum log level
if (process.env['NODE_ENV'] === 'development') {
    DEFAULT_CONFIG.minLevel = LogLevel.DEBUG;
}
// Helper function to format a log message
const formatMessage = (level, message, context, useTimestamp) => {
    const timestamp = useTimestamp ? `[${new Date().toISOString()}]` : '';
    return `${timestamp}[${level}][${context}] ${message}`;
};
// Helper function to get context with fallback
const getContext = (context) => {
    return context != null && context.length > 0 ? context : 'App';
};
// Error reporting service (can be extended to send to Sentry, etc.)
const reportErrorToServer = async (error, context, endpoint) => {
    if (endpoint == null || endpoint === '')
        return;
    try {
        const errorObj = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { message: error };
        await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: errorObj,
                context,
                timestamp: new Date().toISOString()
            })
        });
    }
    catch {
        // Silent fail for error reporting to avoid infinite loops
    }
};
// Create logger class
class LoggerService {
    config;
    constructor(config = {}) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config
        };
    }
    debug(message, ...args) {
        if (this.config.minLevel <= LogLevel.DEBUG) {
            const formattedMsg = formatMessage('DEBUG', message, getContext(this.config.context), this.config.useTimestamps);
            console.warn(formattedMsg, ...args); // Use console.warn for debug level
        }
    }
    info(message, ...args) {
        if (this.config.minLevel <= LogLevel.INFO) {
            const formattedMsg = formatMessage('INFO', message, getContext(this.config.context), this.config.useTimestamps);
            console.warn(formattedMsg, ...args); // Use console.warn for info level
        }
    }
    warn(message, ...args) {
        if (this.config.minLevel <= LogLevel.WARN) {
            const formattedMsg = formatMessage('WARN', message, getContext(this.config.context), this.config.useTimestamps);
            console.warn(formattedMsg, ...args);
        }
    }
    error(message, ...args) {
        if (this.config.minLevel <= LogLevel.ERROR) {
            const errorMsg = message instanceof Error ? message.message : message;
            const formattedMsg = formatMessage('ERROR', errorMsg, getContext(this.config.context), this.config.useTimestamps);
            console.error(formattedMsg, ...(message instanceof Error ? [message, ...args] : args));
            // Report error to server if enabled
            if (this.config.serverReporting) {
                const endpoint = this.config.serverEndpoint;
                void reportErrorToServer(message, getContext(this.config.context), endpoint);
            }
        }
    }
    setContext(context) {
        this.config.context = context;
        return this;
    }
    withContext(context) {
        return this.createChildLogger(context);
    }
    setConfig(config) {
        this.config = {
            ...this.config,
            ...config
        };
    }
    createChildLogger(childContext) {
        const parentContext = getContext(this.config.context);
        return new LoggerService({
            ...this.config,
            context: `${parentContext}:${childContext}`
        });
    }
}
// Create root logger instance
exports.logger = new LoggerService();
// Create pre-configured loggers for common modules
exports.apiLogger = exports.logger.createChildLogger('API');
exports.authLogger = exports.logger.createChildLogger('Auth');
exports.uiLogger = exports.logger.createChildLogger('UI');
exports.navigationLogger = exports.logger.createChildLogger('Navigation');
exports.storageLogger = exports.logger.createChildLogger('Storage');
exports.analyticsLogger = exports.logger.createChildLogger('Analytics');
exports.notificationLogger = exports.logger.createChildLogger('Notifications');
exports.mediaLogger = exports.logger.createChildLogger('Media');
// Export default logger
exports.default = exports.logger;
