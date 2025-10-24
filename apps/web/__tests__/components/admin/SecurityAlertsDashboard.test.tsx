import SecurityAlertsDashboard from '@/components/admin/SecurityAlertsDashboard';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date) => 'Jan 01, 2024'),
  parseISO: jest.fn((date: string) => new Date(date)),
  subDays: jest.fn(
    (date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
  ),
  subHours: jest.fn(
    (date: Date, hours: number) => new Date(date.getTime() - hours * 60 * 60 * 1000),
  ),
  subMinutes: jest.fn(
    (date: Date, minutes: number) => new Date(date.getTime() - minutes * 60 * 1000),
  ),
}));

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
];

describe('SecurityAlertsDashboard', () => {
  const mockOnAcknowledgeAlert = jest.fn();
  const mockOnResolveAlert = jest.fn();
  const mockOnEscalateAlert = jest.fn();
  const mockOnAssignAlert = jest.fn();
  const mockOnUpdateAlert = jest.fn();
  const mockOnDeleteAlert = jest.fn();
  const mockOnExportAlerts = jest.fn();
  const mockOnViewAlert = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('Security Alerts Dashboard')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={true}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders statistics cards', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('Critical Alerts')).toBeInTheDocument();
    expect(screen.getByText('Under Investigation')).toBeInTheDocument();
    expect(screen.getByText('New Alerts')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('displays alert cards', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('Suspicious Login Attempts Detected')).toBeInTheDocument();
    expect(screen.getByText('Data Breach Attempt Detected')).toBeInTheDocument();
  });

  it('displays alert severity badges', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('displays alert status badges', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('INVESTIGATING')).toBeInTheDocument();
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('displays alert descriptions', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(
      screen.getByText('Multiple failed login attempts from unknown IP addresses'),
    ).toBeInTheDocument();
    expect(screen.getByText('Unauthorized access attempt to user database')).toBeInTheDocument();
  });

  it('displays risk scores', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('Risk Score: 85')).toBeInTheDocument();
    expect(screen.getByText('Risk Score: 95')).toBeInTheDocument();
  });

  it('displays alert tags', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('authentication')).toBeInTheDocument();
    expect(screen.getByText('security')).toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.getByText('data-breach')).toBeInTheDocument();
    expect(screen.getByText('database')).toBeInTheDocument();
    expect(screen.getByText('sql-injection')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const searchInput = screen.getByLabelText('Search alerts');
    fireEvent.change(searchInput, { target: { value: 'login' } });

    await waitFor(() => {
      expect(screen.getByText('Suspicious Login Attempts Detected')).toBeInTheDocument();
      expect(screen.queryByText('Data Breach Attempt Detected')).not.toBeInTheDocument();
    });
  });

  it('handles type filtering', async () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const typeSelect = screen.getByDisplayValue('All Types');
      fireEvent.change(typeSelect, { target: { value: 'authentication' } });
      expect(typeSelect).toHaveValue('authentication');
    });
  });

  it('handles severity filtering', async () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const severitySelect = screen.getByDisplayValue('All Severities');
      fireEvent.change(severitySelect, { target: { value: 'high' } });
      expect(severitySelect).toHaveValue('high');
    });
  });

  it('handles status filtering', async () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const statusSelect = screen.getByDisplayValue('All Statuses');
      fireEvent.change(statusSelect, { target: { value: 'new' } });
      expect(statusSelect).toHaveValue('new');
    });
  });

  it('handles priority filtering', async () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const prioritySelect = screen.getByDisplayValue('All Priorities');
      fireEvent.change(prioritySelect, { target: { value: 'urgent' } });
      expect(prioritySelect).toHaveValue('urgent');
    });
  });

  it('handles sorting', async () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const sortSelect = screen.getByDisplayValue('Created Date');
      fireEvent.change(sortSelect, { target: { value: 'severity' } });
      expect(sortSelect).toHaveValue('severity');
    });
  });

  it('handles view mode toggle', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const viewModeButton = screen.getByLabelText('Switch to grid view');
    fireEvent.click(viewModeButton);

    expect(viewModeButton).toHaveAttribute('aria-label', 'Switch to list view');
  });

  it('handles alert acknowledgment', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const acknowledgeButtons = screen.getAllByLabelText(/Acknowledge/);
    fireEvent.click(acknowledgeButtons[0]);

    expect(mockOnAcknowledgeAlert).toHaveBeenCalledWith('1');
  });

  it('handles alert resolution', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const resolveButtons = screen.getAllByLabelText(/Resolve/);
    fireEvent.click(resolveButtons[0]);

    expect(mockOnResolveAlert).toHaveBeenCalledWith('1', 'Resolved by admin');
  });

  it('handles alert editing', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const editButtons = screen.getAllByLabelText(/Edit/);
    fireEvent.click(editButtons[0]);

    expect(mockOnUpdateAlert).toHaveBeenCalledWith('1', {});
  });

  it('handles alert deletion', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const deleteButtons = screen.getAllByLabelText(/Delete/);
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteAlert).toHaveBeenCalledWith('1');
  });

  it('handles alert export', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const exportButton = screen.getByLabelText('Export alerts');
    fireEvent.click(exportButton);

    expect(mockOnExportAlerts).toHaveBeenCalledWith('csv');
  });

  it('handles refresh', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const refreshButton = screen.getByLabelText('Refresh alerts');
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('displays pagination controls', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('Showing 2 of 2 alerts')).toBeInTheDocument();
  });

  it('displays empty state when no alerts', () => {
    render(
      <SecurityAlertsDashboard
        alerts={[]}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText('No security alerts found')).toBeInTheDocument();
    expect(screen.getByText('All security systems are operating normally.')).toBeInTheDocument();
  });

  it('displays empty state when filtered results are empty', async () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    const searchInput = screen.getByLabelText('Search alerts');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No security alerts found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your search criteria or filters.'),
      ).toBeInTheDocument();
    });
  });

  it('applies correct ARIA labels', () => {
    render(
      <SecurityAlertsDashboard
        alerts={mockSecurityAlertsData}
        isLoading={false}
        onAcknowledgeAlert={mockOnAcknowledgeAlert}
        onResolveAlert={mockOnResolveAlert}
        onEscalateAlert={mockOnEscalateAlert}
        onAssignAlert={mockOnAssignAlert}
        onUpdateAlert={mockOnUpdateAlert}
        onDeleteAlert={mockOnDeleteAlert}
        onExportAlerts={mockOnExportAlerts}
        onViewAlert={mockOnViewAlert}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Security alerts dashboard');
    expect(screen.getByLabelText('Search alerts')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Export alerts')).toBeInTheDocument();
    expect(screen.getByLabelText('Refresh alerts')).toBeInTheDocument();
  });
});
