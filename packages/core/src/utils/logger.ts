/**
 * 📝 Enhanced Logger Service
 * A comprehensive logging utility for the entire application
 */

// Define severity levels for logging
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 100 // Used to disable logging
}

// Configuration interface for the logger
export interface LoggerConfig {
    minLevel: LogLevel;
    useTimestamps: boolean;
    serverReporting: boolean;
    serverEndpoint?: string;
    context?: string; // Component/module/screen name
}

// Define logger interface
export interface Logger {
    debug: (message: string, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string | Error, ...args: unknown[]) => void;
    setContext: (context: string) => Logger;
    withContext: (context: string) => Logger;
    setConfig: (config: Partial<LoggerConfig>) => void;
    createChildLogger: (childContext: string) => Logger;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
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
const formatMessage = (
    level: string,
    message: string,
    context: string,
    useTimestamp: boolean
): string => {
    const timestamp = useTimestamp ? `[${new Date().toISOString()}]` : '';
    return `${timestamp}[${level}][${context}] ${message}`;
};

// Helper function to get context with fallback
const getContext = (context: string | undefined): string => {
    return context != null && context.length > 0 ? context : 'App';
};

// Error reporting service (can be extended to send to Sentry, etc.)
const reportErrorToServer = async (
    error: string | Error,
    context: string,
    endpoint?: string
): Promise<void> => {
    if (endpoint == null || endpoint === '') return;

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
    } catch {
        // Silent fail for error reporting to avoid infinite loops
    }
};

// Create logger class
class LoggerService implements Logger {
    private config: LoggerConfig;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config
        };
    }

    public debug(message: string, ...args: unknown[]): void {
        if (this.config.minLevel <= LogLevel.DEBUG) {
            const formattedMsg = formatMessage(
                'DEBUG',
                message,
                getContext(this.config.context),
                this.config.useTimestamps
            );
            console.warn(formattedMsg, ...args); // Use console.warn for debug level
        }
    }

    public info(message: string, ...args: unknown[]): void {
        if (this.config.minLevel <= LogLevel.INFO) {
            const formattedMsg = formatMessage(
                'INFO',
                message,
                getContext(this.config.context),
                this.config.useTimestamps
            );
            console.warn(formattedMsg, ...args); // Use console.warn for info level
        }
    }

    public warn(message: string, ...args: unknown[]): void {
        if (this.config.minLevel <= LogLevel.WARN) {
            const formattedMsg = formatMessage(
                'WARN',
                message,
                getContext(this.config.context),
                this.config.useTimestamps
            );
            console.warn(formattedMsg, ...args);
        }
    }

    public error(message: string | Error, ...args: unknown[]): void {
        if (this.config.minLevel <= LogLevel.ERROR) {
            const errorMsg = message instanceof Error ? message.message : message;
            const formattedMsg = formatMessage(
                'ERROR',
                errorMsg,
                getContext(this.config.context),
                this.config.useTimestamps
            );
            console.error(formattedMsg, ...(message instanceof Error ? [message, ...args] : args));

            // Report error to server if enabled
            if (this.config.serverReporting) {
                const endpoint: string = this.config.serverEndpoint as string;
                void reportErrorToServer(message, getContext(this.config.context), endpoint);
            }
        }
    }

    public setContext(context: string): Logger {
        this.config.context = context;
        return this;
    }

    public withContext(context: string): Logger {
        return this.createChildLogger(context);
    }

    public setConfig(config: Partial<LoggerConfig>): void {
        this.config = {
            ...this.config,
            ...config
        };
    }

    public createChildLogger(childContext: string): Logger {
        const parentContext = getContext(this.config.context);
        return new LoggerService({
            ...this.config,
            context: `${parentContext}:${childContext}`
        });
    }
}

// Create root logger instance
export const logger = new LoggerService();

// Create pre-configured loggers for common modules
export const apiLogger = logger.createChildLogger('API');
export const authLogger = logger.createChildLogger('Auth');
export const uiLogger = logger.createChildLogger('UI');
export const navigationLogger = logger.createChildLogger('Navigation');
export const storageLogger = logger.createChildLogger('Storage');
export const analyticsLogger = logger.createChildLogger('Analytics');
export const notificationLogger = logger.createChildLogger('Notifications');
export const mediaLogger = logger.createChildLogger('Media');

// Export default logger
export default logger;