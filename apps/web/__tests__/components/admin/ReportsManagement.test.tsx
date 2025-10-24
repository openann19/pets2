import ReportsManagement from '@/components/admin/ReportsManagement';
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
}));

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
];

describe('ReportsManagement', () => {
  const mockOnCreateReport = jest.fn();
  const mockOnUpdateReport = jest.fn();
  const mockOnDeleteReport = jest.fn();
  const mockOnScheduleReport = jest.fn();
  const mockOnExportReport = jest.fn();
  const mockOnViewReport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('Reports Management')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={true}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders report cards', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('Monthly User Analytics Report')).toBeInTheDocument();
    expect(screen.getByText('Security Audit Report')).toBeInTheDocument();
  });

  it('displays report status badges', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('displays priority badges', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('displays report descriptions', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(
      screen.getByText('Comprehensive analysis of user engagement and platform metrics'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Quarterly security assessment and threat analysis'),
    ).toBeInTheDocument();
  });

  it('displays report metadata', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('Views: 45')).toBeInTheDocument();
    expect(screen.getByText('Views: 12')).toBeInTheDocument();
    expect(screen.getByText('Size: 2.0 MB')).toBeInTheDocument();
  });

  it('displays report tags', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('monthly')).toBeInTheDocument();
    expect(screen.getByText('analytics')).toBeInTheDocument();
    expect(screen.getByText('users')).toBeInTheDocument();
    expect(screen.getByText('security')).toBeInTheDocument();
    expect(screen.getByText('audit')).toBeInTheDocument();
    expect(screen.getByText('quarterly')).toBeInTheDocument();
  });

  it('displays creator information', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Security Team')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const searchInput = screen.getByLabelText('Search reports');
    fireEvent.change(searchInput, { target: { value: 'analytics' } });

    await waitFor(() => {
      expect(screen.getByText('Monthly User Analytics Report')).toBeInTheDocument();
      expect(screen.queryByText('Security Audit Report')).not.toBeInTheDocument();
    });
  });

  it('handles type filtering', async () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const typeSelect = screen.getByDisplayValue('All Types');
      fireEvent.change(typeSelect, { target: { value: 'analytics' } });
      expect(typeSelect).toHaveValue('analytics');
    });
  });

  it('handles status filtering', async () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const statusSelect = screen.getByDisplayValue('All Statuses');
      fireEvent.change(statusSelect, { target: { value: 'completed' } });
      expect(statusSelect).toHaveValue('completed');
    });
  });

  it('handles priority filtering', async () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const prioritySelect = screen.getByDisplayValue('All Priorities');
      fireEvent.change(prioritySelect, { target: { value: 'high' } });
      expect(prioritySelect).toHaveValue('high');
    });
  });

  it('handles sorting', async () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const sortSelect = screen.getByDisplayValue('Created Date');
      fireEvent.change(sortSelect, { target: { value: 'title' } });
      expect(sortSelect).toHaveValue('title');
    });
  });

  it('handles view mode toggle', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const viewModeButton = screen.getByLabelText('Switch to list view');
    fireEvent.click(viewModeButton);

    expect(viewModeButton).toHaveAttribute('aria-label', 'Switch to grid view');
  });

  it('handles new report creation', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const newReportButton = screen.getByLabelText('Create new report');
    fireEvent.click(newReportButton);

    expect(mockOnCreateReport).toHaveBeenCalledTimes(1);
  });

  it('handles report viewing', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const viewButtons = screen.getAllByLabelText(/View/);
    fireEvent.click(viewButtons[0]);

    expect(mockOnViewReport).toHaveBeenCalledWith('1');
  });

  it('handles report export', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const exportButtons = screen.getAllByLabelText(/Export/);
    fireEvent.click(exportButtons[0]);

    expect(mockOnExportReport).toHaveBeenCalledWith('1', 'pdf');
  });

  it('handles report editing', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const editButtons = screen.getAllByLabelText(/Edit/);
    fireEvent.click(editButtons[0]);

    expect(mockOnUpdateReport).toHaveBeenCalledWith('1', {});
  });

  it('handles report deletion', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const deleteButtons = screen.getAllByLabelText(/Delete/);
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteReport).toHaveBeenCalledWith('1');
  });

  it('displays pagination controls', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('Showing 2 of 2 reports')).toBeInTheDocument();
  });

  it('handles items per page change', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const itemsPerPageSelect = screen.getByDisplayValue('10');
    fireEvent.change(itemsPerPageSelect, { target: { value: '25' } });

    expect(itemsPerPageSelect).toHaveValue('25');
  });

  it('displays empty state when no reports', () => {
    render(
      <ReportsManagement
        reports={[]}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByText('No reports found')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first report.')).toBeInTheDocument();
  });

  it('displays empty state when filtered results are empty', async () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    const searchInput = screen.getByLabelText('Search reports');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No reports found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your search criteria or filters.'),
      ).toBeInTheDocument();
    });
  });

  it('applies correct ARIA labels', () => {
    render(
      <ReportsManagement
        reports={mockReportsData}
        isLoading={false}
        onCreateReport={mockOnCreateReport}
        onUpdateReport={mockOnUpdateReport}
        onDeleteReport={mockOnDeleteReport}
        onScheduleReport={mockOnScheduleReport}
        onExportReport={mockOnExportReport}
        onViewReport={mockOnViewReport}
      />,
    );

    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Reports management');
    expect(screen.getByLabelText('Search reports')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Create new report')).toBeInTheDocument();
  });
});
