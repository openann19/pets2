/**
 * Logger Service for Web Application
 * Provides consistent logging across the application
 */
declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
interface LoggerContext {
    [key: string]: unknown;
}
type LoggerContextOrUndefined = LoggerContext | undefined;
declare class Logger {
    private logLevel;
    private isDevelopment;
    private sessionId;
    constructor();
    private getUserId;
    private generateSessionId;
    private shouldLog;
    private formatMessage;
    private log;
    private sendToExternalService;
    error(message: string, context?: LoggerContextOrUndefined): void;
    warn(message: string, context?: LoggerContextOrUndefined): void;
    info(message: string, context?: LoggerContextOrUndefined): void;
    debug(message: string, context?: LoggerContextOrUndefined): void;
    apiCall(method: string, url: string, status?: number, duration?: number): void;
    userAction(action: string, context?: LoggerContextOrUndefined): void;
    performance(metric: string, value: number, context?: LoggerContextOrUndefined): void;
    security(event: string, context?: LoggerContextOrUndefined): void;
    trackError(error: Error, context?: LoggerContextOrUndefined): void;
    trackEvent(eventName: string, properties?: LoggerContextOrUndefined): void;
    trackPage(page: string, context?: LoggerContextOrUndefined): void;
    trackFeature(feature: string, action: string, context?: LoggerContextOrUndefined): void;
    trackRequest(url: string, method: string, status: number, duration: number): void;
    trackAuth(event: string, context?: LoggerContextOrUndefined): void;
    trackChat(event: string, matchId?: string, context?: LoggerContextOrUndefined): void;
    trackMatch(event: string, petId?: string, context?: LoggerContextOrUndefined): void;
    trackPremium(event: string, context?: LoggerContextOrUndefined): void;
    setLogLevel(level: LogLevel): void;
    getSessionId(): string;
    child(context: LoggerContext): Logger;
}
declare const logger: Logger;
export { Logger };
export { logger };
export default logger;
//# sourceMappingURL=logger.d.ts.map