/**
 * Account Status API Tests
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock the dependencies
jest.mock('../../../../app/lib/auth', () => ({
    verifyAuth: jest.fn()
}));

jest.mock('../../../../app/lib/db', () => ({
    connectToDB: jest.fn()
}));

// Import the mocked dependencies
const { verifyAuth } = require('../../../../app/lib/auth');
const { connectToDB } = require('../../../../app/lib/db');

// Import the modules we need to test
const { GET } = require('../../../../app/api/account/status/route');

// Create a mock NextResponse object
const mockNextResponse = {
    json: jest.fn((data, options) => ({
        status: options?.status || 200,
        json: async () => data
    }))
};

// Replace the actual NextResponse with our mock
jest.mock('next/server', () => ({
    NextResponse: {
        json: (...args) => mockNextResponse.json(...args)
    }
}));

describe('Account Status API Route', () => {
    // Create a mock request
    const createRequest = () => ({
        url: 'https://example.com/api/account/status',
        headers: {
            get: jest.fn()
        }
    });

    // Reset all mocks before each test
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return unauthorized for unauthenticated requests', async () => {
        // Setup
        verifyAuth.mockResolvedValueOnce({});
        const request = createRequest();

        // Execute
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('should return not-found when no pending deletion exists', async () => {
        // Setup
        verifyAuth.mockResolvedValueOnce({ userId: 'user123' });

        const mockDb = {
            accountActions: {
                findOne: jest.fn().mockResolvedValueOnce(null)
            }
        };
        connectToDB.mockResolvedValueOnce(mockDb);

        const request = createRequest();

        // Execute
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.status).toBe('not-found');
        expect(data.message).toBe('No pending account deletion found');

        expect(mockDb.accountActions.findOne).toHaveBeenCalledWith({
            userId: 'user123',
            actionType: 'delete-account',
            status: { $in: ['pending', 'processing'] }
        });
    });

    it('should return deletion status with days remaining', async () => {
        // Setup
        const mockUserId = 'user123';
        const mockRequestId = 'req-123';
        const now = new Date();
        const createdAt = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
        const mockDeletionRequest = {
            _id: mockRequestId,
            userId: mockUserId,
            status: 'pending',
            createdAt: createdAt.toISOString(),
            gracePeriodDays: 30,
        };

        verifyAuth.mockResolvedValueOnce({ userId: mockUserId });

        const mockDb = {
            accountActions: {
                findOne: jest.fn().mockResolvedValueOnce(mockDeletionRequest)
            }
        };
        connectToDB.mockResolvedValueOnce(mockDb);

        const request = createRequest();

        // Execute
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const data = await response.json();

        expect(data.status).toBe('pending');
        expect(data.requestedAt).toBe(createdAt.toISOString());
        expect(data.requestId).toBe(mockRequestId);
        expect(data.canCancel).toBe(true);
        expect(typeof data.daysRemaining).toBe('number');
        expect(data.daysRemaining).toBeLessThanOrEqual(20); // Around 20 days remaining
        expect(data.daysRemaining).toBeGreaterThan(19); // Account for test execution time
    });

    it('should handle database errors gracefully', async () => {
        // Setup
        verifyAuth.mockResolvedValueOnce({ userId: 'user123' });
        connectToDB.mockRejectedValueOnce(new Error('Database connection failed'));

        const request = createRequest();

        // Execute
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Failed to check account status');
    });
});