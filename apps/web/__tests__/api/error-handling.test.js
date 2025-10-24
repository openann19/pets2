/**
 * Tests for advanced error handling in GDPR API endpoints
 */
import { describe, expect, it } from '@jest/globals';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/account-api-handlers';

describe('GDPR API Error Handling', () => {
    it('should properly handle network errors', async () => {
        // Override handler for this test to simulate network errors
        server.use(
            http.get('/api/account/status', () => {
                return HttpResponse.error();
            })
        );

        // Wrap in try/catch as fetch will throw for network errors
        try {
            await callApi('/api/account/status');
            // If we reach here, test should fail
            expect('Should have thrown an error').toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
            expect(error instanceof TypeError).toBe(true);
        }
    });

    it('should handle malformed JSON in response bodies', async () => {
        // Override handler to return malformed JSON
        server.use(
            http.get('/api/account/status', () => {
                return new Response('{malformed: json}', {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            })
        );

        const response = await callApi('/api/account/status');

        try {
            await response.json();
            // If we reach here, test should fail
            expect('Should have thrown an error').toBe(false);
        } catch (error) {
            expect(error).toBeDefined();
            expect(error instanceof SyntaxError).toBe(true);
        }
    });

    it('should handle throttling with exponential backoff', async () => {
        // Setup for handling multiple responses
        let requestCount = 0;

        server.use(
            http.post('/api/account/delete', () => {
                requestCount++;

                // First request gets throttled
                if (requestCount === 1) {
                    return new HttpResponse(
                        JSON.stringify({
                            error: 'Too many requests',
                            retryAfter: 2 // seconds
                        }),
                        {
                            status: 429,
                            headers: {
                                'Retry-After': '2'
                            }
                        }
                    );
                }

                // Second request succeeds
                return HttpResponse.json({
                    success: true,
                    message: 'Account scheduled for deletion',
                    gracePeriodDays: 30
                });
            })
        );

        // Implement simplified mock of exponential backoff
        const originalFetch = global.fetch;
        const mockFetch = jest.fn().mockImplementation(async (url, options) => {
            if (url.includes('/api/account/delete')) {
                const response = await originalFetch(url, options);

                if (response.status === 429) {
                    const data = await response.clone().json();
                    await new Promise(resolve => setTimeout(resolve, data.retryAfter * 50)); // Reduced time for testing
                    return originalFetch(url, options); // Retry the request
                }

                return response;
            }

            return originalFetch(url, options);
        });

        // Replace global fetch with mock
        global.fetch = mockFetch;

        try {
            const response = await callApi('/api/account/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'user123',
                    confirmEmail: 'user@example.com'
                })
            });

            const data = await response.json();

            // Assert final successful response
            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            // Assert that fetch was called multiple times
            expect(mockFetch).toHaveBeenCalledTimes(2);
        } finally {
            // Restore original fetch
            global.fetch = originalFetch;
        }
    });

    it('should handle validation errors with detailed field information', async () => {
        // Override handler to return detailed validation errors
        server.use(
            http.post('/api/account/delete', async () => {
                return new HttpResponse(
                    JSON.stringify({
                        error: 'Validation failed',
                        details: [
                            {
                                field: 'userId',
                                message: 'User ID is required',
                                code: 'REQUIRED_FIELD'
                            },
                            {
                                field: 'confirmEmail',
                                message: 'Email must match account email',
                                code: 'EMAIL_MISMATCH'
                            },
                            {
                                field: 'reason',
                                message: 'Reason must be one of: privacy, unwanted, other',
                                code: 'INVALID_OPTION'
                            }
                        ]
                    }),
                    { status: 422 }
                );
            })
        );

        const response = await callApi('/api/account/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Missing or invalid fields
            })
        });

        const data = await response.json();

        // Assert validation error response
        expect(response.status).toBe(422);
        expect(data.error).toBe('Validation failed');
        expect(Array.isArray(data.details)).toBe(true);
        expect(data.details).toHaveLength(3);

        // Check detailed error information
        const userIdError = data.details.find(d => d.field === 'userId');
        expect(userIdError).toBeDefined();
        expect(userIdError.code).toBe('REQUIRED_FIELD');

        const emailError = data.details.find(d => d.field === 'confirmEmail');
        expect(emailError).toBeDefined();
        expect(emailError.message).toBe('Email must match account email');

        const reasonError = data.details.find(d => d.field === 'reason');
        expect(reasonError).toBeDefined();
        expect(reasonError.message).toContain('privacy, unwanted, other');
    });

    it('should handle authentication session expiration', async () => {
        // Override handler to simulate session expiration
        server.use(
            http.post('/api/account/export-data', () => {
                return new HttpResponse(
                    JSON.stringify({
                        error: 'Authentication session expired',
                        code: 'SESSION_EXPIRED',
                        redirectTo: '/login?redirect=/account/export'
                    }),
                    { status: 401 }
                );
            })
        );

        const response = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'json'
            })
        });

        const data = await response.json();

        // Assert authentication error response
        expect(response.status).toBe(401);
        expect(data.error).toBe('Authentication session expired');
        expect(data.code).toBe('SESSION_EXPIRED');
        expect(data.redirectTo).toBe('/login?redirect=/account/export');
    });
});