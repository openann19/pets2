'use client';

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';
import type { UIConfig } from '@pawfectmatch/core';

interface ThemeTokensTabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

export function ThemeTokensTab({ config, onConfigChange }: ThemeTokensTabProps) {
  const [localConfig, setLocalConfig] = useState<Partial<UIConfig>>(config || {});

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const updateColor = (key: string, value: string) => {
    const newConfig = {
      ...localConfig,
      tokens: {
        ...localConfig.tokens,
        colors: {
          ...localConfig.tokens?.colors,
          [key]: value,
        },
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const updateSpacing = (key: string, value: number) => {
    const newConfig = {
      ...localConfig,
      tokens: {
        ...localConfig.tokens,
        spacing: {
          ...localConfig.tokens?.spacing,
          [key]: value,
        },
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const updateRadii = (key: string, value: number) => {
    const newConfig = {
      ...localConfig,
      tokens: {
        ...localConfig.tokens,
        radii: {
          ...localConfig.tokens?.radii,
          [key]: value,
        },
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const colorKeys = [
    'bg',
    'surface',
    'overlay',
    'border',
    'onBg',
    'onSurface',
    'onMuted',
    'primary',
    'onPrimary',
    'success',
    'danger',
    'warning',
    'info',
  ];

  const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const;
  const radiiKeys = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill', 'full'] as const;

  return (
    <div className="space-y-6">
      {/* Colors Section */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {colorKeys.map((key) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 capitalize">{key}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localConfig.tokens?.colors?.[key] || '#000000'}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="h-10 w-20 rounded border border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={localConfig.tokens?.colors?.[key] || ''}
                  onChange={(e) => updateColor(key, e.target.value)}
                  className="flex-1 px-3 py-2 bg-admin-dark border border-gray-600 rounded text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing Section */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {spacingKeys.map((key) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">{key}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localConfig.tokens?.spacing?.[key] || 0}
                  onChange={(e) => updateSpacing(key, parseInt(e.target.value, 10) || 0)}
                  className="flex-1 px-3 py-2 bg-admin-dark border border-gray-600 rounded text-sm"
                  min="0"
                  step="1"
                />
                <span className="text-xs text-gray-400">px</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radii Section */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Border Radius</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {radiiKeys.map((key) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">{key}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localConfig.tokens?.radii?.[key] || 0}
                  onChange={(e) => updateRadii(key, parseInt(e.target.value, 10) || 0)}
                  className="flex-1 px-3 py-2 bg-admin-dark border border-gray-600 rounded text-sm"
                  min="0"
                  step="1"
                />
                <span className="text-xs text-gray-400">px</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

