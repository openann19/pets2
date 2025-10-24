/**
 * Direct test for account status API endpoint
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Create mocks
const mockVerifyAuth = jest.fn();
const mockConnectToDB = jest.fn();

// Mock the Next.js server modules
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn().mockImplementation((data, options = {}) => ({
            status: options.status || 200,
            json: async () => data
        }))
    }
}));

// Mock the dependencies
jest.mock('../../../../app/lib/auth', () => ({
    verifyAuth: mockVerifyAuth
}));

jest.mock('../../../../app/lib/db', () => ({
    connectToDB: mockConnectToDB
}));

// Import the route handler
const { GET } = require('../../../../app/api/account/status/route');

describe('Account Status API', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should handle unauthorized requests', async () => {
        // Setup
        mockVerifyAuth.mockResolvedValueOnce({});
        const mockRequest = { headers: new Map() };

        // Execute
        const response = await GET(mockRequest);

        // Assert
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('should return not found when no deletion request exists', async () => {
        // Setup
        mockVerifyAuth.mockResolvedValueOnce({ userId: 'user123' });
        mockConnectToDB.mockResolvedValueOnce({
            accountActions: {
                findOne: jest.fn().mockResolvedValueOnce(null)
            }
        });

        const mockRequest = { headers: new Map() };

        // Execute
        const response = await GET(mockRequest);

        // Assert
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.status).toBe('not-found');
        expect(data.message).toBe('No pending account deletion found');
    });
});