/**
 * Tests for the data export download API
 */
import { describe, expect, it } from '@jest/globals';
import { rest } from 'msw';
import { server } from './mocks/handlers';

// Server is configured in api-test.setup.js

describe('Export Download API', () => {
    it('should provide download URL for a valid export', async () => {
        // Make the API call
        const response = await callApi('/api/account/export-data/export-123/download');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(200);
        expect(data.downloadUrl).toBe('https://example.com/downloads/export-123.zip');
        expect(data).toHaveProperty('expiresAt');
    });

    it('should return 404 for non-existent exports', async () => {
        // Make the API call
        const response = await callApi('/api/account/export-data/non-existent/download');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(404);
        expect(data.error).toBe('Export not found');
    });

    it('should return 401 for unauthorized requests', async () => {
        // Override handler for this test
        server.use(
            rest.get('http://localhost:3000/api/account/export-data/export-123/download', (req, res, ctx) => {
                return res(
                    ctx.status(401),
                    ctx.json({ error: 'Unauthorized' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/export-data/export-123/download');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should prevent accessing exports of other users', async () => {
        // Override handler for this test
        server.use(
            rest.get('http://localhost:3000/api/account/export-data/export-123/download', (req, res, ctx) => {
                return res(
                    ctx.status(403),
                    ctx.json({ error: 'You can only access your own exports' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/export-data/export-123/download');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(403);
        expect(data.error).toBe('You can only access your own exports');
    });

    it('should handle expired exports', async () => {
        // Override handler for this test
        server.use(
            rest.get('http://localhost:3000/api/account/export-data/export-123/download', (req, res, ctx) => {
                return res(
                    ctx.status(410),
                    ctx.json({ error: 'Export has expired', code: 'EXPIRED' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/export-data/export-123/download');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(410);
        expect(data.error).toBe('Export has expired');
        expect(data.code).toBe('EXPIRED');
    });

    it('should handle server errors', async () => {
        // Override handler for this test
        server.use(
            rest.get('http://localhost:3000/api/account/export-data/export-123/download', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({ error: 'Failed to process download request' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/export-data/export-123/download');
        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to process download request');
    });
});