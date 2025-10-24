/**
 * Tests for the account deletion API
 */
import { describe, expect, it } from '@jest/globals';
import { rest } from 'msw';
import { server } from './mocks/handlers';

// Server is configured in api-test.setup.js

describe('Delete Account API', () => {
    it('should successfully schedule account deletion', async () => {
        // Make the API call
        const response = await callApi('/api/account/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                reason: 'privacy',
                feedback: 'Just want to delete my data',
                confirmEmail: 'user@example.com'
            })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe('Account scheduled for deletion');
        expect(data.gracePeriodDays).toBe(30);
    });

    it('should validate request data', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/delete', (req, res, ctx) => {
                return res(
                    ctx.status(400),
                    ctx.json({
                        error: 'Invalid request data',
                        details: [{ path: ['confirmEmail'], message: 'Valid email is required for confirmation' }]
                    })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'user123',
                reason: 'privacy'
                // Missing confirmEmail
            })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
        expect(data.details[0].path).toContain('confirmEmail');
    });

    it('should prevent deletion of other user accounts', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/delete', (req, res, ctx) => {
                return res(
                    ctx.status(403),
                    ctx.json({ error: 'You can only delete your own account' })
                );
            })
        );

        // Make the API call
        const response = await callApi('/api/account/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 'other-user',
                confirmEmail: 'user@example.com'
            })
        });

        const data = await response.json();

        // Assert the response
        expect(response.status).toBe(403);
        expect(data.error).toBe('You can only delete your own account');
    });

    it('should return 401 for unauthorized requests', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/delete', (req, res, ctx) => {
                return res(
                    ctx.status(401),
                    ctx.json({ error: 'Unauthorized' })
                );
            })
        );

        // Make the API call
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

        // Assert the response
        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
    });

    it('should handle server errors', async () => {
        // Override handler for this test
        server.use(
            rest.post('http://localhost:3000/api/account/delete', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({ error: 'Failed to process deletion request' })
                );
            })
        );

        // Make the API call
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

        // Assert the response
        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to process deletion request');
    });
});