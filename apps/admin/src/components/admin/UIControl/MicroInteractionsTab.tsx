'use client';

import { useState } from 'react';
import type { UIConfig } from '@pawfectmatch/core';

interface MicroInteractionsTabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

export function MicroInteractionsTab({ config, onConfigChange }: MicroInteractionsTabProps) {
  const [localConfig, setLocalConfig] = useState<Partial<UIConfig>>(config || {});

  const updateMicroInteraction = (key: string, value: unknown) => {
    const newConfig = {
      ...localConfig,
      microInteractions: {
        ...localConfig.microInteractions,
        [key]: value,
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const toggleEnabled = (key: string) => {
    const current = localConfig.microInteractions?.[key as keyof typeof localConfig.microInteractions];
    updateMicroInteraction(key, {
      ...current,
      enabled: !(current as { enabled?: boolean })?.enabled,
    });
  };

  return (
    <div className="space-y-6">
      {/* Press Feedback */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Press Feedback</h3>
            <p className="text-sm text-gray-400">Scale and haptic feedback on button press</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(localConfig.microInteractions?.pressFeedback as { enabled?: boolean })?.enabled || false}
              onChange={() => toggleEnabled('pressFeedback')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
          </label>
        </div>
        {(localConfig.microInteractions?.pressFeedback as { enabled?: boolean })?.enabled && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Scale</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1"
                value={(localConfig.microInteractions?.pressFeedback as { scale?: number })?.scale || 0.98}
                onChange={(e) =>
                  updateMicroInteraction('pressFeedback', {
                    ...(localConfig.microInteractions?.pressFeedback as object),
                    scale: parseFloat(e.target.value) || 0.98,
                  })
                }
                className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (ms)</label>
              <input
                type="number"
                min="0"
                max="500"
                value={(localConfig.microInteractions?.pressFeedback as { durationMs?: number })?.durationMs || 180}
                onChange={(e) =>
                  updateMicroInteraction('pressFeedback', {
                    ...(localConfig.microInteractions?.pressFeedback as object),
                    durationMs: parseInt(e.target.value, 10) || 180,
                  })
                }
                className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Success Morph */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Success Morph</h3>
            <p className="text-sm text-gray-400">Animated success state transitions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(localConfig.microInteractions?.successMorph as { enabled?: boolean })?.enabled || false}
              onChange={() => toggleEnabled('successMorph')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
          </label>
        </div>
      </div>

      {/* Elastic Pull to Refresh */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Elastic Pull to Refresh</h3>
            <p className="text-sm text-gray-400">Bouncy pull-to-refresh interaction</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={(localConfig.microInteractions?.elasticPullToRefresh as { enabled?: boolean })?.enabled || false}
              onChange={() => toggleEnabled('elasticPullToRefresh')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
          </label>
        </div>
      </div>

      {/* Guards */}
      <div className="bg-admin-dark-light rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Accessibility Guards</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Low-End Device Policy
            </label>
            <select
              value={(localConfig.microInteractions?.guards as { lowEndDevicePolicy?: string })?.lowEndDevicePolicy || 'full'}
              onChange={(e) =>
                updateMicroInteraction('guards', {
                  ...(localConfig.microInteractions?.guards as object),
                  lowEndDevicePolicy: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded"
            >
              <option value="full">Full animations</option>
              <option value="simplify">Simplified animations</option>
              <option value="skip">Skip animations</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

