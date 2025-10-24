import React from 'react';
interface SecurityAlert {
    id: string;
    title: string;
    description: string;
    type: 'authentication' | 'authorization' | 'data_breach' | 'suspicious_activity' | 'system_intrusion' | 'malware' | 'phishing' | 'ddos' | 'insider_threat' | 'compliance_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'new' | 'investigating' | 'resolved' | 'false_positive' | 'escalated';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    source: {
        type: 'system' | 'user_report' | 'automated' | 'external';
        name: string;
        ip?: string;
        userAgent?: string;
        location?: string;
    };
    affectedResources: Array<{
        type: 'user' | 'system' | 'database' | 'file' | 'network';
        id: string;
        name: string;
        status: 'affected' | 'compromised' | 'isolated' | 'recovered';
    }>;
    timeline: Array<{
        timestamp: string;
        event: string;
        description: string;
        actor: string;
        action?: string;
    }>;
    evidence: Array<{
        type: 'log' | 'screenshot' | 'network_traffic' | 'file' | 'database_record';
        name: string;
        url: string;
        size: number;
        hash?: string;
    }>;
    assignedTo?: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    resolvedBy?: {
        id: string;
        name: string;
        email: string;
    };
    tags: string[];
    isAcknowledged: boolean;
    acknowledgmentBy?: {
        id: string;
        name: string;
        timestamp: string;
    };
    escalationLevel: number;
    relatedAlerts: string[];
    riskScore: number;
    impactAssessment: {
        confidentiality: 'low' | 'medium' | 'high';
        integrity: 'low' | 'medium' | 'high';
        availability: 'low' | 'medium' | 'high';
        businessImpact: 'low' | 'medium' | 'high' | 'critical';
    };
    remediation: {
        steps: Array<{
            id: string;
            description: string;
            status: 'pending' | 'in_progress' | 'completed' | 'failed';
            assignedTo?: string;
            dueDate?: string;
            completedAt?: string;
        }>;
        estimatedTime: string;
        actualTime?: string;
        cost?: number;
    };
    compliance: {
        frameworks: string[];
        violations: Array<{
            framework: string;
            control: string;
            description: string;
            severity: 'low' | 'medium' | 'high';
        }>;
    };
}
interface SecurityAlertsDashboardProps {
    alerts: SecurityAlert[];
    isLoading?: boolean;
    onAcknowledgeAlert?: (id: string) => void;
    onResolveAlert?: (id: string, resolution: string) => void;
    onEscalateAlert?: (id: string, level: number) => void;
    onAssignAlert?: (id: string, assigneeId: string) => void;
    onUpdateAlert?: (id: string, updates: Partial<SecurityAlert>) => void;
    onDeleteAlert?: (id: string) => void;
    onExportAlerts?: (format: 'csv' | 'pdf' | 'json') => void;
    onViewAlert?: (id: string) => void;
    onRefresh?: () => void;
}
declare const SecurityAlertsDashboard: React.FC<SecurityAlertsDashboardProps>;
export default SecurityAlertsDashboard;
//# sourceMappingURL=SecurityAlertsDashboard.d.ts.map