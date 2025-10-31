'use client';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
  EnhancedModal,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import {
  Cog6ToothIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  type: 'api' | 'database' | 'storage' | 'third-party';
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'number';
    value: string;
    required: boolean;
    description?: string;
  }>;
}

export default function ConfigPage() {
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadConfig = async (): Promise<void> => {
    try {
      setLoading(true);

      // In a real implementation, this would fetch from API
      const mockServices: ServiceConfig[] = [
        {
          id: 'database',
          name: 'Database',
          description: 'PostgreSQL database configuration',
          type: 'database',
          fields: [
            {
              key: 'host',
              label: 'Host',
              type: 'text',
              value: process.env.NEXT_PUBLIC_DB_HOST || '',
              required: true,
              description: 'Database host address',
            },
            {
              key: 'port',
              label: 'Port',
              type: 'number',
              value: process.env.NEXT_PUBLIC_DB_PORT || '5432',
              required: true,
            },
            {
              key: 'database',
              label: 'Database Name',
              type: 'text',
              value: process.env.NEXT_PUBLIC_DB_NAME || '',
              required: true,
            },
            {
              key: 'username',
              label: 'Username',
              type: 'text',
              value: '',
              required: true,
            },
            {
              key: 'password',
              label: 'Password',
              type: 'password',
              value: '',
              required: true,
            },
          ],
        },
        {
          id: 'storage',
          name: 'File Storage',
          description: 'AWS S3 or compatible storage configuration',
          type: 'storage',
          fields: [
            {
              key: 'provider',
              label: 'Provider',
              type: 'text',
              value: 's3',
              required: true,
              description: 'Storage provider (s3, gcs, azure)',
            },
            {
              key: 'bucket',
              label: 'Bucket Name',
              type: 'text',
              value: '',
              required: true,
            },
            {
              key: 'region',
              label: 'Region',
              type: 'text',
              value: '',
              required: true,
            },
            {
              key: 'accessKey',
              label: 'Access Key',
              type: 'text',
              value: '',
              required: true,
            },
            {
              key: 'secretKey',
              label: 'Secret Key',
              type: 'password',
              value: '',
              required: true,
            },
          ],
        },
        {
          id: 'email',
          name: 'Email Service',
          description: 'SMTP email configuration',
          type: 'third-party',
          fields: [
            {
              key: 'provider',
              label: 'Provider',
              type: 'text',
              value: 'sendgrid',
              required: true,
              description: 'Email provider (sendgrid, ses, mailgun)',
            },
            {
              key: 'apiKey',
              label: 'API Key',
              type: 'password',
              value: '',
              required: true,
            },
            {
              key: 'fromEmail',
              label: 'From Email',
              type: 'text',
              value: '',
              required: true,
            },
            {
              key: 'fromName',
              label: 'From Name',
              type: 'text',
              value: 'PawfectMatch',
              required: false,
            },
          ],
        },
        {
          id: 'ai',
          name: 'AI Service',
          description: 'OpenAI or compatible AI service configuration',
          type: 'third-party',
          fields: [
            {
              key: 'provider',
              label: 'Provider',
              type: 'text',
              value: 'openai',
              required: true,
              description: 'AI provider (openai, anthropic, custom)',
            },
            {
              key: 'apiKey',
              label: 'API Key',
              type: 'password',
              value: '',
              required: true,
            },
            {
              key: 'model',
              label: 'Default Model',
              type: 'text',
              value: 'gpt-4',
              required: true,
            },
            {
              key: 'baseUrl',
              label: 'Base URL',
              type: 'url',
              value: '',
              required: false,
              description: 'Custom API base URL (optional)',
            },
          ],
        },
      ];

      setServices(mockServices);
    } catch (error: unknown) {
      logger.error('Error loading configuration:', { error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConfig();
  }, []);

  const openServiceConfig = (service: ServiceConfig): void => {
    setSelectedService(service);
    const initialValues: Record<string, string> = {};
    service.fields.forEach((field) => {
      initialValues[field.key] = field.value;
    });
    setConfigValues(initialValues);
  };

  const closeServiceConfig = (): void => {
    setSelectedService(null);
    setConfigValues({});
  };

  const updateConfigValue = (key: string, value: string): void => {
    setConfigValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveConfiguration = async (): Promise<void> => {
    if (!selectedService) return;

    try {
      setSaving(true);

      // In a real implementation, this would save to API
      await fetch(`/api/admin/config/${selectedService.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configValues),
      }).catch(() => null);

      // Update local state
      setServices((prev) =>
        prev.map((service) => {
          if (service.id === selectedService.id) {
            return {
              ...service,
              fields: service.fields.map((field) => ({
                ...field,
                value: configValues[field.key] || field.value,
              })),
            };
          }
          return service;
        }),
      );

      closeServiceConfig();
    } catch (error: unknown) {
      logger.error('Error saving configuration:', { error });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton
          variant="card"
          count={4}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Configuration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage API and service configurations
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const configuredFields = service.fields.filter((f) => f.value).length;
          const totalFields = service.fields.length;
          const isConfigured = configuredFields === totalFields;

          return (
            <EnhancedCard
              key={service.id}
              className="p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                    <Cog6ToothIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configuration</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {configuredFields} / {totalFields} fields
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isConfigured ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-yellow-500" />
                  )}
                  <EnhancedButton
                    onClick={() => openServiceConfig(service)}
                    variant="primary"
                    size="sm"
                  >
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Configure
                  </EnhancedButton>
                </div>
              </div>
            </EnhancedCard>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {selectedService && (
        <EnhancedModal
          isOpen={true}
          onClose={closeServiceConfig}
          title={`Configure ${selectedService.name}`}
          size="lg"
        >
          <div className="space-y-4">
            {selectedService.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <EnhancedInput
                  type={field.type === 'password' ? 'password' : 'text'}
                  value={configValues[field.key] || ''}
                  onChange={(e) => updateConfigValue(field.key, e.target.value)}
                  placeholder={field.label}
                  className="mt-1"
                  required={field.required}
                />
                {field.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <EnhancedButton
              onClick={closeServiceConfig}
              variant="secondary"
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              onClick={saveConfiguration}
              variant="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </EnhancedButton>
          </div>
        </EnhancedModal>
      )}
    </div>
  );
}

