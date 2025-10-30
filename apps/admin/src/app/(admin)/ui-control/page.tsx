'use client';

import { useState, useEffect } from 'react';
import {
  SwatchIcon,
  SparklesIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  FlagIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { axiosInstance } from '@/lib/axios';
import type { UIConfig } from '@pawfectmatch/core';
import { ThemeTokensTab } from '@/components/admin/UIControl/ThemeTokensTab';
import { MicroInteractionsTab } from '@/components/admin/UIControl/MicroInteractionsTab';
import { ComponentsTab } from '@/components/admin/UIControl/ComponentsTab';
import { ScreensTab } from '@/components/admin/UIControl/ScreensTab';
import { FeatureFlagsTab } from '@/components/admin/UIControl/FeatureFlagsTab';
import { PublishTab } from '@/components/admin/UIControl/PublishTab';

const tabs = [
  { id: 'theme', name: 'Theme Tokens', icon: SwatchIcon },
  { id: 'micro-interactions', name: 'Micro-Interactions', icon: SparklesIcon },
  { id: 'components', name: 'Components', icon: CubeIcon },
  { id: 'screens', name: 'Screens', icon: DevicePhoneMobileIcon },
  { id: 'flags', name: 'Feature Flags', icon: FlagIcon },
  { id: 'publish', name: 'Publish', icon: RocketLaunchIcon },
];

export default function UIControlPage() {
  const [activeTab, setActiveTab] = useState('theme');
  const [config, setConfig] = useState<UIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [draftConfig, setDraftConfig] = useState<Partial<UIConfig>>({});

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/api/ui-config/current');
      if (response.data.success && response.data.data?.config) {
        setConfig(response.data.data.config);
        setDraftConfig(response.data.data.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (partial: Partial<UIConfig>) => {
    setDraftConfig((prev) => ({ ...prev, ...partial }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading configuration...</p>
      </div>
    );
  }

  const currentConfig = { ...config, ...draftConfig } as UIConfig;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">🎛️ UI Control Plane</h1>
        <p className="text-gray-400 mt-2">
          Edit themes, motion, components, and feature flags remotely. Changes apply instantly without app rebuilds.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    isActive
                      ? 'border-admin-primary text-admin-primary'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'theme' && (
          <ThemeTokensTab config={currentConfig} onConfigChange={handleConfigChange} />
        )}
        {activeTab === 'micro-interactions' && (
          <MicroInteractionsTab config={currentConfig} onConfigChange={handleConfigChange} />
        )}
        {activeTab === 'components' && (
          <ComponentsTab config={currentConfig} onConfigChange={handleConfigChange} />
        )}
        {activeTab === 'screens' && (
          <ScreensTab config={currentConfig} onConfigChange={handleConfigChange} />
        )}
        {activeTab === 'flags' && (
          <FeatureFlagsTab config={currentConfig} onConfigChange={handleConfigChange} />
        )}
        {activeTab === 'publish' && (
          <PublishTab config={currentConfig} onConfigChange={handleConfigChange} />
        )}
      </div>
    </div>
  );
}

