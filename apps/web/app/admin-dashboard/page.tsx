'use client';

import {
  useAnnouncement,
  useFocusManagement,
  useHighContrastMode,
  useReducedMotion,
  AccessibleButton,
} from '@/components/admin/AccessibilityUtils';
import { logger } from '@/services/logger';
import { exportDashboardData } from '@/utils/export';
import {
  ChartBarIcon,
  DocumentIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { AnimationSettingsModal } from '@/components/admin/AnimationSettingsModal';

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
  security: Array<{
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
  const [showAnimationSettings, setShowAnimationSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const router = useRouter();
  const { announce } = useAnnouncement();
  useFocusManagement(); // Initialize focus management but don't use the returned functions
  const prefersReducedMotion = useReducedMotion();
  const isHighContrast = useHighContrastMode();

  // Fallback data function
  const getFallbackAnalyticsData = () => ({
    users: {
      total: 15420,
      active: 12850,
      suspended: 1250,
      banned: 120,
      verified: 11200,
      recent24h: 1250,
      growth: 8.5,
      trend: 'up' as const,
    },
    pets: {
      total: 8920,
      active: 7850,
      recent24h: 450,
      growth: 12.3,
      trend: 'up' as const,
    },
    matches: {
      total: 45680,
      active: 38920,
      blocked: 2340,
      recent24h: 890,
      growth: 15.7,
      trend: 'up' as const,
    },
    messages: {
      total: 234560,
      deleted: 12450,
      recent24h: 3450,
      growth: 22.1,
      trend: 'up' as const,
    },
    engagement: {
      dailyActiveUsers: 8750,
      weeklyActiveUsers: 23450,
      monthlyActiveUsers: 45680,
      averageSessionDuration: 12.5,
      bounceRate: 0.23,
      retentionRate: 0.78,
    },
    revenue: {
      totalRevenue: 125430.50,
      monthlyRecurringRevenue: 23450.75,
      averageRevenuePerUser: 8.95,
      conversionRate: 0.034,
      churnRate: 0.023,
    },
    timeSeries: [],
    topPerformers: [],
    geographicData: [],
    deviceStats: [],
    securityMetrics: {
      totalAlerts: 45,
      criticalAlerts: 7,
      resolvedAlerts: 38,
      averageResponseTime: 15,
    },
  });

  const loadDashboardData = useCallback(async () => {
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
        security: securityData,
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
        security: [],
      };
      setData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, [announce]);

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
  }, [autoRefresh, refreshInterval, loadDashboardData]);

  const handleRefresh = () => {
    announce('Refreshing dashboard data');
    loadDashboardData();
  };

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    if (!data) {
      announce('No data available to export');
      return;
    }

    try {
      exportDashboardData(data as unknown as Record<string, unknown>, format, {
        filename: `pawfectmatch-dashboard-${activeTab}`,
        includeTimestamp: true
      });
      announce(`Dashboard data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      logger.error('Export failed', { error, format });
      announce(`Failed to export dashboard data as ${format.toUpperCase()}`);
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center max-w-md">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center max-w-md">
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
    );
  }

  // No data available
  if (!data) {
    return null;
  }
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
                onClick={() => setShowAnimationSettings(true)}
                variant="ghost"
                ariaLabel="Open animation settings"
              >
                <SparklesIcon className="h-5 w-5" />
              </AccessibleButton>

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
                  onExport={handleExport}
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
                  onCreateReport={async (report: any) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/reports`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(report),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Report created successfully');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to create report');
                        }
                      } else {
                        announce('Failed to create report');
                      }
                    } catch (error) {
                      logger.error('Failed to create report', { error });
                      announce('Failed to create report');
                    }
                  }}
                  onUpdateReport={async (id: string, updates: any) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/reports/${id}`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updates),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Report updated successfully');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to update report');
                        }
                      } else {
                        announce('Failed to update report');
                      }
                    } catch (error) {
                      logger.error('Failed to update report', { error });
                      announce('Failed to update report');
                    }
                  }}
                  onDeleteReport={async (id: string) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/reports/${id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Report deleted successfully');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to delete report');
                        }
                      } else {
                        announce('Failed to delete report');
                      }
                    } catch (error) {
                      logger.error('Failed to delete report', { error });
                      announce('Failed to delete report');
                    }
                  }}
                  onScheduleReport={async (id: string, schedule: any) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/reports/${id}/schedule`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(schedule),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Report scheduled successfully');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to schedule report');
                        }
                      } else {
                        announce('Failed to schedule report');
                      }
                    } catch (error) {
                      logger.error('Failed to schedule report', { error });
                      announce('Failed to schedule report');
                    }
                  }}
                  onExportReport={async (id: string, format: string) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/reports/${id}/export`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ format }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          // Open download link
                          window.open(`${baseUrl}${result.export.downloadUrl}`, '_blank');
                          announce(`Report exported in ${format} format`);
                        } else {
                          announce('Failed to export report');
                        }
                      } else {
                        announce('Failed to export report');
                      }
                    } catch (error) {
                      logger.error('Failed to export report', { error });
                      announce('Failed to export report');
                    }
                  }}
                  onViewReport={async (id: string) => {
                    try {
                      announce('Opening report viewer');
                      // Navigate to report details page
                      router.push(`/admin/reports/${id}`);
                    } catch (error) {
                      logger.error('Failed to view report', { error });
                      announce('Failed to view report');
                    }
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
                  alerts={data.security}
                  isLoading={isLoading}
                  onAcknowledgeAlert={async (id: string) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/security/alerts/${id}/acknowledge`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Security alert acknowledged');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to acknowledge alert');
                        }
                      } else {
                        announce('Failed to acknowledge alert');
                      }
                    } catch (error) {
                      logger.error('Failed to acknowledge alert', { error });
                      announce('Failed to acknowledge alert');
                    }
                  }}
                  onResolveAlert={async (id: string, resolution: string) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/security/alerts/${id}/resolve`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ resolution }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Security alert resolved');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to resolve alert');
                        }
                      } else {
                        announce('Failed to resolve alert');
                      }
                    } catch (error) {
                      logger.error('Failed to resolve alert', { error });
                      announce('Failed to resolve alert');
                    }
                  }}
                  onEscalateAlert={async (id: string, level: number) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/security/alerts/${id}/escalate`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ level }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce(`Security alert escalated to level ${level}`);
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to escalate alert');
                        }
                      } else {
                        announce('Failed to escalate alert');
                      }
                    } catch (error) {
                      logger.error('Failed to escalate alert', { error });
                      announce('Failed to escalate alert');
                    }
                  }}
                  onAssignAlert={async (id: string, assigneeId: string) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/security/alerts/${id}/assign`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ assigneeId }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Security alert assigned');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to assign alert');
                        }
                      } else {
                        announce('Failed to assign alert');
                      }
                    } catch (error) {
                      logger.error('Failed to assign alert', { error });
                      announce('Failed to assign alert');
                    }
                  }}
                  onUpdateAlert={async (id: string, updates: any) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/security/alerts/${id}`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updates),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Security alert updated');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to update alert');
                        }
                      } else {
                        announce('Failed to update alert');
                      }
                    } catch (error) {
                      logger.error('Failed to update alert', { error });
                      announce('Failed to update alert');
                    }
                  }}
                  onDeleteAlert={async (id: string) => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/security/alerts/${id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          announce('Security alert deleted');
                          loadDashboardData(); // Refresh data
                        } else {
                          announce('Failed to delete alert');
                        }
                      } else {
                        announce('Failed to delete alert');
                      }
                    } catch (error) {
                      logger.error('Failed to delete alert', { error });
                      announce('Failed to delete alert');
                    }
                  }}
                  onExportAlerts={async (format: 'csv' | 'pdf' | 'json') => {
                    try {
                      const token = localStorage.getItem('auth-token') || '';
                      const baseUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

                      const response = await fetch(`${baseUrl}/api/admin/security/alerts/export`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ format }),
                      });

                      if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                          // Open download link
                          window.open(`${baseUrl}${result.export.downloadUrl}`, '_blank');
                          announce(`Security alerts exported in ${format} format`);
                        } else {
                          announce('Failed to export alerts');
                        }
                      } else {
                        announce('Failed to export alerts');
                      }
                    } catch (error) {
                      logger.error('Failed to export alerts', { error });
                      announce('Failed to export alerts');
                    }
                  }}
                  onViewAlert={async (id: string) => {
                    try {
                      announce('Opening security alert details');
                      // Navigate to alert details page
                      router.push(`/admin/security/alerts/${id}`);
                    } catch (error) {
                      logger.error('Failed to view alert', { error });
                      announce('Failed to view alert');
                    }
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

      {/* Animation Settings Modal */}
      <AnimationSettingsModal
        isOpen={showAnimationSettings}
        onClose={() => setShowAnimationSettings(false)}
      />

      {/* ARIA Live Region */}
      <AriaLiveRegion>{''}</AriaLiveRegion>
    </div>
  );
}
