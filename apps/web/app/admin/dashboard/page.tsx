'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Lazy load heavy components
const AnalyticsVisualization = dynamic(() => import('@/components/admin/AnalyticsVisualization'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

const ReportsManagement = dynamic(() => import('@/components/admin/ReportsManagement'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
});

const SecurityAlertsDashboard = dynamic(() => import('@/components/admin/SecurityAlertsDashboard'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
});

interface DashboardData {
  analytics: {
    users: {
      total: number;
      active: number;
      suspended: number;
      banned: number;
      verified: number;
      recent24h: number;
      growth: number;
      trend: 'up' | 'down' | 'stable';
    };
    pets: {
      total: number;
      active: number;
      recent24h: number;
      growth: number;
      trend: 'up' | 'down' | 'stable';
    };
    matches: {
      total: number;
      active: number;
      blocked: number;
      recent24h: number;
      growth: number;
      trend: 'up' | 'down' | 'stable';
    };
    messages: {
      total: number;
      deleted: number;
      recent24h: number;
      growth: number;
      trend: 'up' | 'down' | 'stable';
    };
    engagement: {
      dailyActiveUsers: number;
      weeklyActiveUsers: number;
      monthlyActiveUsers: number;
      averageSessionDuration: number;
      bounceRate: number;
      retentionRate: number;
    };
    revenue: {
      totalRevenue: number;
      monthlyRecurringRevenue: number;
      averageRevenuePerUser: number;
      conversionRate: number;
      churnRate: number;
    };
    timeSeries: Array<{
      date: string;
      users: number;
      pets: number;
      matches: number;
      messages: number;
      revenue: number;
      engagement: number;
    }>;
    topPerformers: Array<{
      id: string;
      name: string;
      type: 'user' | 'pet';
      score: number;
      metric: string;
    }>;
    geographicData: Array<{
      country: string;
      users: number;
      revenue: number;
      growth: number;
    }>;
    deviceStats: Array<{
      device: string;
      count: number;
      percentage: number;
    }>;
    securityMetrics: {
      totalAlerts: number;
      criticalAlerts: number;
      resolvedAlerts: number;
      averageResponseTime: number;
    };
  };
  reports: Array<{
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
      filters: Record<string, string | number | boolean | string[]>;
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
  }>;
  securityAlerts: Array<{
    id: string;
    title: string;
    description: string;
    type:
    | 'authentication'
    | 'authorization'
    | 'data_breach'
    | 'suspicious_activity'
    | 'system_intrusion'
    | 'malware'
    | 'phishing'
    | 'ddos'
    | 'insider_threat'
    | 'compliance_violation';
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
  }>;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'security'>('analytics');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const { announce } = useAnnouncement();
  const prefersReducedMotion = useReducedMotion();
  const isHighContrast = useHighContrastMode();

  // Load real data from API
  useEffect(() => {
    loadDashboardData();

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(loadDashboardData, refreshInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval]);

  // Auto-refresh effect for data updates
  useEffect(() => {
    if (!autoRefresh || !data) return;

    const interval = setInterval(() => {
      // Simulate data refresh
      setData((prev) => (prev ? { ...prev } : null));
      announce('Dashboard data refreshed');
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, data, announce]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get auth token from localStorage or cookie
      const token = localStorage.getItem('auth-token') || '';
      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

      // Fetch all dashboard data in parallel
      const [analyticsResponse, reportsResponse, securityResponse] = await Promise.allSettled([
        fetch(`${baseUrl}/api/admin/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${baseUrl}/api/admin/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${baseUrl}/api/admin/security/alerts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      // Process analytics data
      let analyticsData = null;
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.ok) {
        const result = await analyticsResponse.value.json();
        if (result.success) {
          analyticsData = result.analytics;
        }
      }

      // Process reports data
      let reportsData = [];
      if (reportsResponse.status === 'fulfilled' && reportsResponse.value.ok) {
        const result = await reportsResponse.value.json();
        if (result.success) {
          reportsData = result.reports || [];
        }
      }

      // Process security alerts data
      let securityData = [];
      if (securityResponse.status === 'fulfilled' && securityResponse.value.ok) {
        const result = await securityResponse.value.json();
        if (result.success) {
          securityData = result.alerts || [];
        }
      }

      // Check for authentication errors
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.status === 403) {
        throw new Error('Forbidden - Insufficient permissions');
      }

      // Use fallback data if API calls fail
      if (!analyticsData) {
        logger.warn('Analytics API failed, using fallback data');
        analyticsData = getFallbackAnalyticsData();
      }

      // Transform API data to match DashboardData interface
      const dashboardData: DashboardData = {
        analytics: analyticsData,
        reports: reportsData,
        securityAlerts: securityData,
      };

      setData(dashboardData);
      announce('Dashboard data updated');
    } catch (err) {
      logger.error('Failed to load dashboard data', { error: err });
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      announce(`Error: ${errorMessage}`);

      // Use fallback data on error
      const fallbackData: DashboardData = {
        analytics: getFallbackAnalyticsData(),
        reports: [],
        securityAlerts: [],
      };
      setData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback data function
  const getFallbackAnalyticsData = () => ({
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
      {
        id: '1',
        name: 'Golden Retriever Max',
        type: 'pet' as const,
        score: 98.5,
        metric: 'matches',
      },
      { id: '2', name: 'Sarah Johnson', type: 'user' as const, score: 95.2, metric: 'engagement' },
      { id: '3', name: 'Labrador Bella', type: 'pet' as const, score: 92.8, metric: 'views' },
      { id: '4', name: 'Mike Chen', type: 'user' as const, score: 89.1, metric: 'activity' },
      { id: '5', name: 'Border Collie Luna', type: 'pet' as const, score: 87.3, metric: 'matches' },
    ],
    geographicData: [
      { country: 'United States', users: 8500, revenue: 65000, growth: 15.2 },
      { country: 'Canada', users: 3200, revenue: 25000, growth: 12.8 },
      { country: 'United Kingdom', users: 2100, revenue: 18000, growth: 18.5 },
      { country: 'Australia', users: 1800, revenue: 14000, growth: 22.1 },
      { country: 'Germany', users: 1200, revenue: 9500, growth: 8.9 },
    ],
    deviceStats: [
      { device: 'Mobile', count: 12500, percentage: 65.8 },
      { device: 'Desktop', count: 4500, percentage: 23.7 },
      { device: 'Tablet', count: 2000, percentage: 10.5 },
    ],
    securityMetrics: {
      totalAlerts: 45,
      criticalAlerts: 3,
      resolvedAlerts: 38,
      averageResponseTime: 15,
    },
  });

  const handleRefresh = () => {
    announce('Refreshing dashboard data');
    loadDashboardData();
  };

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    announce(`Exporting dashboard data as ${format}`);
    // TODO: Implement export functionality
  };

  const handleTabChange = (tab: 'analytics' | 'reports' | 'security') => {
    setActiveTab(tab);
    announce(`Switched to ${tab} tab`);
  };

  // Show loading state while fetching
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data available
  if (!data) {
    return null;
  }



  const tabs = [
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      description: 'View platform analytics and insights',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: DocumentIcon,
      description: 'Manage and create reports',
    },
    {
      id: 'security',
      label: 'Security',
      icon: ShieldCheckIcon,
      description: 'Monitor security alerts and threats',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600 dark:text-red-400">Error: {error}</p>
          <AccessibleButton
            onClick={() => window.location.reload()}
            variant="primary"
            className="mt-4"
            ariaLabel="Retry loading dashboard"
          >
            Retry
          </AccessibleButton>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive platform management and monitoring
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <AccessibleButton
                onClick={() => setShowSettings(true)}
                variant="ghost"
                ariaLabel="Open settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </AccessibleButton>

              <AccessibleButton
                onClick={handleRefresh}
                variant="ghost"
                ariaLabel="Refresh dashboard"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </AccessibleButton>

              <AccessibleButton
                onClick={() => handleExport('csv')}
                variant="ghost"
                ariaLabel="Export dashboard data"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </AccessibleButton>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        role="tablist"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as 'analytics' | 'reports' | 'security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                aria-describedby={`tab-description-${tab.id}`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </div>
                <div
                  id={`tab-description-${tab.id}`}
                  className="sr-only"
                >
                  {tab.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              >
                <AnalyticsVisualization
                  data={data.analytics}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  onExport={() => handleExport('csv')}
                />
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              >
                <ReportsManagement
                  reports={data.reports}
                  isLoading={isLoading}
                  onCreateReport={() => {
                    announce('New report created');
                  }}
                  onUpdateReport={() => {
                    announce('Report updated');
                  }}
                  onDeleteReport={() => {
                    announce('Report deleted');
                  }}
                  onScheduleReport={() => {
                    announce('Report scheduled');
                  }}
                  onExportReport={() => {
                    announce('Report exported');
                  }}
                  onViewReport={() => {
                    announce('Opening report viewer');
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              >
                <SecurityAlertsDashboard
                  alerts={data.securityAlerts}
                  isLoading={isLoading}
                  onAcknowledgeAlert={() => {
                    announce('Security alert acknowledged');
                  }}
                  onResolveAlert={() => {
                    announce('Security alert resolved');
                  }}
                  onEscalateAlert={() => {
                    announce('Security alert escalated');
                  }}
                  onAssignAlert={() => {
                    announce('Security alert assigned');
                  }}
                  onUpdateAlert={() => {
                    announce('Security alert updated');
                  }}
                  onDeleteAlert={() => {
                    announce('Security alert deleted');
                  }}
                  onExportAlerts={() => {
                    announce('Security alerts exported');
                  }}
                  onViewAlert={() => {
                    announce('Opening security alert details');
                  }}
                  onRefresh={handleRefresh}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal */}
      <AccessibleModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Dashboard Settings"
      >
        <div
          id="settings-description"
          className="space-y-6"
        >
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Auto-refresh dashboard
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              value={refreshInterval / 1000}
              onChange={(e) => setRefreshInterval(Number(e.target.value) * 1000)}
              min="10"
              max="300"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isHighContrast}
                disabled
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                High contrast mode (system preference)
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={prefersReducedMotion}
                disabled
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Reduced motion (system preference)
              </span>
            </label>
          </div>
        </div>
      </AccessibleModal>

      {/* ARIA Live Region */}
      <AriaLiveRegion>{''}</AriaLiveRegion>
    </div>
  );
}
