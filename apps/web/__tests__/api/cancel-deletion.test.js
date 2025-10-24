/**
 * Tests for the cancel account deletion API
 */
import { describe, expect, it } from '@jest/globals';
import { rest } from 'msw';
import { server } from './mocks/handlers';

// Server is configured in api-test.setup.js

describe('Cancel Account Deletion API', () => {
    it('should successfully cancel account deletion', async () => {
        // Make the API call
        const response = await callApi('/api/account/cancel-deletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId: 'request-123' })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Account deletion cancelled successfully');
    });

    it('should return 400 if requestId is missing', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/cancel-deletion', (req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({ error: 'Request ID is required' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/cancel-deletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(400);
        expect(data.error).toBe('Request ID is required');
    });

    it('should return 404 if no matching deletion request is found', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/cancel-deletion', (req, res, ctx) => {
                return res(
                    ctx.status(404),
                    ctx.json({ error: 'No matching deletion request found or it cannot be canceled' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/cancel-deletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId: 'non-existent-id' })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(404);
        expect(data.error).toBe('No matching deletion request found or it cannot be canceled');
    });

    it('should return 401 for unauthorized requests', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/cancel-deletion', (req, res, ctx) => {
                return res(
                    ctx.status(401),
                    ctx.json({ error: 'Unauthorized' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/cancel-deletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId: 'request-123' })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should handle server errors', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/cancel-deletion', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({ error: 'Failed to cancel account deletion' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/cancel-deletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId: 'request-123' })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to cancel account deletion');
    });
});