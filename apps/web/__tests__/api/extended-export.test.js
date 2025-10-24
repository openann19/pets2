/**
 * Tests for the export-data download API
 */
import { describe, expect, it } from '@jest/globals';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/account-api-handlers';

describe('Data Export Download API - Additional Tests', () => {
    // Test more edge cases for the export-data download API

    it('should handle different export formats', async () => {
        // Override handler for this test
        server.use(
            http.post('/api/account/export-data', async ({ request }) => {
                const body = await request.json();

                // Validate format parameter
                if (!['json', 'csv', 'xml'].includes(body.format)) {
                    return new HttpResponse(
                        JSON.stringify({
                            error: 'Invalid export format',
                            details: [{ path: ['format'], message: 'Format must be one of: json, csv, xml' }]
                        }),
                        { status: 400 }
                    );
                }

                return HttpResponse.json({
                    success: true,
                    exportId: `export-123-${body.format}`,
                    format: body.format,
                    message: 'Data export initiated',
                    estimatedCompletionTime: '10 minutes'
                });
            })
        );

        // Test JSON format
        const jsonResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'json'
            })
        });

        const jsonData = await jsonResponse.json();
        expect(jsonResponse.status).toBe(200);
        expect(jsonData.exportId).toBe('export-123-json');
        expect(jsonData.format).toBe('json');

        // Test CSV format
        const csvResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'csv'
            })
        });

        const csvData = await csvResponse.json();
        expect(csvResponse.status).toBe(200);
        expect(csvData.exportId).toBe('export-123-csv');
        expect(csvData.format).toBe('csv');

        // Test invalid format
        const invalidResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'invalid'
            })
        });

        const invalidData = await invalidResponse.json();
        expect(invalidResponse.status).toBe(400);
        expect(invalidData.error).toBe('Invalid export format');
        expect(invalidData.details[0].message).toBe('Format must be one of: json, csv, xml');
    });

    it('should handle rate limiting for export requests', async () => {
        // Override handler for this test to simulate rate limiting
        let requestCount = 0;

        server.use(
            http.post('/api/account/export-data', async ({ request }) => {
                const body = await request.json();
                requestCount++;

                // After 2 requests, start rate limiting
                if (requestCount > 2) {
                    return new HttpResponse(
                        JSON.stringify({
                            error: 'Rate limit exceeded',
                            details: 'You can only request 2 exports per day. Please try again tomorrow.'
                        }),
                        {
                            status: 429,
                            headers: {
                                'X-RateLimit-Limit': '2',
                                'X-RateLimit-Remaining': '0',
                                'X-RateLimit-Reset': new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                            }
                        }
                    );
                }

                return HttpResponse.json({
                    success: true,
                    exportId: `export-${requestCount}`,
                    message: 'Data export initiated',
                    estimatedCompletionTime: '10 minutes',
                    remainingRequests: 2 - requestCount
                });
            })
        );

        // First request should succeed
        const firstResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'json'
            })
        });

        const firstData = await firstResponse.json();
        expect(firstResponse.status).toBe(200);
        expect(firstData.exportId).toBe('export-1');
        expect(firstData.remainingRequests).toBe(1);

        // Second request should succeed
        const secondResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'json'
            })
        });

        const secondData = await secondResponse.json();
        expect(secondResponse.status).toBe(200);
        expect(secondData.exportId).toBe('export-2');
        expect(secondData.remainingRequests).toBe(0);

        // Third request should be rate limited
        const thirdResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'json'
            })
        });

        const thirdData = await thirdResponse.json();
        expect(thirdResponse.status).toBe(429);
        expect(thirdData.error).toBe('Rate limit exceeded');
        expect(thirdResponse.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should support selective data export options', async () => {
        // Override handler for this test to validate export options
        server.use(
            http.post('/api/account/export-data', async ({ request }) => {
                const body = await request.json();

                // Calculate estimated time based on selected options
                let estimatedMinutes = 5; // Base time
                if (body.includeMessages) estimatedMinutes += 3;
                if (body.includePhotos) estimatedMinutes += 5;
                if (body.includeMatches) estimatedMinutes += 2;

                // Calculate estimated size based on selected options
                let estimatedSizeKb = 100; // Base size
                if (body.includeMessages) estimatedSizeKb += 300;
                if (body.includePhotos) estimatedSizeKb += 5000;
                if (body.includeMatches) estimatedSizeKb += 200;

                return HttpResponse.json({
                    success: true,
                    exportId: 'export-123',
                    message: 'Data export initiated',
                    estimatedCompletionTime: `${estimatedMinutes} minutes`,
                    estimatedSizeKb: estimatedSizeKb,
                    options: {
                        includeMessages: !!body.includeMessages,
                        includePhotos: !!body.includePhotos,
                        includeMatches: !!body.includeMatches,
                        format: body.format || 'json'
                    }
                });
            })
        );

        // Test with all options
        const fullResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                includeMessages: true,
                includePhotos: true,
                includeMatches: true,
                format: 'json'
            })
        });

        const fullData = await fullResponse.json();
        expect(fullResponse.status).toBe(200);
        expect(fullData.estimatedCompletionTime).toBe('15 minutes');
        expect(fullData.estimatedSizeKb).toBe(5600);
        expect(fullData.options.includeMessages).toBe(true);
        expect(fullData.options.includePhotos).toBe(true);
        expect(fullData.options.includeMatches).toBe(true);

        // Test with minimal options
        const minimalResponse = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                format: 'json'
            })
        });

        const minimalData = await minimalResponse.json();
        expect(minimalResponse.status).toBe(200);
        expect(minimalData.estimatedCompletionTime).toBe('5 minutes');
        expect(minimalData.estimatedSizeKb).toBe(100);
        expect(minimalData.options.includeMessages).toBe(false);
        expect(minimalData.options.includePhotos).toBe(false);
        expect(minimalData.options.includeMatches).toBe(false);
    });
});