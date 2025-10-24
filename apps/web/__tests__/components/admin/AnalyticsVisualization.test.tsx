import AnalyticsVisualization from '@/components/admin/AnalyticsVisualization';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Radar: () => <div data-testid="radar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date) => 'Jan 01'),
  subDays: jest.fn(
    (date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
  ),
  subWeeks: jest.fn(
    (date: Date, weeks: number) => new Date(date.getTime() - weeks * 7 * 24 * 60 * 60 * 1000),
  ),
  subMonths: jest.fn(
    (date: Date, months: number) => new Date(date.getTime() - months * 30 * 24 * 60 * 60 * 1000),
  ),
  startOfDay: jest.fn((date: Date) => date),
  endOfDay: jest.fn((date: Date) => date),
}));

const mockAnalyticsData = {
  users: {
    total: 15420,
    active: 12850,
    suspended: 120,
    banned: 45,
    verified: 8950,
    recent24h: 234,
    growth: 12.5,
    trend: 'up' as const,
  },
  pets: {
    total: 18950,
    active: 16500,
    recent24h: 189,
    growth: 8.3,
    trend: 'up' as const,
  },
  matches: {
    total: 45670,
    active: 38900,
    blocked: 1200,
    recent24h: 567,
    growth: 15.2,
    trend: 'up' as const,
  },
  messages: {
    total: 234500,
    deleted: 1200,
    recent24h: 3450,
    growth: 22.1,
    trend: 'up' as const,
  },
  engagement: {
    dailyActiveUsers: 8950,
    weeklyActiveUsers: 23400,
    monthlyActiveUsers: 45600,
    averageSessionDuration: 18.5,
    bounceRate: 12.3,
    retentionRate: 78.5,
  },
  revenue: {
    totalRevenue: 125000,
    monthlyRecurringRevenue: 45000,
    averageRevenuePerUser: 8.1,
    conversionRate: 12.5,
    churnRate: 3.2,
  },
  timeSeries: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    users: Math.floor(Math.random() * 1000) + 5000,
    pets: Math.floor(Math.random() * 1200) + 6000,
    matches: Math.floor(Math.random() * 2000) + 8000,
    messages: Math.floor(Math.random() * 5000) + 15000,
    revenue: Math.floor(Math.random() * 5000) + 2000,
    engagement: Math.floor(Math.random() * 100) + 50,
  })),
  topPerformers: [
    { id: '1', name: 'Golden Retriever Max', type: 'pet' as const, score: 98.5, metric: 'matches' },
    { id: '2', name: 'Sarah Johnson', type: 'user' as const, score: 95.2, metric: 'engagement' },
  ],
  geographicData: [
    { country: 'United States', users: 8500, revenue: 65000, growth: 15.2 },
    { country: 'Canada', users: 3200, revenue: 25000, growth: 12.8 },
  ],
  deviceStats: [
    { device: 'Mobile', count: 12500, percentage: 65.8 },
    { device: 'Desktop', count: 4500, percentage: 23.7 },
  ],
  securityMetrics: {
    totalAlerts: 45,
    criticalAlerts: 3,
    resolvedAlerts: 38,
    averageResponseTime: 15,
  },
};

describe('AnalyticsVisualization', () => {
  const mockOnRefresh = jest.fn();
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={true}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders key metrics cards', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Pets')).toBeInTheDocument();
    expect(screen.getByText('Total Matches')).toBeInTheDocument();
    expect(screen.getByText('Messages Sent')).toBeInTheDocument();
  });

  it('renders engagement metrics', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Daily Active Users')).toBeInTheDocument();
    expect(screen.getByText('Avg Session Duration')).toBeInTheDocument();
    expect(screen.getByText('Retention Rate')).toBeInTheDocument();
  });

  it('renders revenue metrics', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Monthly Recurring')).toBeInTheDocument();
    expect(screen.getByText('ARPU')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('renders security metrics', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Security Overview')).toBeInTheDocument();
    expect(screen.getByText('Total Alerts')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders top performers section', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Top Performers')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever Max')).toBeInTheDocument();
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
  });

  it('handles period selection', async () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    const periodSelect = screen.getByLabelText('Select time period');
    fireEvent.change(periodSelect, { target: { value: '90d' } });

    expect(periodSelect).toHaveValue('90d');
  });

  it('handles view mode selection', async () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    const viewModeSelect = screen.getByLabelText('Select view mode');
    fireEvent.change(viewModeSelect, { target: { value: 'detailed' } });

    expect(viewModeSelect).toHaveValue('detailed');
  });

  it('handles chart type selection', async () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const chartTypeSelect = screen.getByDisplayValue('Line Chart');
      fireEvent.change(chartTypeSelect, { target: { value: 'area' } });
      expect(chartTypeSelect).toHaveValue('area');
    });
  });

  it('handles metric focus selection', async () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const metricSelect = screen.getByDisplayValue('Users');
      fireEvent.change(metricSelect, { target: { value: 'pets' } });
      expect(metricSelect).toHaveValue('pets');
    });
  });

  it('handles refresh button click', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    const refreshButton = screen.getByLabelText('Refresh data');
    fireEvent.click(refreshButton);

    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });

  it('handles export button click', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    const exportButton = screen.getByLabelText('Export data');
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledWith('csv');
  });

  it('toggles auto-refresh setting', async () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    // Open filters
    const filtersButton = screen.getByLabelText('Toggle filters');
    fireEvent.click(filtersButton);

    await waitFor(() => {
      const autoRefreshCheckbox = screen.getByLabelText('Auto-refresh');
      fireEvent.click(autoRefreshCheckbox);
      expect(autoRefreshCheckbox).toBeChecked();
    });
  });

  it('displays correct metric values', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('15.4K')).toBeInTheDocument(); // Total Users
    expect(screen.getByText('19.0K')).toBeInTheDocument(); // Active Pets
    expect(screen.getByText('45.7K')).toBeInTheDocument(); // Total Matches
    expect(screen.getByText('234.5K')).toBeInTheDocument(); // Messages Sent
  });

  it('displays growth indicators', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('+8.3%')).toBeInTheDocument();
    expect(screen.getByText('+15.2%')).toBeInTheDocument();
    expect(screen.getByText('+22.1%')).toBeInTheDocument();
  });

  it('renders charts with correct types', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      ...mockAnalyticsData,
      timeSeries: [],
      topPerformers: [],
      geographicData: [],
      deviceStats: [],
    };

    render(
      <AnalyticsVisualization
        data={emptyData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('applies correct ARIA labels', () => {
    render(
      <AnalyticsVisualization
        data={mockAnalyticsData}
        isLoading={false}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
      />,
    );

    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Analytics dashboard');
    expect(screen.getByLabelText('Select time period')).toBeInTheDocument();
    expect(screen.getByLabelText('Select view mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Refresh data')).toBeInTheDocument();
    expect(screen.getByLabelText('Export data')).toBeInTheDocument();
  });
});
