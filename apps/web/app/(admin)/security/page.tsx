'use client';

import SecurityAlertsDashboard from '@/components/admin/SecurityAlertsDashboard';
import { logger } from '@pawfectmatch/core';
;

// Mock data for demonstration
const mockSecurityAlertsData = [
  {
    id: '1',
    title: 'Suspicious Login Attempts Detected',
    description: 'Multiple failed login attempts from unknown IP addresses',
    type: 'authentication' as const,
    severity: 'high' as const,
    status: 'investigating' as const,
    priority: 'high' as const,
    source: {
      type: 'system' as const,
      name: 'Security Monitor',
      ip: '192.168.1.100',
      location: 'Unknown',
    },
    affectedResources: [
      {
        type: 'user' as const,
        id: 'user123',
        name: 'John Doe',
        status: 'affected' as const,
      },
    ],
    timeline: [
      {
        timestamp: new Date().toISOString(),
        event: 'Alert Generated',
        description: 'System detected suspicious activity',
        actor: 'Security System',
      },
    ],
    evidence: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['authentication', 'security', 'login'],
    isAcknowledged: false,
    escalationLevel: 0,
    relatedAlerts: [],
    riskScore: 85,
    impactAssessment: {
      confidentiality: 'high' as const,
      integrity: 'medium' as const,
      availability: 'low' as const,
      businessImpact: 'high' as const,
    },
    remediation: {
      steps: [
        {
          id: '1',
          description: 'Block suspicious IP addresses',
          status: 'pending' as const,
        },
      ],
      estimatedTime: '2 hours',
    },
    compliance: {
      frameworks: ['SOC2', 'GDPR'],
      violations: [],
    },
  },
  {
    id: '2',
    title: 'Data Breach Attempt Detected',
    description: 'Unauthorized access attempt to user database',
    type: 'data_breach' as const,
    severity: 'critical' as const,
    status: 'new' as const,
    priority: 'urgent' as const,
    source: {
      type: 'system' as const,
      name: 'Database Monitor',
      ip: '10.0.0.50',
      location: 'Internal Network',
    },
    affectedResources: [
      {
        type: 'database' as const,
        id: 'db001',
        name: 'User Database',
        status: 'compromised' as const,
      },
    ],
    timeline: [
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        event: 'Breach Attempt',
        description: 'SQL injection attempt detected',
        actor: 'Unknown',
      },
    ],
    evidence: [
      {
        type: 'log' as const,
        name: 'database.log',
        url: '/logs/database.log',
        size: 1024,
      },
    ],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    tags: ['data-breach', 'database', 'sql-injection'],
    isAcknowledged: false,
    escalationLevel: 1,
    relatedAlerts: ['1'],
    riskScore: 95,
    impactAssessment: {
      confidentiality: 'high' as const,
      integrity: 'high' as const,
      availability: 'medium' as const,
      businessImpact: 'critical' as const,
    },
    remediation: {
      steps: [
        {
          id: '1',
          description: 'Isolate affected database',
          status: 'in_progress' as const,
        },
        {
          id: '2',
          description: 'Patch SQL injection vulnerability',
          status: 'pending' as const,
        },
      ],
      estimatedTime: '4 hours',
    },
    compliance: {
      frameworks: ['SOC2', 'GDPR', 'HIPAA'],
      violations: [
        {
          framework: 'GDPR',
          control: 'Article 32',
          description: 'Security of processing',
          severity: 'high' as const,
        },
      ],
    },
  },
  {
    id: '3',
    title: 'Malware Detection Alert',
    description: 'Suspicious file upload detected with potential malware',
    type: 'malware' as const,
    severity: 'medium' as const,
    status: 'resolved' as const,
    priority: 'medium' as const,
    source: {
      type: 'automated' as const,
      name: 'Malware Scanner',
      ip: undefined,
      location: 'File Upload System',
    },
    affectedResources: [
      {
        type: 'file' as const,
        id: 'file789',
        name: 'suspicious_image.jpg',
        status: 'isolated' as const,
      },
    ],
    timeline: [
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        event: 'File Uploaded',
        description: 'User uploaded suspicious file',
        actor: 'User: jane.doe@example.com',
      },
      {
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        event: 'Malware Detected',
        description: 'Scanner identified potential threat',
        actor: 'Malware Scanner',
      },
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        event: 'File Quarantined',
        description: 'File moved to quarantine',
        actor: 'Security System',
      },
    ],
    evidence: [
      {
        type: 'file' as const,
        name: 'suspicious_image.jpg',
        url: '/quarantine/suspicious_image.jpg',
        size: 2048576,
        hash: 'sha256:abc123...',
      },
    ],
    assignedTo: {
      id: 'sec1',
      name: 'Security Analyst',
      email: 'analyst@pawfectmatch.com',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolvedBy: {
      id: 'sec1',
      name: 'Security Analyst',
      email: 'analyst@pawfectmatch.com',
    },
    tags: ['malware', 'file-upload', 'quarantine'],
    isAcknowledged: true,
    acknowledgmentBy: {
      id: 'sec1',
      name: 'Security Analyst',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    escalationLevel: 0,
    relatedAlerts: [],
    riskScore: 65,
    impactAssessment: {
      confidentiality: 'low' as const,
      integrity: 'medium' as const,
      availability: 'low' as const,
      businessImpact: 'medium' as const,
    },
    remediation: {
      steps: [
        {
          id: '1',
          description: 'Quarantine suspicious file',
          status: 'completed' as const,
          completedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          description: 'Notify user of file rejection',
          status: 'completed' as const,
          completedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        },
      ],
      estimatedTime: '1 hour',
      actualTime: '30 minutes',
    },
    compliance: {
      frameworks: ['SOC2'],
      violations: [],
    },
  },
];

export default function SecurityPage() {
  const handleAcknowledgeAlert = (id: string) => {
    logger.info('Acknowledging alert:', { id });
  };

  const handleResolveAlert = (id: string, resolution: string) => {
    logger.info('Resolving alert:', { id, resolution });
  };

  const handleEscalateAlert = (id: string, level: number) => {
    logger.info('Escalating alert:', { id, level });
  };

  const handleAssignAlert = (id: string, assigneeId: string) => {
    logger.info('Assigning alert:', { id, assigneeId });
  };

  const handleExportAlerts = (format: 'csv' | 'pdf' | 'json') => {
    logger.info('Exporting alerts in format:', { format });
  };

  const handleDeleteAlert = (id: string) => {
    logger.info('Deleting alert:', { id });
  };

  const handleUpdateAlert = (id: string, updates: Record<string, unknown>) => {
    logger.info('Updating alert:', { id, updates });
  };

  const handleViewAlert = (id: string) => {
    logger.info('Viewing alert:', { id });
  };

  const handleRefresh = () => {
    logger.info('Refreshing security alerts...');
  };

  return (
    <div className="p-6">
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onResolveAlert={handleResolveAlert}
        onEscalateAlert={handleEscalateAlert}
        onAssignAlert={handleAssignAlert}
        onUpdateAlert={handleUpdateAlert}
        onDeleteAlert={handleDeleteAlert}
        onExportAlerts={handleExportAlerts}
        onViewAlert={handleViewAlert}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
