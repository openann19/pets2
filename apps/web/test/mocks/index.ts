/**
 * Export all service mocks for easy importing
 */

export * from './apiService';
export * from './logger';
export * from './notificationService';

// Re-export commonly used mocks with shorter names
export {
    MockApiService, createMockApiService as mockApiService
} from './apiService';

export {
    MockLogger,
    loggerAssertions, createMockLogger as mockLogger
} from './logger';

export {
    MockNotificationService,
    mockBrowserNotifications, createMockNotificationService as mockNotificationService, notificationAssertions
} from './notificationService';
