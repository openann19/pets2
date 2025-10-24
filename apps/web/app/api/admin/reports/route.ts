import { createAuthMiddleware } from '../../../../src/middleware/authMiddleware';
import { logger } from '../../../../src/services/logger';
import { NextRequest, NextResponse } from 'next/server';

// Mock reports data
const mockReportsData = [
  {
    id: 'rpt_001',
    title: 'User Engagement Report',
    type: 'engagement',
    status: 'completed',
    createdAt: '2025-01-10T10:00:00Z',
    generatedBy: 'admin',
    downloadUrl: '/api/admin/reports/rpt_001/download',
    size: 2456789,
    summary: {
      totalUsers: 15420,
      activeUsers: 8934,
      averageSessionTime: 12.5,
    },
  },
  {
    id: 'rpt_002',
    title: 'Revenue Analysis',
    type: 'financial',
    status: 'processing',
    createdAt: '2025-01-10T09:30:00Z',
    generatedBy: 'billing_admin',
    progress: 75,
    estimatedCompletion: '2025-01-10T11:00:00Z',
  },
  {
    id: 'rpt_003',
    title: 'Security Audit',
    type: 'security',
    status: 'failed',
    createdAt: '2025-01-09T15:00:00Z',
    generatedBy: 'admin',
    error: 'Database connection timeout',
  },
];

/**
 * GET /api/admin/reports
 * Returns reports data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize the request
    const authResult = await createAuthMiddleware({
      requireAuth: true,
      requiredPermissions: ['reports:read'],
    })(request);

    // If auth failed, return the response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Auth successful, return reports data
    return NextResponse.json({
      success: true,
      reports: mockReportsData,
      total: mockReportsData.length,
      timestamp: new Date().toISOString(),
      user: authResult.user,
    });
  } catch (error) {
    logger.error('Reports API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reports data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
