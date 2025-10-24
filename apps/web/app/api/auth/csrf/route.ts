/**
 * CSRF Token Endpoint
 * 
 * Generates and returns CSRF token for client-side use
 * Token is set in HttpOnly cookie and returned in response body
 */

import { generateCsrfToken } from '@/middleware/csrf';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get existing token from cookie
        const existingToken = request.cookies.get('csrf-token')?.value;

        // Use existing token or generate new one
        const token = existingToken || generateCsrfToken();

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: 'CSRF token generated',
            },
            { status: 200 },
        );

        // Set token in HttpOnly cookie if it's new
        if (!existingToken) {
            response.cookies.set({
                name: 'csrf-token',
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60, // 1 hour
            });
        }

        return response;
    } catch (error) {
        console.error('[CSRF] Error generating token:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate CSRF token',
            },
            { status: 500 },
        );
    }
}
