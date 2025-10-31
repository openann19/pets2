/**
 * Admin Configuration Hook
 * Extracts business logic for AdminConfigScreen
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useTheme } from '@/theme';
import { _adminAPI } from '../../../../services/api';
import { errorHandler } from '../../../../services/errorHandler';
import { logger } from '../../../../services/logger';
import type { ServiceConfig } from '../types';

export const useAdminConfig = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    void loadConfigurations();
  }, []);

  const loadConfigurations = async (): Promise<void> => {
    try {
      setLoading(true);

      // Load all service configurations
      const [aiConfig, stripeConfig, revenuecatConfig, servicesStatus] = await Promise.all([
        _adminAPI.getAIConfig().catch(() => ({ success: false, data: null })),
        _adminAPI.getStripeConfig().catch(() => ({ success: false, data: null })),
        _adminAPI.getRevenueCatConfig().catch(() => ({ success: false, data: null })),
        _adminAPI.getServicesStatus().catch(() => ({ success: false, data: null })),
      ]);

      const serviceConfigs: ServiceConfig[] = [];

      // AI Service Configuration
      if (aiConfig.success && aiConfig.data) {
        const ai = aiConfig.data as {
          apiKey?: string;
          baseUrl?: string;
          model?: string;
          maxTokens?: number;
          temperature?: number;
          isConfigured?: boolean;
          isActive?: boolean;
        };
        serviceConfigs.push({
          id: 'ai',
          name: 'AI Service (DeepSeek)',
          icon: 'sparkles',
          color: theme.colors.primary,
          isConfigured: ai.isConfigured ?? false,
          isActive: ai.isActive ?? false,
          description: 'AI text generation and compatibility analysis',
          fields: [
            {
              key: 'apiKey',
              label: 'API Key',
              type: 'password',
              value: ai.apiKey || '',
              placeholder: 'sk-...',
              required: true,
              masked: true,
            },
            {
              key: 'baseUrl',
              label: 'Base URL',
              type: 'url',
              value: ai.baseUrl || 'https://api.deepseek.com',
              placeholder: 'https://api.deepseek.com',
            },
            {
              key: 'model',
              label: 'Model',
              type: 'text',
              value: ai.model || 'deepseek-chat',
              placeholder: 'deepseek-chat',
            },
            {
              key: 'maxTokens',
              label: 'Max Tokens',
              type: 'number',
              value: ai.maxTokens || 4000,
              placeholder: '4000',
            },
            {
              key: 'temperature',
              label: 'Temperature',
              type: 'number',
              value: ai.temperature || 0.7,
              placeholder: '0.7',
            },
            {
              key: 'isActive',
              label: 'Service Active',
              type: 'boolean',
              value: ai.isActive ?? false,
            },
          ],
        });
      }

      // Stripe Configuration
      if (stripeConfig.success && stripeConfig.data) {
        const stripe = stripeConfig.data as {
          secretKey?: string;
          publishableKey?: string;
          webhookSecret?: string;
          isLiveMode?: boolean;
          isConfigured?: boolean;
        };
        serviceConfigs.push({
          id: 'stripe',
          name: 'Stripe Payments',
          icon: 'card',
          color: theme.colors.success,
          isConfigured: stripe.isConfigured ?? false,
          isActive: stripe.isConfigured ?? false,
          description: 'Payment processing and subscription management',
          fields: [
            {
              key: 'secretKey',
              label: 'Secret Key',
              type: 'password',
              value: stripe.secretKey || '',
              placeholder: 'sk_...',
              required: true,
              masked: true,
            },
            {
              key: 'publishableKey',
              label: 'Publishable Key',
              type: 'text',
              value: stripe.publishableKey || '',
              placeholder: 'pk_...',
              required: true,
            },
            {
              key: 'webhookSecret',
              label: 'Webhook Secret',
              type: 'password',
              value: stripe.webhookSecret || '',
              placeholder: 'whsec_...',
              masked: true,
            },
            {
              key: 'isLiveMode',
              label: 'Live Mode',
              type: 'boolean',
              value: stripe.isLiveMode ?? false,
            },
          ],
        });
      }

      // RevenueCat Configuration
      if (revenuecatConfig.success && revenuecatConfig.data) {
        const revenuecat = revenuecatConfig.data as {
          iosApiKey?: string;
          androidApiKey?: string;
          isConfigured?: boolean;
        };
        serviceConfigs.push({
          id: 'revenuecat',
          name: 'RevenueCat (IAP)',
          icon: 'storefront',
          color: theme.colors.info,
          isConfigured: revenuecat.isConfigured ?? false,
          isActive: revenuecat.isConfigured ?? false,
          description: 'In-app purchase management and subscription tracking',
          fields: [
            {
              key: 'iosApiKey',
              label: 'iOS API Key',
              type: 'password',
              value: revenuecat.iosApiKey || '',
              placeholder: 'appl_... or rc_...',
              required: true,
              masked: true,
            },
            {
              key: 'androidApiKey',
              label: 'Android API Key',
              type: 'password',
              value: revenuecat.androidApiKey || '',
              placeholder: 'goog_... or rc_...',
              required: true,
              masked: true,
            },
          ],
        });
      }

      // External Services (from services status)
      if (servicesStatus.success && servicesStatus.data) {
        const servicesData = servicesStatus.data as Record<
          string,
          {
            status: string;
            endpoint?: string;
            isConfigured?: boolean;
            isActive?: boolean;
          }
        >;

        const serviceMetadata: Record<
          string,
          { name: string; icon: string; color: string; description: string }
        > = {
          'aws-rekognition': {
            name: 'AWS Rekognition',
            icon: 'eye',
            color: theme.colors.warning,
            description: 'Content moderation and safety checks',
          },
          'cloudinary': {
            name: 'Cloudinary',
            icon: 'cloud',
            color: theme.colors.info,
            description: 'Image storage and processing',
          },
          'fcm': {
            name: 'Firebase Cloud Messaging',
            icon: 'notifications',
            color: theme.colors.warning,
            description: 'Push notifications',
          },
          'livekit': {
            name: 'LiveKit',
            icon: 'videocam',
            color: theme.colors.info,
            description: 'Live streaming',
          },
        };

        Object.entries(servicesData).forEach(([key, service]) => {
          const metadata = serviceMetadata[key.toLowerCase()];
          if (metadata) {
            serviceConfigs.push({
              id: key,
              name: metadata.name,
              icon: metadata.icon,
              color: metadata.color,
              isConfigured: service.isConfigured ?? false,
              isActive: service.isActive ?? false,
              description: metadata.description,
              fields: [
                {
                  key: 'endpoint',
                  label: 'Endpoint',
                  type: 'url',
                  value: service.endpoint || '',
                  placeholder: 'https://...',
                },
                {
                  key: 'isActive',
                  label: 'Service Active',
                  type: 'boolean',
                  value: service.isActive ?? false,
                },
              ],
            });
          }
        });
      }

      setServices(serviceConfigs);
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to load configurations'),
        {
          component: 'AdminConfigScreen',
          action: 'loadConfigurations',
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const openServiceConfig = useCallback((service: ServiceConfig) => {
    setSelectedService(service);
    const initialValues: Record<string, string | number | boolean> = {};
    service.fields.forEach((field) => {
      initialValues[field.key] = field.value;
    });
    setConfigValues(initialValues);
  }, []);

  const closeServiceConfig = useCallback(() => {
    setSelectedService(null);
    setConfigValues({});
  }, []);

  const updateConfigValue = useCallback((key: string, value: string | number | boolean) => {
    setConfigValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveConfiguration = useCallback(async () => {
    if (!selectedService) return;

    try {
      setSaving(true);

      // Validate required fields
      const requiredFields = selectedService.fields.filter((f) => f.required);
      for (const field of requiredFields) {
        const value = configValues[field.key];
        if (value === undefined || value === null || value === '') {
          Alert.alert('Validation Error', `${field.label} is required`);
          return;
        }
      }

      // Save configuration based on service type
      let response;
      if (selectedService.id === 'ai') {
        response = await _adminAPI.saveAIConfig({
          apiKey: configValues['apiKey'] as string,
          baseUrl: configValues['baseUrl'] as string,
          model: configValues['model'] as string,
          maxTokens: configValues['maxTokens'] as number,
          temperature: configValues['temperature'] as number,
        });
      } else if (selectedService.id === 'stripe') {
        response = await _adminAPI.saveStripeConfig({
          secretKey: configValues['secretKey'] as string,
          publishableKey: configValues['publishableKey'] as string,
          webhookSecret: configValues['webhookSecret'] as string,
          isLiveMode: configValues['isLiveMode'] as boolean,
        });
      } else if (selectedService.id === 'revenuecat') {
        response = await _adminAPI.saveRevenueCatConfig({
          iosApiKey: configValues['iosApiKey'] as string,
          androidApiKey: configValues['androidApiKey'] as string,
        });
      } else {
        // External service
        response = await _adminAPI.saveExternalServiceConfig({
          serviceId: selectedService.id,
          endpoint: configValues['endpoint'] as string,
          isActive: configValues['isActive'] as boolean,
        });
      }

      if (response?.success) {
        Alert.alert('Success', 'Configuration saved successfully');
        closeServiceConfig();
        void loadConfigurations();
        logger.info('Configuration saved', { serviceId: selectedService.id });
      } else {
        throw new Error(response?.message || 'Failed to save configuration');
      }
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to save configuration'),
        {
          component: 'AdminConfigScreen',
          action: 'saveConfiguration',
          metadata: { serviceId: selectedService?.id },
        },
      );
      Alert.alert('Error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }, [selectedService, configValues, closeServiceConfig]);

  return {
    services,
    loading,
    saving,
    selectedService,
    configValues,
    openServiceConfig,
    closeServiceConfig,
    updateConfigValue,
    saveConfiguration,
    reloadConfigurations: loadConfigurations,
  };
};

