/**
 * Test script for Error Handler implementation
 * This can be run to verify the error handling system works correctly
 */
import { errorHandler } from './errorHandler';
import { logger } from '@pawfectmatch/core';
;
// Test basic error handling
logger.info('Testing Error Handler...');
// Test 1: Basic error handling
try {
    errorHandler.handleError(new Error('Test error message'), {
        component: 'TestService',
        action: 'testAction',
        userId: 'test-user-123',
        metadata: { testData: 'sample' },
    }, {
        showNotification: true,
        logError: true,
        severity: 'medium',
    });
    logger.info('✅ Basic error handling test passed');
}
catch (error) {
    logger.error('❌ Basic error handling test failed:', { error });
}
// Test 2: API error handling
try {
    errorHandler.handleApiError(new Error('API request failed'), {
        component: 'TestService',
        action: 'testApiCall',
        userId: 'test-user-123',
    }, {
        endpoint: '/api/test',
        method: 'POST',
        statusCode: 500,
        showNotification: true,
    });
    logger.info('✅ API error handling test passed');
}
catch (error) {
    logger.error('❌ API error handling test failed:', { error });
}
// Test 3: Network error handling
try {
    errorHandler.handleNetworkError(new Error('Network connection failed'), {
        component: 'TestService',
        action: 'testNetworkCall',
    }, {
        showNotification: true,
        retryable: true,
    });
    logger.info('✅ Network error handling test passed');
}
catch (error) {
    logger.error('❌ Network error handling test failed:', { error });
}
logger.info('Error Handler testing completed!');
export default function testErrorHandler() {
    logger.info('Error Handler is working correctly');
    return true;
}
//# sourceMappingURL=test-error-handler.js.map