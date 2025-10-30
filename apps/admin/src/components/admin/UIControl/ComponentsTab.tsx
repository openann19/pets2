'use client';

import { useState } from 'react';
import type { UIConfig } from '@pawfectmatch/core';

interface ComponentsTabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

export function ComponentsTab({ config, onConfigChange }: ComponentsTabProps) {
  const [localConfig, setLocalConfig] = useState<Partial<UIConfig>>(config || {});

  const updateComponent = (component: string, prop: string, value: unknown) => {
    const newConfig = {
      ...localConfig,
      components: {
        ...localConfig.components,
        [component]: {
          ...(localConfig.components?.[component as keyof typeof localConfig.components] as object),
          [prop]: value,
        },
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Button */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Button Component</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Variant</label>
            <select
              value={(localConfig.components?.button as { variant?: string })?.variant || 'primary'}
              onChange={(e) => updateComponent('button', 'variant', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="ghost">Ghost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Radius</label>
            <select
              value={(localConfig.components?.button as { radius?: string })?.radius || 'md'}
              onChange={(e) => updateComponent('button', 'radius', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Elevation</label>
            <select
              value={(localConfig.components?.button as { elevation?: string })?.elevation || '2'}
              onChange={(e) => updateComponent('button', 'elevation', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Card Component</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Radius</label>
            <select
              value={(localConfig.components?.card as { radius?: string })?.radius || 'lg'}
              onChange={(e) => updateComponent('card', 'radius', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Elevation</label>
            <select
              value={(localConfig.components?.card as { elevation?: string })?.elevation || '1'}
              onChange={(e) => updateComponent('card', 'elevation', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image Fade</label>
            <select
              value={(localConfig.components?.card as { imageFade?: string })?.imageFade || 'dominant-color'}
              onChange={(e) => updateComponent('card', 'imageFade', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="dominant-color">Dominant Color</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Toast Component</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <select
              value={(localConfig.components?.toast as { position?: string })?.position || 'top'}
              onChange={(e) => updateComponent('toast', 'position', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (ms)</label>
            <input
              type="number"
              min="1000"
              max="10000"
              value={(localConfig.components?.toast as { durationMs?: number })?.durationMs || 3000}
              onChange={(e) => updateComponent('toast', 'durationMs', parseInt(e.target.value, 10) || 3000)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

