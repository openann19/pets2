/**
 * Data Export API Route
 * GDPR Article 20 - Right to Data Portability
 */

import type { NextRequest } from 'next/server'

;
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '../../../lib/auth';
import { connectToDB } from '../../../lib/db';

// Schema validation for the request
const requestSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    includeMessages: z.boolean().default(true),
    includePhotos: z.boolean().default(true),
    includeMatches: z.boolean().default(true),
    includeAnalytics: z.boolean().default(false),
    format: z.enum(['json', 'csv']).default('json'),
});

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const { userId: authenticatedUserId } = await verifyAuth(request);
        if (!authenticatedUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate the request body
        const body = await request.json();
        const validationResult = requestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const {
            userId,
            includeMessages,
            includePhotos,
            includeMatches,
            includeAnalytics,
            format
        } = validationResult.data;

        // Ensure the authenticated user is exporting their own data
        if (authenticatedUserId !== userId) {
            return NextResponse.json(
                { error: 'You can only export your own data' },
                { status: 403 }
            );
        }

        // Connect to the database
        const db = await connectToDB();

        // Get user to validate
        const user = await db.users.findOne({ _id: userId });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create an export job - these can take time
        const exportId = `EXP-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
        const now = new Date();
        const estimatedCompletionTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

        await db.dataExports.insertOne({
            exportId,
            userId,
            requestedAt: now,
            status: 'pending',
            includeMessages,
            includePhotos,
            includeMatches,
            includeAnalytics,
            format,
            progress: 0,
        });

        // In a real implementation, this would trigger a background job
        // to gather all the user data and prepare the export file
        triggerDataExportJob(exportId, userId);

        // Send email notification about the export request
        await sendExportRequestEmail(user.email, exportId, estimatedCompletionTime);

        return NextResponse.json({
            exportId,
            status: 'pending',
            estimatedCompletionTime: estimatedCompletionTime.toISOString(),
            message: 'Data export has been scheduled'
        });
    } catch (error) {
        console.error('Error in data export:', { error });
        return NextResponse.json(
            { error: 'Failed to process data export request' },
            { status: 500 }
        );
    }
}

/**
 * Get export status endpoint
 */
export async function GET(
    request: NextRequest
) {
    try {
        // Verify authentication
        const { userId } = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get exportId from query parameters
        const { searchParams } = new URL(request.url);
        const exportId = searchParams.get('exportId');

        if (!exportId) {
            return NextResponse.json(
                { error: 'exportId query parameter is required' },
                { status: 400 }
            );
        }

        // Connect to the database
        const db = await connectToDB();

        // Get the export job
        const exportJob = await db.dataExports.findOne({ exportId });

        if (!exportJob) {
            return NextResponse.json({ error: 'Export not found' }, { status: 404 });
        }

        // Ensure the authenticated user is accessing their own export
        if (exportJob.userId !== userId) {
            return NextResponse.json(
                { error: 'You can only access your own exports' },
                { status: 403 }
            );
        }

        // Return the status
        return NextResponse.json({
            exportId: exportJob.exportId,
            status: exportJob.status,
            progress: exportJob.progress,
            requestedAt: exportJob.requestedAt,
            completedAt: exportJob.completedAt,
            downloadUrl: exportJob.status === 'completed' ? `/api/account/export-data/${exportId}/download` : undefined,
            fileSize: exportJob.fileSize
        });
    } catch (error) {
        console.error('Error getting export status:', { error });
        return NextResponse.json(
            { error: 'Failed to get export status' },
            { status: 500 }
        );
    }
}

/**
 * Trigger a background job to export the data
 */
async function triggerDataExportJob(exportId: string, userId: string): Promise<void> {
    // In a real implementation, this would add the job to a queue
    console.info(`Triggering data export job for user ${userId}, export ID: ${exportId}`);

    // Simulate the job running
    setTimeout(async () => {
        try {
            const db = await connectToDB();

            // Update to "processing"
            await db.dataExports.updateOne(
                { exportId },
                { $set: { status: 'processing', progress: 10 } }
            );

            // Simulate the data gathering and export generation process
            setTimeout(async () => {
                try {
                    const now = new Date();
                    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

                    // Update to "completed"
                    await db.dataExports.updateOne(
                        { exportId },
                        {
                            $set: {
                                status: 'completed',
                                progress: 100,
                                completedAt: now,
                                downloadUrl: `/api/account/export-data/${exportId}/download`,
                                expiresAt,
                                fileSize: 1024 * 1024 * 2 // 2MB
                            }
                        }
                    );

                    // Send completion email
                    const user = await db.users.findOne({ _id: userId });
                    if (user) {
                        await sendExportCompletionEmail(user.email, exportId);
                    }
                } catch (error) {
                    console.error('Error completing export job:', { error });

                    const db = await connectToDB();
                    await db.dataExports.updateOne(
                        { exportId },
                        { $set: { status: 'failed', error: String(error) } }
                    );
                }
            }, 5000); // Simulating 5 seconds of processing
        } catch (error) {
            console.error('Error starting export job:', { error });
        }
    }, 1000); // Simulate a slight delay before starting
}

/**
 * Send email notification for export request
 */
async function sendExportRequestEmail(
    email: string,
    exportId: string,
    estimatedCompletionTime: Date
): Promise<void> {
    // In a real implementation, this would send an actual email
    console.info(`Sending export request email to ${email}. Export ID: ${exportId}. Estimated completion: ${estimatedCompletionTime.toLocaleString()}`);
}

/**
 * Send email notification for export completion
 */
async function sendExportCompletionEmail(
    email: string,
    exportId: string,
): Promise<void> {
    // In a real implementation, this would send an actual email
    console.info(`Sending export completion email to ${email}. Export ID: ${exportId}. Download link: /api/account/export-data/${exportId}/download`);
}