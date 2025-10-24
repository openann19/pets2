/**
 * Mock logger service for testing
 * Provides typed mocks that align with the actual logger interface
 */

interface LogLevel {
    DEBUG: 'debug';
    INFO: 'info';
    WARN: 'warn';
    ERROR: 'error';
}

interface LogEntry {
    level: keyof LogLevel;
    message: string;
    meta?: Record<string, unknown>;
    timestamp: number;
}

/**
 * Mock logger that captures log entries for testing
 */
export class MockLogger {
    private logs: LogEntry[] = [];

    // Jest mock functions
    public debug = jest.fn();
    public info = jest.fn();
    public warn = jest.fn();
    public error = jest.fn();

    constructor() {
        // Set up mock implementations that also track logs
        this.debug.mockImplementation((message: string, meta?: Record<string, unknown>) => {
            this.logs.push({
                level: 'DEBUG',
                message,
                meta,
                timestamp: Date.now(),
            });
        });

        this.info.mockImplementation((message: string, meta?: Record<string, unknown>) => {
            this.logs.push({
                level: 'INFO',
                message,
                meta,
                timestamp: Date.now(),
            });
        });

        this.warn.mockImplementation((message: string, meta?: Record<string, unknown>) => {
            this.logs.push({
                level: 'WARN',
                message,
                meta,
                timestamp: Date.now(),
            });
        });

        this.error.mockImplementation((message: string, meta?: Record<string, unknown>) => {
            this.logs.push({
                level: 'ERROR',
                message,
                meta,
                timestamp: Date.now(),
            });
        });
    }

    /**
     * Get all logged entries
     */
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Get logs by level
     */
    getLogsByLevel(level: keyof LogLevel): LogEntry[] {
        return this.logs.filter(log => log.level === level.toUpperCase());
    }

    /**
     * Get logs containing specific message
     */
    getLogsContaining(message: string): LogEntry[] {
        return this.logs.filter(log => log.message.includes(message));
    }

    /**
     * Check if a message was logged at any level
     */
    wasLogged(message: string, level?: keyof LogLevel): boolean {
        return this.logs.some(log =>
            log.message.includes(message) &&
            (level === undefined || log.level === level.toUpperCase())
        );
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
        this.debug.mockClear();
        this.info.mockClear();
        this.warn.mockClear();
        this.error.mockClear();
    }

    /**
     * Get the last log entry
     */
    getLastLog(): LogEntry | undefined {
        return this.logs[this.logs.length - 1];
    }

    /**
     * Get count of logs by level
     */
    getLogCount(level?: keyof LogLevel): number {
        if (level === undefined) return this.logs.length;
        return this.logs.filter(log => log.level === level.toUpperCase()).length;
    }
}

/**
 * Create a fresh mock logger instance
 */
export function createMockLogger(): MockLogger {
    return new MockLogger();
}

/**
 * Global mock logger instance for tests
 */
export const mockLogger = createMockLogger();

/**
 * Helper functions for common logger test patterns
 */
export const loggerAssertions = {
    /**
     * Assert that an error was logged with specific message
     */
    expectErrorLogged: (logger: MockLogger, message: string) => {
        if (!logger.wasLogged(message, 'ERROR')) {
            throw new Error(`Expected error to be logged with message: "${message}"`);
        }
    },

    /**
     * Assert that a warning was logged with specific message
     */
    expectWarningLogged: (logger: MockLogger, message: string) => {
        if (!logger.wasLogged(message, 'WARN')) {
            throw new Error(`Expected warning to be logged with message: "${message}"`);
        }
    },

    /**
     * Assert that info was logged with specific message
     */
    expectInfoLogged: (logger: MockLogger, message: string) => {
        if (!logger.wasLogged(message, 'INFO')) {
            throw new Error(`Expected info to be logged with message: "${message}"`);
        }
    },

    /**
     * Assert that debug was logged with specific message
     */
    expectDebugLogged: (logger: MockLogger, message: string) => {
        if (!logger.wasLogged(message, 'DEBUG')) {
            throw new Error(`Expected debug to be logged with message: "${message}"`);
        }
    },

    /**
     * Assert that no errors were logged
     */
    expectNoErrors: (logger: MockLogger) => {
        const errorCount = logger.getLogCount('ERROR');
        if (errorCount > 0) {
            const errors = logger.getLogsByLevel('ERROR');
            throw new Error(`Expected no errors, but found ${errorCount.toString()}: ${errors.map(e => e.message).join(', ')}`);
        }
    },

    /**
     * Assert that no warnings were logged
     */
    expectNoWarnings: (logger: MockLogger) => {
        const warnCount = logger.getLogCount('WARN');
        if (warnCount > 0) {
            const warnings = logger.getLogsByLevel('WARN');
            throw new Error(`Expected no warnings, but found ${warnCount.toString()}: ${warnings.map(w => w.message).join(', ')}`);
        }
    },

    /**
     * Assert specific number of logs at a level
     */
    expectLogCount: (logger: MockLogger, level: keyof LogLevel, expectedCount: number) => {
        const actualCount = logger.getLogCount(level);
        if (actualCount !== expectedCount) {
            throw new Error(`Expected ${expectedCount.toString()} ${level} logs, but found ${actualCount.toString()}`);
        }
    },
};