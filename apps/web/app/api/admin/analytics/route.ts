import { createAuthMiddleware } from '../../../../src/middleware/authMiddleware';
import { logger } from '../../../../src/services/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/analytics
 * Returns real-time analytics data from MongoDB for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize the request
    const authResult = await createAuthMiddleware({
      requireAuth: true,
      requiredPermissions: ['analytics:read'],
    })(request);

    // If auth failed, return the response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Fetch analytics from backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/admin/analytics`, {
      headers: {
        'Authorization': `Bearer ${authResult.token || ''}`,
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();
    const analytics = data.analytics;

    // Auth successful, return analytics data
    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
      user: authResult.user,
    });
  } catch (error) {
    logger.error('Analytics API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
