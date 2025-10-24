/**
 * Mock Service Worker setup for API tests
 */
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Create an MSW server instance
export const server = setupServer(
    // Mock the status API
    rest.get('http://localhost:3000/api/account/status', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                status: 'not-found',
                message: 'No pending account deletion found'
            })
        );
    }),

    // Mock the cancel-deletion API
    rest.post('http://localhost:3000/api/account/cancel-deletion', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                message: 'Account deletion cancelled successfully'
            })
        );
    }),

    // Mock the delete API
    rest.post('http://localhost:3000/api/account/delete', async (req, res, ctx) => {
        const body = await req.json();

        if (!body.confirmEmail) {
            return res(
                ctx.status(400),
                ctx.json({
                    error: 'Invalid request data'
                })
            );
        }

        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                message: 'Account scheduled for deletion',
                gracePeriodDays: 30
            })
        );
    }),

    // Mock the export-data API
    rest.post('http://localhost:3000/api/account/export-data', async (req, res, ctx) => {
        const body = await req.json();

        if (!body.userId) {
            return res(
                ctx.status(400),
                ctx.json({
                    error: 'User ID is required'
                })
            );
        }

        return res(
            ctx.status(200),
            ctx.json({
                success: true,
                exportId: 'export-123',
                message: 'Data export initiated',
                estimatedCompletionTime: '10 minutes'
            })
        );
    }),

    // Mock the export-data download API
    rest.get('http://localhost:3000/api/account/export-data/:exportId/download', (req, res, ctx) => {
        const { exportId } = req.params;

        if (exportId !== 'export-123') {
            return res(
                ctx.status(404),
                ctx.json({
                    error: 'Export not found'
                })
            );
        }

        return res(
            ctx.status(200),
            ctx.json({
                downloadUrl: 'https://example.com/downloads/export-123.zip',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
        );
    })
);