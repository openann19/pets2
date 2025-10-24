'use client';

import React, { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import {
  CloudIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PencilIcon,
  ShieldCheckIcon,
  PhotoIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  
} from '@heroicons/react/24/outline';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedDropdown,
  EnhancedInput,
  EnhancedProgressBar,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';

interface ExternalService {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  cost: number;
  usage: number;
  limit: number;
  isConfigured: boolean;
  isActive: boolean;
  apiKey?: string;
  endpoint?: string;
  features: string[];
}

interface ServiceMetrics {
  totalServices: number;
  activeServices: number;
  totalCost: number;
  averageUptime: number;
  averageResponseTime: number;
  totalErrors: number;
  lastUpdated: string;
}

export default function ExternalServicesManagementPage() {
  const [services, setServices] = useState<ExternalService[]>([]);
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedService, setSelectedService] = useState<ExternalService | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'config'>('overview');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'healthy' | 'warning' | 'error' | 'offline'
  >('all');

  // Load external services data
  useEffect(() => {
    loadServicesData();
  }, []);

  const loadServicesData = async () => {
    setIsLoading(true);
    try {
      const [servicesRes, metricsRes] = await Promise.all([
        fetch('/api/admin/external-services'),
        fetch('/api/admin/external-services/metrics'),
      ]);

      if (servicesRes.ok) {
        const services = await servicesRes.json();
        setServices(services);
      }

      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setMetrics(metrics);
      }
    } catch (error) {
      logger.error('Failed to load external services data:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const saveServiceConfig = async (service: ExternalService) => {
    setIsConfiguring(true);
    try {
      const response = await fetch(`/api/admin/external-services/${service.id}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });

      if (response.ok) {
        const result = await response.json();
        setServices(services.map((s) => (s.id === service.id ? result : s)));
        setShowConfigModal(false);
        setSelectedService(null);
      }
    } catch (error) {
      logger.error('Failed to save service config:', { error });
    } finally {
      setIsConfiguring(false);
    }
  };

  const toggleService = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/external-services/${serviceId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await loadServicesData();
      }
    } catch (error) {
      logger.error('Failed to toggle service:', { error });
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
      case 'offline':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'offline':
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'cloudinary':
        return <PhotoIcon className="h-6 w-6 text-blue-500" />;
      case 'sentry':
        return <ShieldCheckIcon className="h-6 w-6 text-red-500" />;
      case 'sendgrid':
        return <EnvelopeIcon className="h-6 w-6 text-green-500" />;
      case 'aws s3':
        return <CloudIcon className="h-6 w-6 text-orange-500" />;
      case 'google maps':
        return <GlobeAltIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <CloudIcon className="h-6 w-6 text-gray-500" />;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredServices = services.filter(
    (service) => filterStatus === 'all' || service.status === filterStatus,
  );

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
            External Services Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage all external service integrations
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <EnhancedButton
            onClick={loadServicesData}
            variant="primary"
            icon={<ArrowPathIcon className="h-5 w-5" />}
            ariaLabel="Refresh services data"
          >
            Refresh Data
          </EnhancedButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(() => {
            type TabId = 'overview' | 'services' | 'config';
            const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'services', label: 'Services', icon: CloudIcon },
              { id: 'config', label: 'Configuration', icon: Cog6ToothIcon },
            ];
            return tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
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
      {activeTab === 'overview' && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(metrics.totalServices)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatNumber(metrics.activeServices)} active
                </p>
              </div>
              <CloudIcon className="h-8 w-8 text-blue-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(metrics.totalCost)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This month</p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Uptime
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.averageUptime.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.averageResponseTime.toFixed(0)}ms
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatNumber(metrics.totalErrors)} errors
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-purple-500" />
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  External Services
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor all external service integrations and their performance
                </p>
              </div>

              <EnhancedDropdown
                label="Status"
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'healthy', label: 'Healthy' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'error', label: 'Error' },
                  { value: 'offline', label: 'Offline' },
                ]}
                value={filterStatus}
                onChange={(v) =>
                  setFilterStatus(
                    v as 'all' | 'healthy' | 'warning' | 'error' | 'offline',
                  )
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getServiceIcon(service.name)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{service.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(service.status)}`}
                    >
                      {service.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  {service.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Uptime</span>
                    <span>{service.uptime.toFixed(1)}%</span>
                  </div>

                  <EnhancedProgressBar
                    value={service.uptime}
                    max={100}
                    size="sm"
                    variant={
                      service.status === 'healthy'
                        ? 'default'
                        : service.status === 'warning'
                          ? 'striped'
                          : 'gradient'
                    }
                  />

                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Response Time</span>
                    <span>{service.responseTime}ms</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Cost</span>
                    <span>{formatCurrency(service.cost)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Usage</span>
                    <span>
                      {formatNumber(service.usage)} / {formatNumber(service.limit)}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Last Check</span>
                    <span>{formatDate(service.lastCheck)}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <EnhancedButton
                    onClick={() => {
                      setSelectedService(service);
                      setShowConfigModal(true);
                    }}
                    variant="secondary"
                    size="sm"
                    icon={<PencilIcon className="h-4 w-4" />}
                    ariaLabel="Configure service"
                  >
                    Configure
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => toggleService(service.id, !service.isActive)}
                    variant={service.isActive ? 'secondary' : 'primary'}
                    size="sm"
                    ariaLabel={service.isActive ? 'Disable service' : 'Enable service'}
                  >
                    {service.isActive ? 'Disable' : 'Enable'}
                  </EnhancedButton>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure {selectedService.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <EnhancedInput
                    type="password"
                    value={selectedService.apiKey || ''}
                    onChange={(value) => setSelectedService({ ...selectedService, apiKey: value })}
                    placeholder="Enter API key..."
                    ariaLabel="Service API key"
                  />
                </div>

                {selectedService.endpoint && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Endpoint URL
                    </label>
                    <EnhancedInput
                      type="text"
                      value={selectedService.endpoint}
                      onChange={(value) =>
                        setSelectedService({ ...selectedService, endpoint: value })
                      }
                      placeholder="https://api.service.com"
                      ariaLabel="Service endpoint URL"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usage Limit
                  </label>
                  <EnhancedInput
                    type="number"
                    value={selectedService.limit.toString()}
                    onChange={(value) =>
                      setSelectedService({ ...selectedService, limit: parseInt(value) })
                    }
                    placeholder="1000000"
                    ariaLabel="Service usage limit"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedService.isActive}
                    onChange={(e) =>
                      setSelectedService({ ...selectedService, isActive: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Service Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <EnhancedButton
                  onClick={() => {
                    setShowConfigModal(false);
                    setSelectedService(null);
                  }}
                  variant="secondary"
                  ariaLabel="Cancel configuration"
                >
                  Cancel
                </EnhancedButton>
                <EnhancedButton
                  onClick={() => saveServiceConfig(selectedService)}
                  variant="primary"
                  disabled={isConfiguring}
                  ariaLabel="Save service configuration"
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
