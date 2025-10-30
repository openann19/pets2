'use client';

import { useState } from 'react';
import type { UIConfig } from '@pawfectmatch/core';

interface ScreensTabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

export function ScreensTab({ config, onConfigChange }: ScreensTabProps) {
  const [localConfig, setLocalConfig] = useState<Partial<UIConfig>>(config || {});

  const updateScreen = (screen: string, prop: string, value: unknown) => {
    const newConfig = {
      ...localConfig,
      screens: {
        ...localConfig.screens,
        [screen]: {
          ...(localConfig.screens?.[screen as keyof typeof localConfig.screens] as object),
          [prop]: value,
        },
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Home Screen */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Home Screen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Header Style</label>
            <select
              value={(localConfig.screens?.Home as { header?: string })?.header || 'large-collapsible'}
              onChange={(e) => updateScreen('Home', 'header', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="large-collapsible">Large Collapsible</option>
              <option value="compact">Compact</option>
            </select>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={(localConfig.screens?.Home as { enableParallax?: boolean })?.enableParallax || false}
                onChange={(e) => updateScreen('Home', 'enableParallax', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              <span className="ml-3 text-sm text-gray-300">Enable Parallax</span>
            </label>
          </div>
        </div>
      </div>

      {/* Matches Screen */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Matches Screen</h3>
        <div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(localConfig.screens?.Matches as { sharedElement?: boolean })?.sharedElement || false}
              onChange={(e) => updateScreen('Matches', 'sharedElement', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
            <span className="ml-3 text-sm text-gray-300">Shared Element Transitions</span>
          </label>
        </div>
      </div>

      {/* Map Screen */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Map Screen</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">FAB Style</label>
            <select
              value={(localConfig.screens?.Map as { fabStyle?: string })?.fabStyle || 'pill'}
              onChange={(e) => updateScreen('Map', 'fabStyle', e.target.value)}
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="pill">Pill</option>
              <option value="circle">Circle</option>
            </select>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={(localConfig.screens?.Map as { showAR?: boolean })?.showAR || false}
                onChange={(e) => updateScreen('Map', 'showAR', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              <span className="ml-3 text-sm text-gray-300">Show AR Features</span>
            </label>
          </div>
        </div>
      </div>

      {/* Premium Screen */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Premium Screen</h3>
        <div className="space-y-4">
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={(localConfig.screens?.Premium as { shimmer?: boolean })?.shimmer || false}
                onChange={(e) => updateScreen('Premium', 'shimmer', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              <span className="ml-3 text-sm text-gray-300">Shimmer Effect</span>
            </label>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={(localConfig.screens?.Premium as { gleam?: boolean })?.gleam || false}
                onChange={(e) => updateScreen('Premium', 'gleam', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              <span className="ml-3 text-sm text-gray-300">Gleam Effect</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

