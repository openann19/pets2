/**
 * Check Account Status API Route
 * Used to check the status of an account scheduled for deletion
 */

import type { NextRequest } from 'next/server'

;
import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../lib/auth';
import { connectToDB } from '../../../lib/db';

export async function GET(
    request: NextRequest
) {
    try {
        // Verify authentication
        const { userId } = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Connect to the database
        const db = await connectToDB();

        // Get the most recent account deletion request
        const deletionRequest = await db.accountActions.findOne({
            userId,
            actionType: 'delete-account',
            status: { $in: ['pending', 'processing'] }
        });

        if (!deletionRequest) {
            return NextResponse.json({
                status: 'not-found',
                message: 'No pending account deletion found'
            });
        }

        // Calculate the remaining grace period
        const createdAt = new Date(deletionRequest.createdAt);
        const gracePeriodDays = deletionRequest.gracePeriodDays || 30;
        const executionDate = new Date(createdAt.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
        const now = new Date();

        // Calculate days remaining
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysRemaining = Math.max(0, Math.ceil((executionDate.getTime() - now.getTime()) / msPerDay));

        // Prepare the response
        const response = {
            status: deletionRequest.status,
            requestedAt: deletionRequest.createdAt,
            scheduledDeletionDate: executionDate.toISOString(),
            daysRemaining,
            canCancel: daysRemaining > 0,
            requestId: deletionRequest._id
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error checking account status:', { error });
        return NextResponse.json(
            { error: 'Failed to check account status' },
            { status: 500 }
        );
    }
}