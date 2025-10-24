'use client';

import {
  EnhancedButton,
  EnhancedCard,
  EnhancedDropdown,
  EnhancedInput,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import {
  ArrowPathIcon,
  BeakerIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  PlayIcon,
  SparklesIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react'
import { logger } from '@pawfectmatch/core';
;

interface AIServiceConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  isConfigured: boolean;
  isActive: boolean;
}

interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  requestsToday: number;
  tokensToday: number;
  costToday: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequest: string;
}

interface AIEndpoint {
  name: string;
  endpoint: string;
  description: string;
  requests: number;
  avgResponseTime: number;
  errorRate: number;
  lastUsed: string;
  status: 'healthy' | 'warning' | 'error';
}

interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPerToken: number;
  isActive: boolean;
}

export default function AIServiceManagementPage() {
  const [aiConfig, setAiConfig] = useState<AIServiceConfig>({
    apiKey: '',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    maxTokens: 4000,
    temperature: 0.7,
    isConfigured: false,
    isActive: false,
  });

  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [endpoints, setEndpoints] = useState<AIEndpoint[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'models' | 'config'>(
    'overview',
  );
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState('');

  // Load AI service configuration
  useEffect(() => {
    loadAIConfig();
    loadAIStats();
  }, []);

  const loadAIConfig = async () => {
    try {
      const response = await fetch('/api/admin/ai/config');
      if (response.ok) {
        const config = await response.json();
        setAiConfig(config);
      }
    } catch (error) {
      logger.error('Failed to load AI config:', { error });
    }
  };

  const loadAIStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, endpointsRes, modelsRes] = await Promise.all([
        fetch('/api/admin/ai/stats'),
        fetch('/api/admin/ai/endpoints'),
        fetch('/api/admin/ai/models'),
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setUsageStats(stats);
      }

      if (endpointsRes.ok) {
        const endpoints = await endpointsRes.json();
        setEndpoints(endpoints);
      }

      if (modelsRes.ok) {
        const models = await modelsRes.json();
        setModels(models);
      }
    } catch (error) {
      logger.error('Failed to load AI stats:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAIConfig = async () => {
    setIsConfiguring(true);
    try {
      const response = await fetch('/api/admin/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig),
      });

      if (response.ok) {
        const result = await response.json();
        setAiConfig(result);
        setShowConfigModal(false);
        await loadAIStats();
      }
    } catch (error) {
      logger.error('Failed to save AI config:', { error });
    } finally {
      setIsConfiguring(false);
    }
  };

  const testAIService = async () => {
    if (!testPrompt.trim()) return;

    try {
      const response = await fetch('/api/admin/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testPrompt }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result.response);
      }
    } catch (error) {
      logger.error('Failed to test AI service:', { error });
      setTestResult('Error: Failed to test AI service');
    }
  };

  const toggleModel = async (modelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/ai/models/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        await loadAIStats();
      }
    } catch (error) {
      logger.error('Failed to toggle model:', { error });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
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
            AI Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage DeepSeek AI service, models, and usage analytics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <EnhancedButton
            onClick={() => setShowConfigModal(true)}
            variant="secondary"
            icon={<PencilIcon className="h-5 w-5" />}
            ariaLabel="Configure AI service"
          >
            Configure AI
          </EnhancedButton>
          <EnhancedButton
            onClick={loadAIStats}
            variant="primary"
            icon={<ArrowPathIcon className="h-5 w-5" />}
            ariaLabel="Refresh AI stats"
          >
            Refresh Data
          </EnhancedButton>
        </div>
      </div>

      {/* Configuration Status */}
      <EnhancedCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                DeepSeek AI Service
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {aiConfig.isConfigured ? 'Configured and Active' : 'Not Configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {aiConfig.isConfigured ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                aiConfig.isConfigured
                  ? 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                  : 'text-yellow-800 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
              }`}
            >
              {aiConfig.isConfigured ? 'Active' : 'Setup Required'}
            </span>
          </div>
        </div>
      </EnhancedCard>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {(() => {
            type TabId = 'overview' | 'endpoints' | 'models' | 'config';
            const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'endpoints', label: 'Endpoints', icon: Cog6ToothIcon },
              { id: 'models', label: 'Models', icon: CpuChipIcon },
              { id: 'config', label: 'Configuration', icon: PencilIcon },
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tokens</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(usageStats.totalTokens)}
                </p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-green-500" />
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
                  Requests Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(usageStats.requestsToday)}
                </p>
              </div>
              <SparklesIcon className="h-8 w-8 text-indigo-500" />
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
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.errorRate.toFixed(1)}%
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI Service Endpoints
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor AI endpoint performance and usage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.name}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {endpoint.name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(endpoint.status)}`}
                  >
                    {endpoint.status}
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {endpoint.description}
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Requests</span>
                    <span>{formatNumber(endpoint.requests)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Avg Response</span>
                    <span>{endpoint.avgResponseTime}ms</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Error Rate</span>
                    <span>{endpoint.errorRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Last Used</span>
                    <span>{new Date(endpoint.lastUsed).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}

      {/* Models Tab */}
      {activeTab === 'models' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Models</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage available AI models and their configurations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Max Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost per Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {models.map((model) => (
                  <tr
                    key={model.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {model.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(model.maxTokens)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${model.costPerToken.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          model.isActive
                            ? 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                            : 'text-gray-800 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
                        }`}
                      >
                        {model.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <EnhancedButton
                        onClick={() => toggleModel(model.id, !model.isActive)}
                        variant={model.isActive ? 'secondary' : 'primary'}
                        size="sm"
                        icon={
                          model.isActive ? (
                            <StopIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )
                        }
                        ariaLabel={model.isActive ? 'Deactivate model' : 'Activate model'}
                      >
                        {model.isActive ? 'Deactivate' : 'Activate'}
                      </EnhancedButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EnhancedCard>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure DeepSeek AI
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <EnhancedInput
                    type="password"
                    value={aiConfig.apiKey}
                    onChange={(value) => setAiConfig({ ...aiConfig, apiKey: value })}
                    placeholder="sk-..."
                    ariaLabel="DeepSeek API key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base URL
                  </label>
                  <EnhancedInput
                    type="text"
                    value={aiConfig.baseUrl}
                    onChange={(value) => setAiConfig({ ...aiConfig, baseUrl: value })}
                    placeholder="https://api.deepseek.com"
                    ariaLabel="AI service base URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model
                  </label>
                  <EnhancedDropdown
                    options={[
                      { value: 'deepseek-chat', label: 'DeepSeek Chat' },
                      { value: 'deepseek-coder', label: 'DeepSeek Coder' },
                    ]}
                    value={aiConfig.model}
                    onChange={(value) => setAiConfig({ ...aiConfig, model: value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <EnhancedInput
                    type="number"
                    value={aiConfig.maxTokens.toString()}
                    onChange={(value) => setAiConfig({ ...aiConfig, maxTokens: parseInt(value) })}
                    placeholder="4000"
                    ariaLabel="Maximum tokens"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature
                  </label>
                  <EnhancedInput
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={aiConfig.temperature.toString()}
                    onChange={(value) =>
                      setAiConfig({ ...aiConfig, temperature: parseFloat(value) })
                    }
                    placeholder="0.7"
                    ariaLabel="AI temperature"
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
                  onClick={saveAIConfig}
                  variant="primary"
                  disabled={isConfiguring}
                  ariaLabel="Save AI configuration"
                >
                  {isConfiguring ? 'Saving...' : 'Save Configuration'}
                </EnhancedButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test AI Service */}
      <EnhancedCard className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Test AI Service
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test the AI service with a custom prompt
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Prompt
            </label>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a test prompt..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              rows={3}
            />
          </div>

          <EnhancedButton
            onClick={testAIService}
            variant="primary"
            icon={<BeakerIcon className="h-5 w-5" />}
            disabled={!testPrompt.trim()}
            ariaLabel="Test AI service"
          >
            Test AI Service
          </EnhancedButton>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Response:</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{testResult}</p>
            </div>
          )}
        </div>
      </EnhancedCard>
    </div>
  );
}
