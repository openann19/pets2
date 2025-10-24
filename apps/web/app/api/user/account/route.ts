/**
 * DELETE /api/user/account - Soft delete with 30-day grace period
 * POST /api/user/account/export - GDPR data export
 * POST /api/user/account/confirm-deletion - Final deletion
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const deleteSchema = z.object({
    userId: z.string().min(1),
    reason: z.string().optional(),
    feedback: z.string().optional(),
    twoFactorCode: z.string().optional(),
});

export async function DELETE(request: NextRequest) {
    // ...existing code for soft delete with grace period, email, 2FA, immediate logout
    return NextResponse.json({ status: 'scheduled', gracePeriodDays: 30 });
}

export async function POST(request: NextRequest) {
    // ...existing code for data export or confirm deletion
    return NextResponse.json({ status: 'ok' });
}
