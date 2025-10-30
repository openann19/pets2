'use client';

import { useState } from 'react';
import type { UIConfig } from '@pawfectmatch/core';

interface FeatureFlagsTabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

export function FeatureFlagsTab({ config, onConfigChange }: FeatureFlagsTabProps) {
  const [localConfig, setLocalConfig] = useState<Partial<UIConfig>>(config || {});
  const [newFlagKey, setNewFlagKey] = useState('');

  const toggleFlag = (key: string) => {
    const newConfig = {
      ...localConfig,
      featureFlags: {
        ...localConfig.featureFlags,
        [key]: !localConfig.featureFlags?.[key],
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const addFlag = () => {
    if (!newFlagKey.trim()) return;
    const newConfig = {
      ...localConfig,
      featureFlags: {
        ...localConfig.featureFlags,
        [newFlagKey]: false,
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
    setNewFlagKey('');
  };

  const removeFlag = (key: string) => {
    const flags = { ...localConfig.featureFlags };
    delete flags[key];
    const newConfig = {
      ...localConfig,
      featureFlags: flags,
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Add New Flag */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Add Feature Flag</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFlagKey}
            onChange={(e) => setNewFlagKey(e.target.value)}
            placeholder="flag.key.name"
            className="flex-1 px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            onKeyPress={(e) => e.key === 'Enter' && addFlag()}
          />
          <button
            onClick={addFlag}
            className="px-4 py-2 bg-admin-primary text-white rounded hover:bg-admin-primary/90"
          >
            Add
          </button>
        </div>
      </div>

      {/* Flags List */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Feature Flags</h3>
        <div className="space-y-3">
          {Object.entries(localConfig.featureFlags || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-admin-dark rounded">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value || false}
                    onChange={() => toggleFlag(key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                </label>
                <span className="text-sm font-medium text-gray-300">{key}</span>
              </div>
              <button
                onClick={() => removeFlag(key)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
          {Object.keys(localConfig.featureFlags || {}).length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No feature flags configured</p>
          )}
        </div>
      </div>
    </div>
  );
}

