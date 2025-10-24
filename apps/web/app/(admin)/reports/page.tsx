'use client';

import ReportsManagement from '@/components/admin/ReportsManagement'
import { logger } from '@pawfectmatch/core';
;

// Mock data for demonstration
const mockReportsData = [
  {
    id: '1',
    title: 'Monthly User Analytics Report',
    description: 'Comprehensive analysis of user engagement and platform metrics',
    type: 'analytics' as const,
    status: 'completed' as const,
    priority: 'high' as const,
    createdBy: {
      id: '1',
      name: 'Admin User',
      email: 'admin@pawfectmatch.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    parameters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      filters: {},
      metrics: ['users', 'engagement', 'revenue'],
      format: 'pdf' as const,
    },
    fileSize: 2048576,
    views: 45,
    isPublic: false,
    tags: ['monthly', 'analytics', 'users'],
    recipients: [],
  },
  {
    id: '2',
    title: 'Security Audit Report',
    description: 'Quarterly security assessment and threat analysis',
    type: 'security' as const,
    status: 'scheduled' as const,
    priority: 'urgent' as const,
    createdBy: {
      id: '2',
      name: 'Security Team',
      email: 'security@pawfectmatch.com',
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    parameters: {
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      filters: { severity: 'high' },
      metrics: ['security', 'threats', 'compliance'],
      format: 'pdf' as const,
    },
    views: 12,
    isPublic: false,
    tags: ['security', 'audit', 'quarterly'],
    recipients: [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@pawfectmatch.com',
        type: 'email' as const,
      },
    ],
    schedule: {
      frequency: 'monthly' as const,
      time: '09:00',
      timezone: 'UTC',
      enabled: true,
    },
  },
  {
    id: '3',
    title: 'Financial Performance Report',
    description: 'Monthly revenue and subscription analytics',
    type: 'financial' as const,
    status: 'running' as const,
    priority: 'medium' as const,
    createdBy: {
      id: '3',
      name: 'Finance Team',
      email: 'finance@pawfectmatch.com',
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    parameters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      filters: { subscription: 'premium' },
      metrics: ['revenue', 'subscriptions', 'churn'],
      format: 'excel' as const,
    },
    views: 8,
    isPublic: false,
    tags: ['financial', 'revenue', 'subscriptions'],
    recipients: [],
  },
];

interface ReportInput {
  title?: string;
  description?: string;
  type?: 'analytics' | 'security' | 'financial' | 'custom' | 'user' | 'performance';
  parameters?: Record<string, unknown>;
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'once';
  time: string;
  timezone: string;
  enabled: boolean;
}

export default function ReportsPage() {
  const handleCreateReport = (report: ReportInput) => {
    logger.info('Creating new report:', { report });
  };

  const handleUpdateReport = (id: string, updates: ReportInput) => {
    logger.info('Updating report:', { id, updates });
  };

  const handleDeleteReport = (id: string) => {
    logger.info('Deleting report:', { id });
  };

  const handleScheduleReport = (id: string, schedule: ReportSchedule | undefined) => {
    logger.info('Scheduling report:', { id, schedule });
  };

  const handleExportReport = (id: string, format: string) => {
    logger.info('Exporting report:', { id, format });
  };

  const handleViewReport = (id: string) => {
    logger.info('Viewing report:', { id });
  };

  return (
    <div className="p-6">
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={handleCreateReport}
        onUpdateReport={handleUpdateReport}
        onDeleteReport={handleDeleteReport}
        onScheduleReport={handleScheduleReport}
        onExportReport={handleExportReport}
        onViewReport={handleViewReport}
      />
    </div>
  );
}
