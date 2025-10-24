/**
 * Tests for data export progress tracking
 */
import { describe, expect, it, jest } from '@jest/globals';
import { http, HttpResponse } from 'msw';
import { createExportProgressHandler, server } from '../mocks/account-api-handlers';

describe('Data Export Progress Tracking', () => {
    it('should track export progress through status endpoint', async () => {
        // Create a progress handler for a specific export ID
        server.use(
            createExportProgressHandler('export-progress-123', 4, 100)
        );

        // First check - should be in preparing state
        const firstResponse = await callApi('/api/account/export-data/export-progress-123/status');
        const firstData = await firstResponse.json();

        expect(firstResponse.status).toBe(200);
        expect(firstData.status).toBe('preparing');
        expect(firstData.progress).toBe(0);

        // Wait a bit for progress to update
        await new Promise(resolve => setTimeout(resolve, 150));

        // Second check - should be in processing state
        const secondResponse = await callApi('/api/account/export-data/export-progress-123/status');
        const secondData = await secondResponse.json();

        expect(secondResponse.status).toBe(200);
        expect(secondData.status).toBe('processing');
        expect(secondData.progress).toBe(33);

        // Wait a bit more for progress to update
        await new Promise(resolve => setTimeout(resolve, 150));

        // Third check - should be further in processing state
        const thirdResponse = await callApi('/api/account/export-data/export-progress-123/status');
        const thirdData = await thirdResponse.json();

        expect(thirdResponse.status).toBe(200);
        expect(thirdData.status).toBe('processing');
        expect(thirdData.progress).toBe(66);

        // Wait for completion
        await new Promise(resolve => setTimeout(resolve, 150));

        // Final check - should be completed
        const finalResponse = await callApi('/api/account/export-data/export-progress-123/status');
        const finalData = await finalResponse.json();

        expect(finalResponse.status).toBe(200);
        expect(finalData.status).toBe('completed');
        expect(finalData.progress).toBe(100);
    });

    it('should handle export errors during processing', async () => {
        // Setup a handler that simulates an error during export
        server.use(
            http.get('/api/account/export-data/export-error-123/status', ({ request }) => {
                // Parse URL to get query parameters if any
                const url = new URL(request.url);
                const retry = url.searchParams.get('retry') === 'true';

                if (retry) {
                    // On retry, show success
                    return HttpResponse.json({
                        status: 'completed',
                        progress: 100,
                        message: 'Export completed successfully'
                    });
                }

                // Initial request shows error
                return HttpResponse.json({
                    status: 'error',
                    progress: 75,
                    error: 'Failed to process media files',
                    errorCode: 'MEDIA_PROCESSING_FAILED',
                    canRetry: true
                }, { status: 200 }); // Still 200 as this is an expected application state
            })
        );

        // Check initial status - should be in error state
        const errorResponse = await callApi('/api/account/export-data/export-error-123/status');
        const errorData = await errorResponse.json();

        expect(errorResponse.status).toBe(200);
        expect(errorData.status).toBe('error');
        expect(errorData.progress).toBe(75);
        expect(errorData.error).toBe('Failed to process media files');
        expect(errorData.canRetry).toBe(true);

        // Retry the export
        const retryResponse = await callApi('/api/account/export-data/export-error-123/status?retry=true');
        const retryData = await retryResponse.json();

        expect(retryResponse.status).toBe(200);
        expect(retryData.status).toBe('completed');
        expect(retryData.progress).toBe(100);
    });

    it('should provide estimated completion time that updates based on progress', async () => {
        // Setup timestamps for consistent testing
        const startTime = new Date('2025-10-13T14:00:00Z').getTime();
        let currentTime = startTime;

        // Mock Date.now() to return controlled time
        const originalDateNow = Date.now;
        Date.now = jest.fn(() => currentTime);

        try {
            // Create handler with increasingly accurate estimates
            server.use(
                http.get('/api/account/export-data/export-estimate-123/status', () => {
                    const progressStates = [
                        { progress: 0, estimatedMinutesRemaining: 10, startedAt: new Date(startTime).toISOString() },
                        { progress: 25, estimatedMinutesRemaining: 8 },
                        { progress: 50, estimatedMinutesRemaining: 5 },
                        { progress: 75, estimatedMinutesRemaining: 2 },
                        { progress: 100, estimatedMinutesRemaining: 0, completedAt: new Date(currentTime).toISOString() }
                    ];

                    // Determine current state based on elapsed time
                    const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
                    let stateIndex;

                    if (elapsedMinutes < 2) stateIndex = 0;
                    else if (elapsedMinutes < 5) stateIndex = 1;
                    else if (elapsedMinutes < 8) stateIndex = 2;
                    else if (elapsedMinutes < 10) stateIndex = 3;
                    else stateIndex = 4;

                    return HttpResponse.json({
                        status: stateIndex === 4 ? 'completed' : 'processing',
                        progress: progressStates[stateIndex].progress,
                        estimatedMinutesRemaining: progressStates[stateIndex].estimatedMinutesRemaining,
                        startedAt: progressStates[0].startedAt,
                        completedAt: stateIndex === 4 ? progressStates[4].completedAt : undefined,
                        estimatedCompletionTime: stateIndex === 4
                            ? undefined
                            : new Date(currentTime + progressStates[stateIndex].estimatedMinutesRemaining * 60 * 1000).toISOString()
                    });
                })
            );

            // Initial check
            const initialResponse = await callApi('/api/account/export-data/export-estimate-123/status');
            const initialData = await initialResponse.json();

            expect(initialResponse.status).toBe(200);
            expect(initialData.progress).toBe(0);
            expect(initialData.estimatedMinutesRemaining).toBe(10);
            expect(initialData.estimatedCompletionTime).toBeDefined();

            // Move time forward and check again
            currentTime = startTime + 3 * 60 * 1000; // 3 minutes later

            const midResponse = await callApi('/api/account/export-data/export-estimate-123/status');
            const midData = await midResponse.json();

            expect(midResponse.status).toBe(200);
            expect(midData.progress).toBe(25);
            expect(midData.estimatedMinutesRemaining).toBe(8);

            // Move time forward to completion
            currentTime = startTime + 11 * 60 * 1000; // 11 minutes later

            const finalResponse = await callApi('/api/account/export-data/export-estimate-123/status');
            const finalData = await finalResponse.json();

            expect(finalResponse.status).toBe(200);
            expect(finalData.status).toBe('completed');
            expect(finalData.progress).toBe(100);
            expect(finalData.estimatedMinutesRemaining).toBe(0);
            expect(finalData.completedAt).toBeDefined();
            expect(finalData.estimatedCompletionTime).toBeUndefined();
        } finally {
            // Restore original Date.now
            Date.now = originalDateNow;
        }
    });
});