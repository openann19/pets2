'use client';

import {
  EnhancedButton,
  EnhancedCard,
  EnhancedDropdown,
  EnhancedInput,
  EnhancedProgressBar,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react'
import { logger } from '@pawfectmatch/core';
;

interface SystemSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  value: string | number | boolean;
  type: 'boolean' | 'string' | 'number' | 'select';
  options?: Array<{ value: string; label: string }>;
  required: boolean;
  sensitive: boolean;
}

interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastCheck: string;
  responseTime: number;
}

// Mock data
const mockSettings: SystemSetting[] = [
  {
    id: '1',
    category: 'Security',
    name: 'Two-Factor Authentication',
    description: 'Require 2FA for all admin accounts',
    value: true,
    type: 'boolean',
    required: true,
    sensitive: false,
  },
  {
    id: '2',
    category: 'Security',
    name: 'Session Timeout',
    description: 'Auto-logout after inactivity (minutes)',
    value: 30,
    type: 'number',
    required: true,
    sensitive: false,
  },
  {
    id: '3',
    category: 'Security',
    name: 'Password Policy',
    description: 'Minimum password requirements',
    value: 'strong',
    type: 'select',
    options: [
      { value: 'basic', label: 'Basic (8+ characters)' },
      { value: 'strong', label: 'Strong (12+ chars, mixed case, numbers)' },
      { value: 'complex', label: 'Complex (12+ chars, special chars)' },
    ],
    required: true,
    sensitive: false,
  },
  {
    id: '4',
    category: 'Notifications',
    name: 'Email Notifications',
    description: 'Send email notifications for system events',
    value: true,
    type: 'boolean',
    required: false,
    sensitive: false,
  },
  {
    id: '5',
    category: 'Notifications',
    name: 'Slack Integration',
    description: 'Send alerts to Slack channel',
    value: false,
    type: 'boolean',
    required: false,
    sensitive: false,
  },
  {
    id: '6',
    category: 'Database',
    name: 'Backup Frequency',
    description: 'How often to backup the database',
    value: 'daily',
    type: 'select',
    options: [
      { value: 'hourly', label: 'Hourly' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
    ],
    required: true,
    sensitive: false,
  },
  {
    id: '7',
    category: 'Database',
    name: 'Connection Pool Size',
    description: 'Maximum number of database connections',
    value: 20,
    type: 'number',
    required: true,
    sensitive: false,
  },
  {
    id: '8',
    category: 'API',
    name: 'Rate Limiting',
    description: 'Requests per minute per IP',
    value: 100,
    type: 'number',
    required: true,
    sensitive: false,
  },
  {
    id: '9',
    category: 'API',
    name: 'API Version',
    description: 'Current API version',
    value: 'v2.1.0',
    type: 'string',
    required: true,
    sensitive: false,
  },
];

const mockSystemStatus: SystemStatus[] = [
  {
    service: 'Database',
    status: 'healthy',
    uptime: 99.9,
    lastCheck: '2024-01-27T15:30:00Z',
    responseTime: 45,
  },
  {
    service: 'API Server',
    status: 'healthy',
    uptime: 99.8,
    lastCheck: '2024-01-27T15:30:00Z',
    responseTime: 120,
  },
  {
    service: 'File Storage',
    status: 'warning',
    uptime: 98.5,
    lastCheck: '2024-01-27T15:30:00Z',
    responseTime: 800,
  },
  {
    service: 'Email Service',
    status: 'healthy',
    uptime: 99.7,
    lastCheck: '2024-01-27T15:30:00Z',
    responseTime: 200,
  },
  {
    service: 'Cache Server',
    status: 'error',
    uptime: 95.2,
    lastCheck: '2024-01-27T15:30:00Z',
    responseTime: 1500,
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>(mockSettings);
  const [systemStatus] = useState<SystemStatus[]>(mockSystemStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);

  const categories = ['all', ...Array.from(new Set(settings.map((s) => s.category)))];

  const filteredSettings =
    selectedCategory === 'all' ? settings : settings.filter((s) => s.category === selectedCategory);

  const handleSettingChange = (id: string, value: string | number | boolean) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, value } : s)));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setHasChanges(false);
      logger.info('Settings saved:', { settings });
    }, 1000);
  };

  const handleResetSettings = () => {
    setSettings(mockSettings);
    setHasChanges(false);
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {hasChanges && (
            <EnhancedButton
              onClick={handleResetSettings}
              variant="secondary"
              ariaLabel="Reset changes"
            >
              Reset
            </EnhancedButton>
          )}
          <EnhancedButton
            onClick={handleSaveSettings}
            variant="primary"
            disabled={!hasChanges}
            ariaLabel="Save settings"
          >
            Save Changes
          </EnhancedButton>
        </div>
      </div>

      {/* System Status */}
      <EnhancedCard className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            System Status
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time monitoring of system services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemStatus.map((service) => (
            <div
              key={service.service}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {service.service}
                </h4>
                {getStatusIcon(service.status)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Uptime</span>
                  <span className={getStatusColor(service.status)}>{service.uptime}%</span>
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
              </div>
            </div>
          ))}
        </div>
      </EnhancedCard>

      {/* Settings Categories */}
      <EnhancedCard className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Configuration Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage system configuration and preferences
          </p>
        </div>

        <div className="mb-6">
          <EnhancedDropdown
            label="Category Filter"
            options={categories.map((cat) => ({
              value: cat,
              label: cat === 'all' ? 'All Categories' : cat,
            }))}
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        <div className="space-y-6">
          {filteredSettings.map((setting) => (
            <div
              key={setting.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {setting.name}
                    {setting.required && <span className="text-red-500 ml-1">*</span>}
                    {setting.sensitive && (
                      <KeyIcon className="h-4 w-4 text-yellow-500 ml-2 inline" />
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                </div>
              </div>

              <div className="max-w-md">
                {setting.type === 'boolean' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Boolean(setting.value)}
                      onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {setting.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                )}

                {setting.type === 'string' && (
                  <EnhancedInput
                    label=""
                    value={String(setting.value)}
                    onChange={(value: string) => handleSettingChange(setting.id, value)}
                    placeholder={`Enter ${setting.name.toLowerCase()}`}
                  />
                )}

                {setting.type === 'number' && (
                  <EnhancedInput
                    label=""
                    value={setting.value.toString()}
                    onChange={(value: string) => handleSettingChange(setting.id, Number(value))}
                    type="number"
                    placeholder={`Enter ${setting.name.toLowerCase()}`}
                  />
                )}

                {setting.type === 'select' && setting.options && (
                  <EnhancedDropdown
                    label=""
                    options={setting.options}
                    value={String(setting.value)}
                    onChange={(value: string) => handleSettingChange(setting.id, value)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </EnhancedCard>

      {/* Quick Actions */}
      <EnhancedCard className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Quick Actions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Common administrative tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnhancedButton
            onClick={() => logger.info('Clear cache')}
            variant="secondary"
            icon={<CircleStackIcon className="h-5 w-5" />}
            className="w-full"
            ariaLabel="Clear system cache"
          >
            Clear Cache
          </EnhancedButton>

          <EnhancedButton
            onClick={() => logger.info('Restart services')}
            variant="secondary"
            icon={<CloudIcon className="h-5 w-5" />}
            className="w-full"
            ariaLabel="Restart system services"
          >
            Restart Services
          </EnhancedButton>

          <EnhancedButton
            onClick={() => logger.info('Generate backup')}
            variant="secondary"
            icon={<ShieldCheckIcon className="h-5 w-5" />}
            className="w-full"
            ariaLabel="Generate system backup"
          >
            Generate Backup
          </EnhancedButton>

          <EnhancedButton
            onClick={() => logger.info('View logs')}
            variant="secondary"
            icon={<ChartBarIcon className="h-5 w-5" />}
            className="w-full"
            ariaLabel="View system logs"
          >
            View Logs
          </EnhancedButton>
        </div>
      </EnhancedCard>
    </div>
  );
}
