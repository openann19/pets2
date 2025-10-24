export interface AlertEvidence {
    type: 'log' | 'file' | string;
    name: string;
    url: string;
    size?: number;
    hash?: string;
}
export interface AlertTimelineItem {
    timestamp: string;
    event: string;
    description?: string;
    actor?: string;
}
export interface AlertResource {
    type: string;
    id: string;
    name: string;
    status: string;
}
export interface Alert {
    id: string;
    title: string;
    description: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'new' | 'investigating' | 'resolved' | 'false_positive' | 'escalated';
    priority?: 'urgent' | 'high' | 'medium' | 'low';
    source?: {
        type: string;
        name: string;
        ip?: string | undefined;
        location?: string | undefined;
        userAgent?: string | undefined;
    };
    affectedResources?: AlertResource[];
    timeline?: AlertTimelineItem[];
    evidence?: AlertEvidence[];
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    isAcknowledged?: boolean;
    escalationLevel?: number;
    relatedAlerts?: string[];
    riskScore: number;
    impactAssessment?: {
        confidentiality: 'low' | 'medium' | 'high' | 'critical';
        integrity: 'low' | 'medium' | 'high' | 'critical';
        availability: 'low' | 'medium' | 'high' | 'critical';
        businessImpact: 'low' | 'medium' | 'high' | 'critical';
    } | undefined;
    remediation?: {
        steps: Array<{
            id: string;
            description: string;
            status: 'pending' | 'in_progress' | 'completed' | 'failed';
            assignedTo?: string;
            dueDate?: string;
            completedAt?: string;
        }>;
        estimatedTime?: string;
        actualTime?: string;
    };
    assignedTo?: {
        id: string;
        name: string;
        email: string;
    };
    resolvedAt?: string;
    resolvedBy?: {
        id: string;
        name: string;
        email: string;
    };
    acknowledgmentBy?: {
        id: string;
        name: string;
        timestamp: string;
    };
}
export interface SecurityAlertsDashboardProps {
    alerts: Alert[];
    isLoading?: boolean;
    onAcknowledgeAlert?: (id: string) => void;
    onResolveAlert?: (id: string, resolution: string) => void;
    onEscalateAlert?: (id: string, level: number) => void;
    onAssignAlert?: (id: string, assigneeId: string) => void;
    onUpdateAlert?: (id: string, updates: Partial<Alert>) => void;
    onDeleteAlert?: (id: string) => void;
    onExportAlerts?: (format: 'csv' | 'pdf' | 'json') => void;
    onViewAlert?: (id: string) => void;
    onRefresh?: () => void;
}
declare const SecurityAlertsDashboard: (props: SecurityAlertsDashboardProps) => JSX.Element;
export default SecurityAlertsDashboard;
//# sourceMappingURL=SecurityAlertsDashboard.d.ts.map