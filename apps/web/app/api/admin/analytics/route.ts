import { createAuthMiddleware } from '../../../../src/middleware/authMiddleware';
import { logger } from '../../../../src/services/logger';
import { NextRequest, NextResponse } from 'next/server';

// Mock analytics data - in production, this would come from database
const mockAnalyticsData = {
  users: {
    total: 15420,
    active: 8934,
    growth: 12.5,
    trend: 'up',
    recent24h: 245,
  },
  pets: {
    total: 23180,
    active: 18750,
    growth: 8.3,
    trend: 'up',
    recent24h: 189,
  },
  matches: {
    total: 45670,
    successful: 32450,
    successRate: 71.1,
    averageTime: 15, // minutes
    recent24h: 892,
  },
  messages: {
    total: 123450,
    sentToday: 2340,
    averagePerUser: 8.2,
    responseRate: 68.4,
  },
  engagement: {
    averageSession: 12.5, // minutes
    dailyActiveUsers: 8934,
    weeklyActiveUsers: 45230,
    monthlyActiveUsers: 98450,
    bounceRate: 23.1,
  },
  revenue: {
    totalRevenue: 145670,
    monthlyRecurringRevenue: 89340,
    averageRevenuePerUser: 9.42,
    churnRate: 4.2,
    subscriptions: {
      basic: 45230,
      premium: 12340,
      ultimate: 2890,
    },
  },
};

/**
 * GET /api/admin/analytics
 * Returns analytics data for admin dashboard
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

    // Auth successful, return analytics data
    return NextResponse.json({
      success: true,
      analytics: mockAnalyticsData,
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
