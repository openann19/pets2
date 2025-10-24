/**
 * Tests for the account status API
 */
import { describe, expect, it } from '@jest/globals';
import { rest } from 'msw';
import { server } from './mocks/handlers';

// Server is configured in api-test.setup.js

describe('Account Status API', () => {
    it('should return not found when no deletion request exists', async () => {
        // Make the API call
        const response = await callApi('/api/account/status');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(200);
        expect(data.status).toBe('not-found');
        expect(data.message).toBe('No pending account deletion found');
    });

    it('should return deletion status when a request exists', async () => {
        // Override handler for this test
        server.use(
            rest.get('http://localhost:3000/api/account/status', (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        status: 'pending',
                        requestedAt: '2023-06-01T12:00:00Z',
                        scheduledDeletionDate: '2023-07-01T12:00:00Z',
                        daysRemaining: 30,
                        canCancel: true,
                        requestId: 'request-123'
                    })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/status');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(200);
        expect(data.status).toBe('pending');
        expect(data.requestId).toBe('request-123');
        expect(data.canCancel).toBe(true);
        expect(data.daysRemaining).toBe(30);
    });

    it('should handle unauthorized requests', async () => {
        // Override handler for this test
        server.use(
            rest.get('http://localhost:3000/api/account/status', (req, res, ctx) => {
                return res(
                    ctx.status(401),
                    ctx.json({ error: 'Unauthorized' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/status');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should handle server errors', async () => {
        // Override handler for this test
        server.use(
            rest.get('http://localhost:3000/api/account/status', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({ error: 'Failed to check account status' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/status');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to check account status');
    });
});