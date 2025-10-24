/**
 * API Route for Registering FCM Tokens
 * Stores push notification tokens for users
 */
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@pawfectmatch/core';
;
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
export async function POST(request) {
    try {
        // Get user session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const { token } = await request.json();
        if (!token) {
            return NextResponse.json({ success: false, message: 'Token is required' }, { status: 400 });
        }
        // Store token in database
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/register-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`
            },
            body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ success: false, message: data.message || 'Failed to register token' }, { status: response.status });
        }
        return NextResponse.json({
            success: true,
            message: 'Token registered successfully',
            data
        });
    }
    catch (error) {
        logger.error('Token registration error:', { error });
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map