/**
 * Account Deletion API Route
 * GDPR Article 17 - Right to Erasure ("right to be forgotten")
 */

import type { NextRequest } from 'next/server'
import { logger } from '@pawfectmatch/core';
;
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '../../../lib/auth';
import { connectToDB } from '../../../lib/db';

// Schema validation for the request
const requestSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    reason: z
        .enum(['privacy', 'not_useful', 'too_expensive', 'found_match', 'other'])
        .optional(),
    feedback: z.string().optional(),
    confirmEmail: z.string().email('Valid email is required for confirmation'),
    twoFactorCode: z.string().optional(),
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

        const { userId, reason, feedback, confirmEmail, twoFactorCode } = validationResult.data;

        // Ensure the authenticated user is deleting their own account
        if (authenticatedUserId !== userId) {
            return NextResponse.json(
                { error: 'You can only delete your own account' },
                { status: 403 }
            );
        }

        // Connect to the database
        const db = await connectToDB();

        // Get user to validate email
        const user = await db.users.findOne({ _id: userId });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Validate email confirmation
        if (user.email !== confirmEmail) {
            return NextResponse.json(
                { error: 'Email confirmation does not match' },
                { status: 400 }
            );
        }

        // Validate 2FA if enabled
        if (user.twoFactorEnabled) {
            if (!twoFactorCode) {
                return NextResponse.json(
                    { error: '2FA code is required for account deletion' },
                    { status: 400 }
                );
            }

            const isValidCode = await verifyTwoFactorCode(userId, twoFactorCode);
            if (!isValidCode) {
                return NextResponse.json(
                    { error: 'Invalid 2FA code' },
                    { status: 400 }
                );
            }
        }

        // Schedule deletion - use a 30-day grace period
        const now = new Date();
        const deletionDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        // Create deletion request record
        const confirmationId = generateConfirmationId();

        await db.accountActions.insertOne({
            userId,
            actionType: 'delete-account',
            requestedAt: now,
            scheduledDeletionDate: deletionDate,
            reason,
            feedback,
            confirmationId,
            status: 'scheduled'
        });

        // Update user record to mark pending deletion
        await db.users.updateOne(
            { _id: userId },
            {
                $set: {
                    pendingDeletion: true,
                    pendingDeletionDate: deletionDate,
                    lastUpdated: now
                }
            }
        );

        // Send email notification about account deletion
        await sendDeletionEmail(user.email, confirmationId, deletionDate);

        return NextResponse.json({
            success: true,
            deletionScheduledDate: deletionDate.toISOString(),
            gracePeriodEndsAt: deletionDate.toISOString(),
            confirmationId,
            message: 'Account deletion has been scheduled'
        });
    } catch (error) {
        logger.error('Error in account deletion:', { error });
        return NextResponse.json(
            { error: 'Failed to process account deletion request' },
            { status: 500 }
        );
    }
}

/**
 * Helper function to verify 2FA code
 */
async function verifyTwoFactorCode(_userId: string, _code: string): Promise<boolean> {
    try {
        // In a real implementation, this would validate against stored secrets
        // For demonstration, we'll just return true
        return true;
    } catch (error) {
        logger.error('Error verifying 2FA code:', { error });
        return false;
    }
}

/**
 * Generate a unique confirmation ID
 */
function generateConfirmationId(): string {
    return `DEL-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
}

/**
 * Send email notification for account deletion
 */
async function sendDeletionEmail(
    email: string,
    confirmationId: string,
    deletionDate: Date
): Promise<void> {
    // In a real implementation, this would send an actual email
    logger.info(`Sending account deletion email to ${email}. Confirmation ID: ${confirmationId}. Scheduled deletion: ${deletionDate.toLocaleString()}`);
}