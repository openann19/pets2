/**
 * API Route for Feedback Submission
 * Posts feedback to Slack or Linear based on configuration
 */
import { NextRequest, NextResponse } from 'next/server';
export declare function POST(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    message: string;
}>>;
//# sourceMappingURL=route.d.ts.map