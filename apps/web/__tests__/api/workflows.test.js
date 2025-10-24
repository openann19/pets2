/**
 * Integration tests for the GDPR account workflow
 */
import { describe, expect, it } from '@jest/globals';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/account-api-handlers';

describe('GDPR Account Workflow Integration', () => {
    it('should support the complete account deletion workflow', async () => {
        // Step 1: Request account deletion
        const deleteResponse = await callApi('/api/account/delete', {
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

        const deleteData = await deleteResponse.json();

        // Assert deletion request succeeded
        expect(deleteResponse.status).toBe(200);
        expect(deleteData.success).toBe(true);
        expect(deleteData.gracePeriodDays).toBe(30);

        // Step 2: Check deletion status
        server.use(
            http.get('/api/account/status', () => {
                return HttpResponse.json({
                    status: 'pending',
                    requestedAt: '2025-10-01T12:00:00Z',
                    scheduledDeletionDate: '2025-10-31T12:00:00Z',
                    daysRemaining: 18,
                    canCancel: true,
                    requestId: 'request-123'
                });
            })
        );

        const statusResponse = await callApi('/api/account/status');
        const statusData = await statusResponse.json();

        // Assert status check shows pending deletion
        expect(statusResponse.status).toBe(200);
        expect(statusData.status).toBe('pending');
        expect(statusData.daysRemaining).toBe(18);
        expect(statusData.canCancel).toBe(true);

        // Step 3: Cancel account deletion
        const cancelResponse = await callApi('/api/account/cancel-deletion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId: 'request-123' })
        });

        const cancelData = await cancelResponse.json();

        // Assert cancellation succeeded
        expect(cancelResponse.status).toBe(200);
        expect(cancelData.success).toBe(true);
        expect(cancelData.message).toBe('Account deletion cancelled successfully');

        // Step 4: Verify status shows no pending deletion
        server.use(
            http.get('/api/account/status', () => {
                return HttpResponse.json({
                    status: 'not-found',
                    message: 'No pending account deletion found'
                });
            })
        );

        const finalStatusResponse = await callApi('/api/account/status');
        const finalStatusData = await finalStatusResponse.json();

        // Assert status is back to not-found
        expect(finalStatusResponse.status).toBe(200);
        expect(finalStatusData.status).toBe('not-found');
    });

    it('should support the complete data export workflow', async () => {
        // Step 1: Request data export
        const exportResponse = await callApi('/api/account/export-data', {
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

        const exportData = await exportResponse.json();

        // Assert export request succeeded
        expect(exportResponse.status).toBe(200);
        expect(exportData.success).toBe(true);
        expect(exportData.exportId).toBe('export-123');

        // Step 2: Get download URL
        const downloadResponse = await callApi('/api/account/export-data/export-123/download');
        const downloadData = await downloadResponse.json();

        // Assert download URL retrieval succeeded
        expect(downloadResponse.status).toBe(200);
        expect(downloadData.downloadUrl).toBe('https://example.com/downloads/export-123.zip');
        expect(downloadData).toHaveProperty('expiresAt');

        // Step 3: Verify expired exports are handled correctly
        server.use(
            http.get('/api/account/export-data/export-123/download', () => {
                return new HttpResponse(
                    JSON.stringify({ error: 'Export has expired', code: 'EXPIRED' }),
                    { status: 410 }
                );
            })
        );

        const expiredResponse = await callApi('/api/account/export-data/export-123/download');
        const expiredData = await expiredResponse.json();

        // Assert expired export is handled
        expect(expiredResponse.status).toBe(410);
        expect(expiredData.error).toBe('Export has expired');
        expect(expiredData.code).toBe('EXPIRED');
    });
});