import React from 'react';
interface Report {
    id: string;
    title: string;
    description: string;
    type: 'analytics' | 'financial' | 'user' | 'security' | 'performance' | 'custom';
    status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdBy: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
    scheduledAt?: string;
    completedAt?: string;
    parameters: {
        dateRange: {
            start: string;
            end: string;
        };
        filters: Record<string, unknown>;
        metrics: string[];
        format: 'pdf' | 'csv' | 'excel' | 'json';
    };
    fileSize?: number;
    downloadUrl?: string;
    views: number;
    isPublic: boolean;
    tags: string[];
    recipients: Array<{
        id: string;
        name: string;
        email: string;
        type: 'email' | 'webhook' | 'ftp';
    }>;
    schedule?: {
        frequency: 'once' | 'daily' | 'weekly' | 'monthly';
        time: string;
        timezone: string;
        enabled: boolean;
    };
}
interface ReportsManagementProps {
    reports: Report[];
    isLoading?: boolean;
    onCreateReport?: (report: Partial<Report>) => void;
    onUpdateReport?: (id: string, updates: Partial<Report>) => void;
    onDeleteReport?: (id: string) => void;
    onScheduleReport?: (id: string, schedule: Report['schedule']) => void;
    onExportReport?: (id: string, format: string) => void;
    onViewReport?: (id: string) => void;
}
declare const ReportsManagement: React.FC<ReportsManagementProps>;
export default ReportsManagement;
//# sourceMappingURL=ReportsManagement.d.ts.map