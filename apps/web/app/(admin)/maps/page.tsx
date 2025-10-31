'use client';

import {
  EnhancedButton,
  EnhancedCard,
  EnhancedInput,
  EnhancedProgressBar,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import { Icon } from '@/components/UI/icon-helper';
import { logger } from '@/services/logger';
import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  GlobeAmericasIcon,
  MapIcon,
  MapPinIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface MapsConfig {
  apiKey: string;
  isConfigured: boolean;
  isActive: boolean;
  quotaLimit: number;
  quotaUsed: number;
  billingAccount: string;
  restrictions: string[];
}

interface MapsUsageStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisMonth: number;
  geocodingRequests: number;
  placesRequests: number;
  directionsRequests: number;
  totalCost: number;
  costToday: number;
  costThisMonth: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequest: string;
}

interface MapsService {
  name: string;
  endpoint: string;
  description: string;
  requests: number;
  avgResponseTime: number;
  errorRate: number;
  lastUsed: string;
  status: 'healthy' | 'warning' | 'error';
  cost: number;
}

interface MapsQuota {
  service: string;
  limit: number;
  used: number;
  resetDate: string;
  status: 'ok' | 'warning' | 'exceeded';
}

export default function MapsServiceManagementPage() {
  const [mapsConfig, setMapsConfig] = useState<MapsConfig>({
    apiKey: '',
    isConfigured: false,
    isActive: false,
    quotaLimit: 100000,
    quotaUsed: 0,
    billingAccount: '',
    restrictions: [],
  });

  const [usageStats, setUsageStats] = useState<MapsUsageStats | null>(null);
  const [services, setServices] = useState<MapsService[]>([]);
  const [quotas, setQuotas] = useState<MapsQuota[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'quotas' | 'config'>(
    'overview',
  );

  // Load Maps configuration
  useEffect(() => {
    loadMapsConfig();
    loadMapsStats();
  }, []);

  const loadMapsConfig = async () => {
    try {
      const response = await fetch('/api/admin/maps/config');
      if (response.ok) {
        const config = await response.json();
        setMapsConfig(config);
      }
    } catch (error) {
      logger.error('Failed to load Maps config', { error });
    }
  };

  const loadMapsStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, servicesRes, quotasRes] = await Promise.all([
        fetch('/api/admin/maps/stats'),
        fetch('/api/admin/maps/services'),
        fetch('/api/admin/maps/quotas'),
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUsageStats(stats);
      }

      if (servicesRes.ok) {
        const services = await servicesRes.json();
        setServices(services);
      }

      if (quotasRes.ok) {
        const quotas = await quotasRes.json();
        setQuotas(quotas);
      }
    } catch (error) {
      logger.error('Failed to load Maps stats', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMapsConfig = async () => {
    setIsConfiguring(true);
    try {
      const response = await fetch('/api/admin/maps/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapsConfig),
      });

      if (response.ok) {
        const result = await response.json();
        setMapsConfig(result);
        setShowConfigModal(false);
        await loadMapsStats();
      }
    } catch (error) {
      logger.error('Failed to save Maps config', { error });
    } finally {
      setIsConfiguring(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getQuotaStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'exceeded':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton
          variant="card"
          count={3}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Google Maps Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Google Maps API, geocoding, and location services
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <EnhancedButton
            onClick={() => setShowConfigModal(true)}
            variant="secondary"
            icon={<PencilIcon className="h-5 w-5" />}
            ariaLabel="Configure Maps service"
          >
            Configure Maps
          </EnhancedButton>
          <EnhancedButton
            onClick={loadMapsStats}
            variant="primary"
            icon={<ArrowPathIcon className="h-5 w-5" />}
            ariaLabel="Refresh Maps stats"
          >
            Refresh Data
          </EnhancedButton>
        </div>
      </div>

      {/* Configuration Status */}
      <EnhancedCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapIcon className="h-8 w-8 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Google Maps API
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mapsConfig.isConfigured ? 'Configured and Active' : 'Not Configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {mapsConfig.isConfigured ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${mapsConfig.isConfigured
                  ? 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                  : 'text-yellow-800 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
                }`}
            >
              {mapsConfig.isConfigured ? 'Active' : 'Setup Required'}
            </span>
          </div>
        </div>
      </EnhancedCard>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(() => {
            type TabId = 'overview' | 'services' | 'quotas' | 'config';
            const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }> = [
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'services', label: 'Services', icon: Cog6ToothIcon },
              { id: 'quotas', label: 'Quotas', icon: GlobeAltIcon },
              { id: 'config', label: 'Configuration', icon: PencilIcon },
            ];
            return tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))
          })()}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(usageStats.totalRequests)}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Requests Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(usageStats.requestsToday)}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(usageStats.totalCost)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Geocoding Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(usageStats.geocodingRequests)}
                </p>
              </div>
              <MapPinIcon className="h-8 w-8 text-indigo-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Places Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(usageStats.placesRequests)}
                </p>
              </div>
              <MapPinIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.averageResponseTime.toFixed(0)}ms
                </p>
              </div>
              <GlobeAmericasIcon className="h-8 w-8 text-red-500" />
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Maps Services
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor Google Maps service performance and usage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}
                  >
                    {service.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {service.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Requests</span>
                    <span>{formatNumber(service.requests)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Avg Response</span>
                    <span>{service.avgResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Error Rate</span>
                    <span>{service.errorRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Cost</span>
                    <span>{formatCurrency(service.cost)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Last Used</span>
                    <span>{formatDate(service.lastUsed)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}

      {/* Quotas Tab */}
      {activeTab === 'quotas' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">API Quotas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor Google Maps API quota usage and limits
            </p>
          </div>

          <div className="space-y-4">
            {quotas.map((quota) => (
              <div
                key={quota.service}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {quota.service}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getQuotaStatusColor(quota.status)}`}
                  >
                    {quota.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Usage</span>
                    <span>
                      {formatNumber(quota.used)} / {formatNumber(quota.limit)}
                    </span>
                  </div>

                  <EnhancedProgressBar
                    value={(quota.used / quota.limit) * 100}
                    max={100}
                    size="sm"
                    variant={
                      quota.status === 'ok'
                        ? 'default'
                        : quota.status === 'warning'
                          ? 'striped'
                          : 'gradient'
                    }
                  />

                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Reset Date</span>
                    <span>{formatDate(quota.resetDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure Google Maps API
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <EnhancedInput
                    type="text"
                    value={mapsConfig.apiKey}
                    onChange={(value: string) => setMapsConfig({ ...mapsConfig, apiKey: value })}
                    placeholder="AIzaSy..."
                    ariaLabel="Google Maps API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Billing Account
                  </label>
                  <EnhancedInput
                    type="text"
                    value={mapsConfig.billingAccount}
                    onChange={(value: string) => setMapsConfig({ ...mapsConfig, billingAccount: value })}
                    placeholder="Billing account ID"
                    ariaLabel="Google Cloud billing account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quota Limit (per day)
                  </label>
                  <EnhancedInput
                    type="number"
                    value={mapsConfig.quotaLimit.toString()}
                    onChange={(value: string) =>
                      setMapsConfig({ ...mapsConfig, quotaLimit: parseInt(value) })
                    }
                    placeholder="100000"
                    ariaLabel="Daily quota limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Restrictions
                  </label>
                  <textarea
                    value={mapsConfig.restrictions.join('\n')}
                    onChange={(e) =>
                      setMapsConfig({
                        ...mapsConfig,
                        restrictions: e.target.value.split('\n').filter((r) => r.trim()),
                      })
                    }
                    placeholder="Enter restrictions (one per line)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <EnhancedButton
                  onClick={() => setShowConfigModal(false)}
                  variant="secondary"
                  ariaLabel="Cancel configuration"
                >
                  Cancel
                </EnhancedButton>
                <EnhancedButton
                  onClick={saveMapsConfig}
                  variant="primary"
                  disabled={isConfiguring}
                  ariaLabel="Save Maps configuration"
                >
                  {isConfiguring ? 'Saving...' : 'Save Configuration'}
                </EnhancedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
