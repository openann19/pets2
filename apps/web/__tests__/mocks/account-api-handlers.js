/**
 * Mock Service Worker setup for API tests
 * Enhanced version with more advanced handlers for comprehensive testing
 */
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Create an MSW server instance
export const server = setupServer(
    // Mock the status API
    rest.get('/api/account/status', (req, res, ctx) => {
        return res(ctx.json({
            status: 'not-found',
            message: 'No pending account deletion found'
        }));
    }),

    // Mock the cancel-deletion API
    rest.post('/api/account/cancel-deletion', (req, res, ctx) => {
        return res(ctx.json({
            success: true,
            message: 'Account deletion cancelled successfully'
        }));
    }),

    // Mock the delete API
    rest.post('/api/account/delete', async (req, res, ctx) => {
        const body = await request.json();

        if (!body.confirmEmail) {
            return new HttpResponse(
                JSON.stringify({ error: 'Invalid request data' }),
                { status: 400 }
            );
        }

        return HttpResponse.json({
            success: true,
            message: 'Account scheduled for deletion',
            gracePeriodDays: 30
        });
    }),

    // Mock the export-data API
    http.post('/api/account/export-data', async ({ request }) => {
        const body = await request.json();

        if (!body.userId) {
            return new HttpResponse(
                JSON.stringify({ error: 'User ID is required' }),
                { status: 400 }
            );
        }

        return HttpResponse.json({
            success: true,
            exportId: 'export-123',
            message: 'Data export initiated',
            estimatedCompletionTime: '10 minutes'
        });
    }),

    // Mock the export-data download API
    http.get('/api/account/export-data/:exportId/download', ({ params }) => {
        const { exportId } = params;

        if (exportId !== 'export-123') {
            return new HttpResponse(
                JSON.stringify({ error: 'Export not found' }),
                { status: 404 }
            );
        }

        return HttpResponse.json({
            downloadUrl: 'https://example.com/downloads/export-123.zip',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
    })
);

// Start the MSW server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

// Export additional utility functions for tests
export const extendServer = (handlers) => {
    server.use(...handlers);
    return server;
};

// Helper to simulate gradual progress of data exports
export const createExportProgressHandler = (exportId, steps = 4, interval = 250) => {
    const progressStates = [
        { status: 'preparing', progress: 0, message: 'Preparing your data...' },
        { status: 'processing', progress: 33, message: 'Processing account data...' },
        { status: 'processing', progress: 66, message: 'Packaging files...' },
        { status: 'completed', progress: 100, message: 'Export completed!' }
    ];

    let currentStep = 0;

    return http.get(`/api/account/export-data/${exportId}/status`, () => {
        const state = progressStates[Math.min(currentStep, progressStates.length - 1)];
        currentStep = Math.min(currentStep + 1, progressStates.length - 1);

        // Simulate progress over time
        setTimeout(() => {
            currentStep = Math.min(currentStep + 1, progressStates.length - 1);
        }, interval);

        return HttpResponse.json(state);
    });
};