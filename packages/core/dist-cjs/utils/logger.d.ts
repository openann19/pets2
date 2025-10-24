/**
 * 📝 Enhanced Logger Service
 * A comprehensive logging utility for the entire application
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 100
}
export interface LoggerConfig {
    minLevel: LogLevel;
    useTimestamps: boolean;
    serverReporting: boolean;
    serverEndpoint?: string;
    context?: string;
}
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
declare class LoggerService implements Logger {
    private config;
    constructor(config?: Partial<LoggerConfig>);
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string | Error, ...args: unknown[]): void;
    setContext(context: string): Logger;
    withContext(context: string): Logger;
    setConfig(config: Partial<LoggerConfig>): void;
    createChildLogger(childContext: string): Logger;
}
export declare const logger: LoggerService;
export declare const apiLogger: Logger;
export declare const authLogger: Logger;
export declare const uiLogger: Logger;
export declare const navigationLogger: Logger;
export declare const storageLogger: Logger;
export declare const analyticsLogger: Logger;
export declare const notificationLogger: Logger;
export declare const mediaLogger: Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map