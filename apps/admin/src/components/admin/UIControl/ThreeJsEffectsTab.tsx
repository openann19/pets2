'use client';

import { useState, useEffect } from 'react';
import type { UIConfig } from '@pawfectmatch/core';
import { CubeIcon } from '@heroicons/react/24/outline';

interface ThreeJsEffectsTabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

export function ThreeJsEffectsTab({ config, onConfigChange }: ThreeJsEffectsTabProps) {
  const [localConfig, setLocalConfig] = useState<Partial<UIConfig>>(config || {});

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const updateThreeJsEffects = (updates: Record<string, unknown>) => {
    const newConfig = {
      ...localConfig,
      visualEnhancements2025: {
        ...localConfig.visualEnhancements2025,
        effects: {
          ...localConfig.visualEnhancements2025?.effects,
          threeJsEffects: {
            ...localConfig.visualEnhancements2025?.effects?.threeJsEffects,
            ...updates,
          },
        },
      },
    };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const updateEffect = (effectName: 'liquidMorph' | 'galaxyParticles' | 'volumetricPortal', updates: Record<string, unknown>) => {
    const current = localConfig.visualEnhancements2025?.effects?.threeJsEffects?.[effectName] || {};
    updateThreeJsEffects({
      [effectName]: {
        ...current,
        ...updates,
      },
    });
  };

  const updateGlobal = (updates: Record<string, unknown>) => {
    const current = localConfig.visualEnhancements2025?.effects?.threeJsEffects?.global || {};
    updateThreeJsEffects({
      global: {
        ...current,
        ...updates,
      },
    });
  };

  const threeJsEffects = localConfig.visualEnhancements2025?.effects?.threeJsEffects;

  return (
    <div className="space-y-6">
      <div className="bg-admin-dark-light rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <CubeIcon className="h-6 w-6 text-admin-primary" />
          <div>
            <h2 className="text-xl font-semibold text-white">Three.js WebGL Effects</h2>
            <p className="text-sm text-gray-400">
              Control premium WebGL effects: Liquid Morph, Galaxy Particles, and Volumetric Portal
            </p>
          </div>
        </div>

        {/* Global Toggle */}
        <div className="border-b border-gray-700 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Enable Three.js Effects</h3>
              <p className="text-sm text-gray-400">Master toggle for all WebGL effects</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={threeJsEffects?.enabled || false}
                onChange={(e) => updateThreeJsEffects({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
            </label>
          </div>
        </div>

        {threeJsEffects?.enabled && (
          <div className="space-y-6">
            {/* Liquid Morph */}
            <div className="bg-admin-dark rounded-lg p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Liquid Morph</h3>
                  <p className="text-sm text-gray-400">Procedural 3D morphing geometry with Fresnel shading</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={threeJsEffects?.liquidMorph?.enabled || false}
                    onChange={(e) => updateEffect('liquidMorph', { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                </label>
              </div>
              {threeJsEffects?.liquidMorph?.enabled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Intensity (0-3)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="3"
                      value={threeJsEffects?.liquidMorph?.intensity || 1}
                      onChange={(e) => updateEffect('liquidMorph', { intensity: parseFloat(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Speed (0-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={threeJsEffects?.liquidMorph?.speed || 1.5}
                      onChange={(e) => updateEffect('liquidMorph', { speed: parseFloat(e.target.value) || 1.5 })}
                      className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color 1</label>
                    <input
                      type="color"
                      value={threeJsEffects?.liquidMorph?.color1 || '#ec4899'}
                      onChange={(e) => updateEffect('liquidMorph', { color1: e.target.value })}
                      className="w-full h-10 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color 2</label>
                    <input
                      type="color"
                      value={threeJsEffects?.liquidMorph?.color2 || '#8b5cf6'}
                      onChange={(e) => updateEffect('liquidMorph', { color2: e.target.value })}
                      className="w-full h-10 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Galaxy Particles */}
            <div className="bg-admin-dark rounded-lg p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Galaxy Particles</h3>
                  <p className="text-sm text-gray-400">Adaptive particle system with quality scaling</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={threeJsEffects?.galaxyParticles?.enabled || false}
                    onChange={(e) => updateEffect('galaxyParticles', { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                </label>
              </div>
              {threeJsEffects?.galaxyParticles?.enabled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Base Count</label>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      step="1000"
                      value={threeJsEffects?.galaxyParticles?.baseCount || 50000}
                      onChange={(e) => updateEffect('galaxyParticles', { baseCount: parseInt(e.target.value) || 50000 })}
                      className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Count</label>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      step="1000"
                      value={threeJsEffects?.galaxyParticles?.maxCount || 60000}
                      onChange={(e) => updateEffect('galaxyParticles', { maxCount: parseInt(e.target.value) || 60000 })}
                      className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={threeJsEffects?.galaxyParticles?.autoScale !== false}
                        onChange={(e) => updateEffect('galaxyParticles', { autoScale: e.target.checked })}
                        className="w-4 h-4 text-admin-primary bg-admin-dark border-gray-600 rounded focus:ring-admin-primary"
                      />
                      <span className="text-sm text-gray-300">Auto-scale based on device quality</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Volumetric Portal */}
            <div className="bg-admin-dark rounded-lg p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Volumetric Portal</h3>
                  <p className="text-sm text-gray-400">Volumetric light portal with seeded noise</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={threeJsEffects?.volumetricPortal?.enabled || false}
                    onChange={(e) => updateEffect('volumetricPortal', { enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                </label>
              </div>
              {threeJsEffects?.volumetricPortal?.enabled && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={threeJsEffects?.volumetricPortal?.active !== false}
                        onChange={(e) => updateEffect('volumetricPortal', { active: e.target.checked })}
                        className="w-4 h-4 text-admin-primary bg-admin-dark border-gray-600 rounded focus:ring-admin-primary"
                      />
                      <span className="text-sm text-gray-300">Active</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Intensity (0-3)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="3"
                      value={threeJsEffects?.volumetricPortal?.intensity || 1}
                      onChange={(e) => updateEffect('volumetricPortal', { intensity: parseFloat(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color 1</label>
                    <input
                      type="color"
                      value={threeJsEffects?.volumetricPortal?.color1 || '#f0abfc'}
                      onChange={(e) => updateEffect('volumetricPortal', { color1: e.target.value })}
                      className="w-full h-10 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color 2</label>
                    <input
                      type="color"
                      value={threeJsEffects?.volumetricPortal?.color2 || '#c084fc'}
                      onChange={(e) => updateEffect('volumetricPortal', { color2: e.target.value })}
                      className="w-full h-10 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Global Settings */}
            <div className="bg-admin-dark rounded-lg p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Global Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Safe Mode</label>
                    <p className="text-xs text-gray-400">Minimal visuals for testing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={threeJsEffects?.global?.safeMode || false}
                      onChange={(e) => updateGlobal({ safeMode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quality Tier</label>
                  <select
                    value={threeJsEffects?.global?.qualityTier || 'auto'}
                    onChange={(e) => updateGlobal({ qualityTier: e.target.value as 'auto' | 'low' | 'mid' | 'high' })}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  >
                    <option value="auto">Auto (Device Detection)</option>
                    <option value="low">Low</option>
                    <option value="mid">Mid</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">DPR Cap (1-3)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="3"
                    value={threeJsEffects?.global?.dprCap || 2}
                    onChange={(e) => updateGlobal({ dprCap: parseFloat(e.target.value) || 2 })}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Device Pixel Ratio cap to prevent overdraw</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">Respect Reduced Motion</label>
                    <p className="text-xs text-gray-400">Automatically reduce effects when user prefers reduced motion</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={threeJsEffects?.global?.respectReducedMotion !== false}
                      onChange={(e) => updateGlobal({ respectReducedMotion: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

