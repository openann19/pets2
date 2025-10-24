/**
 * Tests for the account status API route
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { GET } from '../../../../app/api/account/status/route';

// Mock dependencies
jest.mock('../../../../app/lib/auth', () => ({
    verifyAuth: jest.fn()
}));

jest.mock('../../../../app/lib/db', () => ({
    connectToDB: jest.fn()
}));

// Mock NextRequest and NextResponse
const mockJson = jest.fn().mockImplementation((data) => ({
    data,
    json: async () => data
}));

jest.mock('next/server', () => {
    return {
        NextRequest: jest.fn().mockImplementation((url) => ({
            url
        })),
        NextResponse: {
            json: mockJson
        }
    };
});

const { verifyAuth } = require('../../../../app/lib/auth');
const { connectToDB } = require('../../../../app/lib/db');

describe('Account Status API Route', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return unauthorized for unauthenticated requests', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce({});
        const request = new NextRequest(new Request('https://example.com'));

        // Execute
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('should return not-found when no pending deletion exists', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce({ userId: 'user123' });

        const mockDb = {
            accountActions: {
                findOne: jest.fn().mockResolvedValueOnce(null)
            }
        };
        (connectToDB as jest.Mock).mockResolvedValueOnce(mockDb);

        const request = new NextRequest(new Request('https://example.com'));

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

        (verifyAuth as jest.Mock).mockResolvedValueOnce({ userId: mockUserId });

        const mockDb = {
            accountActions: {
                findOne: jest.fn().mockResolvedValueOnce(mockDeletionRequest)
            }
        };
        (connectToDB as jest.Mock).mockResolvedValueOnce(mockDb);

        const request = new NextRequest(new Request('https://example.com'));

        // Execute
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(200);
        const data = await response.json();

        expect(data.status).toBe('pending');
        expect(data.requestedAt).toBe(createdAt.toISOString());
        expect(data.requestId).toBe(mockRequestId);
        expect(data.canCancel).toBe(true);
        expect(data.daysRemaining).toBeLessThanOrEqual(20); // Around 20 days remaining
        expect(data.daysRemaining).toBeGreaterThan(19); // Account for test execution time
    });

    it('should handle database errors gracefully', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce({ userId: 'user123' });
        (connectToDB as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

        const request = new NextRequest(new Request('https://example.com'));

        // Execute
        const response = await GET(request);

        // Assert
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Failed to check account status');
    });
});