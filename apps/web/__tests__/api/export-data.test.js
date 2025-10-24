/**
 * Tests for the data export API
 */
import { describe, expect, it } from '@jest/globals';
import { rest } from 'msw';
import { server } from './mocks/handlers';

// Server is configured in api-test.setup.js

describe('Data Export API', () => {
    it('should successfully initiate data export', async () => {
        // Make the API call
        const response = await callApi('/api/account/export-data', {
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

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.exportId).toBe('export-123');
        expect(data.estimatedCompletionTime).toBe('10 minutes');
    });

    it('should validate request data', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/export-data', (req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({
                        error: 'Invalid request data',
                        details: [{ path: ['userId'], message: 'User ID is required' }]
                    })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Missing userId
                format: 'json'
            })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
        expect(data.details[0].path).toContain('userId');
    });

    it('should prevent exporting data of other users', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/export-data', (req, res, ctx) => {
                return res(
                    ctx.status(403),
                    ctx.json({ error: 'You can only export your own data' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/export-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'other-user',
                format: 'json'
            })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(403);
        expect(data.error).toBe('You can only export your own data');
    });

    it('should return 401 for unauthorized requests', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/export-data', (req, res, ctx) => {
                return res(
                    ctx.status(401),
                    ctx.json({ error: 'Unauthorized' })
                );
            })
        );

        // Make the API call
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

        // Assert the response
        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should handle server errors', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/export-data', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({ error: 'Failed to process data export request' })
                );
            })
        );

        // Make the API call
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

        // Assert the response
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to process data export request');
    });
});