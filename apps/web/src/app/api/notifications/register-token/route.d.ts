/**
 * API Route for Registering FCM Tokens
 * Stores push notification tokens for users
 */
import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    message: any;
}>>;
//# sourceMappingURL=route.d.ts.map