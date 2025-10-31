/**
 * Cancel Account Deletion API Route
 * GDPR Article 17 - Right to be forgotten
 * 
 * This route allows users to cancel a pending account deletion request
 * before it is executed.
 */

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../lib/auth';
import { connectToDB } from '../../../lib/db';

export async function POST(
    request: NextRequest
) {
    try {
        // Verify authentication
        const { userId } = await verifyAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get request payload
        const payload = await request.json();
        const { requestId } = payload;

        if (!requestId) {
            return NextResponse.json(
                { error: 'Request ID is required' },
                { status: 400 }
            );
        }

        // Connect to the database
        const db = await connectToDB();

        // Find the deletion request
        const deletionRequest = await db.accountActions.findOne({
            _id: requestId,
            userId,
            actionType: 'delete-account',
            status: { $in: ['pending', 'processing'] }
        });

        if (!deletionRequest) {
            return NextResponse.json(
                { error: 'No matching deletion request found or it cannot be canceled' },
                { status: 404 }
            );
        }

        // Calculate if the request is still within cancellation period
        const createdAt = new Date(deletionRequest.createdAt);
        const gracePeriodDays = deletionRequest.gracePeriodDays || 30;
        const executionDate = new Date(createdAt.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now >= executionDate) {
            return NextResponse.json(
                { error: 'The deletion process cannot be canceled anymore as it is past the grace period' },
                { status: 400 }
            );
        }

        // Cancel the deletion request
        await db.accountActions.updateOne(
            { _id: requestId },
            {
                $set: {
                    status: 'canceled',
                    canceledAt: new Date().toISOString(),
                    cancelReason: 'User requested cancellation'
                }
            }
        );

        // Log the action
        console.log(`Account deletion canceled for userId ${userId}`);

        // Send email notification
        // In a real implementation, this would send an email confirmation
        // that the account deletion has been canceled

        return NextResponse.json({
            success: true,
            message: 'Account deletion canceled successfully',
            status: 'canceled'
        });
    } catch (error) {
        console.error('Error canceling account deletion:', error);
        return NextResponse.json(
            { error: 'Failed to cancel account deletion' },
            { status: 500 }
        );
    }
}