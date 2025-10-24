import { createAuthMiddleware } from '../../../../src/middleware/authMiddleware';
import { logger } from '../../../../src/services/logger';
import { NextRequest, NextResponse } from 'next/server';

// Mock security alerts data
const mockSecurityAlerts = [
  {
    id: 'alert_001',
    type: 'suspicious_login',
    severity: 'high',
    status: 'unresolved',
    userId: 'usr_12345',
    userEmail: 'suspicious@example.com',
    description: 'Multiple failed login attempts from unusual location',
    location: 'Unknown Location',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2025-01-10T08:30:00Z',
    actions: ['block_ip', 'notify_user', 'require_verification'],
  },
  {
    id: 'alert_002',
    type: 'data_export',
    severity: 'medium',
    status: 'resolved',
    userId: 'usr_67890',
    userEmail: 'researcher@university.edu',
    description: 'Large data export request approved for research purposes',
    dataType: 'user_analytics',
    recordCount: 50000,
    timestamp: '2025-01-10T07:15:00Z',
    resolvedBy: 'admin',
    resolution: 'Approved for academic research',
  },
  {
    id: 'alert_003',
    type: 'api_abuse',
    severity: 'low',
    status: 'monitoring',
    description: 'High-frequency API calls detected',
    endpoint: '/api/matches/search',
    requestCount: 150,
    timeWindow: '5 minutes',
    ipAddress: '10.0.0.50',
    timestamp: '2025-01-10T06:45:00Z',
    automatedAction: 'rate_limited',
  },
  {
    id: 'alert_004',
    type: 'content_violation',
    severity: 'medium',
    status: 'pending_review',
    userId: 'usr_54321',
    userEmail: 'user@example.com',
    description: 'Potential inappropriate content in pet profile',
    contentType: 'pet_description',
    contentId: 'pet_98765',
    timestamp: '2025-01-10T05:20:00Z',
    flaggedBy: 'automated_system',
    reviewPriority: 'normal',
  },
];

/**
 * GET /api/admin/security-alerts
 * Returns security alerts data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize the request
    const authResult = await createAuthMiddleware({
      requireAuth: true,
      requiredPermissions: ['security:read'],
    })(request);

    // If auth failed, return the response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Auth successful, return security alerts data
    return NextResponse.json({
      success: true,
      alerts: mockSecurityAlerts,
      summary: {
        total: mockSecurityAlerts.length,
        unresolved: mockSecurityAlerts.filter((alert) => alert.status === 'unresolved').length,
        highSeverity: mockSecurityAlerts.filter((alert) => alert.severity === 'high').length,
        recent24h: mockSecurityAlerts.filter(
          (alert) => new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000),
        ).length,
      },
      timestamp: new Date().toISOString(),
      user: authResult.user,
    });
  } catch (error) {
    logger.error('Security alerts API error', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch security alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
