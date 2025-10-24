/**
 * Tests for the cancel account deletion API route
 */
import { NextRequest } from 'next/server';
import { POST } from '../../../../app/api/account/cancel-deletion/route';
import { verifyAuth } from '../../../../src/lib/auth';
import { connectToDB } from '../../../../src/lib/db';

// Import test setup
import '../../../../jest.setup';

// Mock dependencies
jest.mock('../../../../src/lib/auth', () => ({
    verifyAuth: jest.fn(),
}));

jest.mock('../../../../src/lib/db', () => ({
    connectToDB: jest.fn(),
}));

describe('Cancel Account Deletion API Route', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return unauthorized for unauthenticated requests', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce({});
        const request = new NextRequest(
            new Request('https://example.com', {
                method: 'POST',
                body: JSON.stringify({ requestId: 'req-123' }),
            })
        );

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if requestId is missing', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce({ userId: 'user123' });
        const request = new NextRequest(
            new Request('https://example.com', {
                method: 'POST',
                body: JSON.stringify({}),
            })
        );

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Request ID is required');
    });

    it('should return 404 if no matching deletion request is found', async () => {
        // Setup
        const mockUserId = 'user123';
        const mockRequestId = 'req-123';

        (verifyAuth as jest.Mock).mockResolvedValueOnce({ userId: mockUserId });

        const mockDb = {
            accountActions: {
                findOne: jest.fn().mockResolvedValueOnce(null)
            }
        };
        (connectToDB as jest.Mock).mockResolvedValueOnce(mockDb);

        const request = new NextRequest(
            new Request('https://example.com', {
                method: 'POST',
                body: JSON.stringify({ requestId: mockRequestId }),
            })
        );

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error).toBe('No matching deletion request found or it cannot be canceled');

        expect(mockDb.accountActions.findOne).toHaveBeenCalledWith({
            _id: mockRequestId,
            userId: mockUserId,
            actionType: 'delete-account',
            status: { $in: ['pending', 'processing'] }
        });
    });

    it('should return 400 if deletion is past grace period', async () => {
        // Setup
        const mockUserId = 'user123';
        const mockRequestId = 'req-123';
        const now = new Date();
        const createdAt = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000); // 31 days ago

        const mockDeletionRequest = {
            _id: mockRequestId,
            userId: mockUserId,
            actionType: 'delete-account',
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

        const request = new NextRequest(
            new Request('https://example.com', {
                method: 'POST',
                body: JSON.stringify({ requestId: mockRequestId }),
            })
        );

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('The deletion process cannot be canceled anymore as it is past the grace period');
    });

    it('should successfully cancel a deletion request within grace period', async () => {
        // Setup
        const mockUserId = 'user123';
        const mockRequestId = 'req-123';
        const now = new Date();
        const createdAt = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago (within 30-day grace period)

        const mockDeletionRequest = {
            _id: mockRequestId,
            userId: mockUserId,
            actionType: 'delete-account',
            status: 'pending',
            createdAt: createdAt.toISOString(),
            gracePeriodDays: 30,
        };

        (verifyAuth as jest.Mock).mockResolvedValueOnce({ userId: mockUserId });

        const mockDb = {
            accountActions: {
                findOne: jest.fn().mockResolvedValueOnce(mockDeletionRequest),
                updateOne: jest.fn().mockResolvedValueOnce({ modifiedCount: 1 })
            }
        };
        (connectToDB as jest.Mock).mockResolvedValueOnce(mockDb);

        const request = new NextRequest(
            new Request('https://example.com', {
                method: 'POST',
                body: JSON.stringify({ requestId: mockRequestId }),
            })
        );

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(200);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.message).toBe('Account deletion canceled successfully');
        expect(data.status).toBe('canceled');

        // Verify the cancellation was recorded in the database
        expect(mockDb.accountActions.updateOne).toHaveBeenCalledWith(
            { _id: mockRequestId },
            {
                $set: {
                    status: 'canceled',
                    canceledAt: expect.any(String),
                    cancelReason: 'User requested cancellation'
                }
            }
        );
    });

    it('should handle database errors gracefully', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce({ userId: 'user123' });
        (connectToDB as jest.Mock).mockRejectedValueOnce(new Error('Database connection failed'));

        const request = new NextRequest(
            new Request('https://example.com', {
                method: 'POST',
                body: JSON.stringify({ requestId: 'req-123' }),
            })
        );

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Failed to cancel account deletion');
    });
});