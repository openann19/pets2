/**
 * Tests for the data export API route
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { POST } from '../../../../app/api/account/export-data/route';

// Mock dependencies
jest.mock('../../../../app/lib/auth', () => ({
    verifyAuth: jest.fn(),
    getCurrentUser: jest.fn()
}));

jest.mock('../../../../app/lib/db', () => ({
    connectToDB: jest.fn(),
    createDataExport: jest.fn(),
    queueDataExportJob: jest.fn()
}));

// Mock NextRequest and NextResponse
const mockJson = jest.fn().mockImplementation((data) => ({
    data,
    json: async () => data
}));

jest.mock('next/server', () => {
    return {
        NextRequest: jest.fn().mockImplementation((url) => ({
            url,
            json: () => Promise.resolve({})
        })),
        NextResponse: {
            json: mockJson
        }
    };
});

const { verifyAuth, getCurrentUser } = require('../../../../app/lib/auth');
const { connectToDB, createDataExport, queueDataExportJob } = require('../../../../app/lib/db');

describe('Data Export API Route', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.resetAllMocks();
        (NextRequest as jest.Mock).mockClear();
        mockJson.mockClear();
    });

    it('should return unauthorized for unauthenticated requests', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce(false);
        const request = new NextRequest(new Request('https://example.com'));
        request.json = jest.fn().mockResolvedValue({ userId: 'user-123' });

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.data.error).toBe('Unauthorized');
        expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
    });

    it('should validate request data', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce(true);
        (getCurrentUser as jest.Mock).mockResolvedValueOnce({ id: 'user-123' });

        const request = new NextRequest(new Request('https://example.com'));
        request.json = jest.fn().mockResolvedValue({ /* Missing userId */ });

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.data.error).toBe('Invalid request data');
        expect(response.data.details[0].message).toBe('User ID is required');
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Invalid request data',
            details: expect.arrayContaining([
                expect.objectContaining({
                    message: 'User ID is required'
                })
            ])
        }), { status: 400 });
    });

    it('should prevent exporting data of other users', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce(true);
        (getCurrentUser as jest.Mock).mockResolvedValueOnce({ id: 'user-123' });

        const request = new NextRequest(new Request('https://example.com'));
        request.json = jest.fn().mockResolvedValue({
            userId: 'different-user',
            format: 'json'
        });

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.data.error).toBe('You can only export your own data');
        expect(mockJson).toHaveBeenCalledWith(
            { error: 'You can only export your own data' },
            { status: 403 }
        );
    });

    it('should successfully initiate data export', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce(true);
        (getCurrentUser as jest.Mock).mockResolvedValueOnce({ id: 'user-123' });
        (createDataExport as jest.Mock).mockResolvedValueOnce({
            id: 'export-123',
            userId: 'user-123',
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        (queueDataExportJob as jest.Mock).mockResolvedValueOnce(true);

        const request = new NextRequest(new Request('https://example.com'));
        request.json = jest.fn().mockResolvedValue({
            userId: 'user-123',
            includeMessages: true,
            includePhotos: true,
            includeMatches: true,
            format: 'json'
        });

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.data.success).toBe(true);
        expect(response.data.exportId).toBe('export-123');
        expect(response.data).toHaveProperty('estimatedCompletionTime');
        expect(createDataExport).toHaveBeenCalledWith(
            'user-123',
            expect.objectContaining({
                includeMessages: true,
                includePhotos: true,
                includeMatches: true,
                format: 'json'
            })
        );
        expect(queueDataExportJob).toHaveBeenCalledWith('export-123');
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                exportId: 'export-123'
            }),
            { status: 200 }
        );
    });

    it('should handle database errors', async () => {
        // Setup
        (verifyAuth as jest.Mock).mockResolvedValueOnce(true);
        (getCurrentUser as jest.Mock).mockResolvedValueOnce({ id: 'user-123' });
        (createDataExport as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

        const request = new NextRequest(new Request('https://example.com'));
        request.json = jest.fn().mockResolvedValue({
            userId: 'user-123',
            format: 'json'
        });

        // Execute
        const response = await POST(request);

        // Assert
        expect(response.data.error).toBe('Failed to process data export request');
        expect(mockJson).toHaveBeenCalledWith(
            { error: 'Failed to process data export request' },
            { status: 500 }
        );
    });
});