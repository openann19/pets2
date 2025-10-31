'use client';

import { useState } from 'react';
import type { UIConfig, VisualEnhancements2025 } from '@pawfectmatch/core';
import {
  SparklesIcon,
  PaintBrushIcon,
  CubeIcon,
  DocumentTextIcon,
  ColorSwatchIcon,
  ArrowsPointingOutIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface VisualEnhancements2025TabProps {
  config: UIConfig | null;
  onConfigChange: (config: Partial<UIConfig>) => void;
}

const PRESETS = {
  minimal: {
    name: 'Minimal',
    description: 'Subtle animations, performance-focused',
    config: {
      preset: 'minimal' as const,
      animations: { enabled: true },
      effects: {
        threeDCards: { enabled: false },
        particles: { enabled: false, maxCount: 0 },
        glassMorphism: { enabled: false },
        isometric: { enabled: false },
        texturedRealism: { enabled: false },
      },
      typography: {
        gradientText: { enabled: false, animationSpeed: 1, variants: [] },
        kinetic: { enabled: false, variants: [] },
        scrollReveal: { enabled: false },
        morphing: { enabled: false },
      },
      colors: {
        dynamicColors: { enabled: false },
        hdr: { enabled: false },
        neonAccents: { enabled: false, intensity: 0 },
        gradientMeshes: { enabled: false },
      },
      scroll: {
        parallax: { enabled: false },
        scrollTriggers: { enabled: false },
        momentum: { enabled: false },
        sticky: { enabled: false },
      },
      performance: {
        capabilityGating: true,
        lowEndDevicePolicy: 'skip' as const,
        maxParticles: 0,
        maxBlurRadius: 0,
      },
    },
  },
  standard: {
    name: 'Standard',
    description: 'Balanced animations, good performance',
    config: {
      preset: 'standard' as const,
      animations: { enabled: true },
      effects: {
        threeDCards: { enabled: true, tiltDegrees: 5 },
        particles: { enabled: true, maxCount: 30 },
        glassMorphism: { enabled: true, blurIntensity: 10, opacity: 0.7 },
        isometric: { enabled: false },
        texturedRealism: { enabled: true, softShadows: true },
      },
      typography: {
        gradientText: { enabled: true, animationSpeed: 1.5, variants: ['primary', 'secondary'] },
        kinetic: { enabled: true, variants: ['bounce'], intensity: 'subtle' as const },
        scrollReveal: { enabled: true },
        morphing: { enabled: false },
      },
      colors: {
        dynamicColors: { enabled: false },
        hdr: { enabled: false },
        neonAccents: { enabled: false, intensity: 0 },
        gradientMeshes: { enabled: true },
      },
      scroll: {
        parallax: { enabled: true, layers: 2, intensity: 0.5 },
        scrollTriggers: { enabled: true },
        momentum: { enabled: false },
        sticky: { enabled: true },
      },
      performance: {
        capabilityGating: true,
        lowEndDevicePolicy: 'simplify' as const,
        maxParticles: 50,
        maxBlurRadius: 15,
      },
    },
  },
  premium: {
    name: 'Premium',
    description: 'Rich animations, smooth experience',
    config: {
      preset: 'premium' as const,
      animations: { enabled: true },
      effects: {
        threeDCards: { enabled: true, tiltDegrees: 10, depthShadow: true },
        particles: { enabled: true, maxCount: 60 },
        glassMorphism: { enabled: true, blurIntensity: 20, opacity: 0.5, reflection: true, animated: true },
        isometric: { enabled: true, angle: 30, depth: 50 },
        texturedRealism: { enabled: true, softShadows: true, claymorphicShapes: true, gradientMeshes: true },
      },
      typography: {
        gradientText: { enabled: true, animationSpeed: 2, variants: ['primary', 'secondary', 'premium', 'neon'] },
        kinetic: { enabled: true, variants: ['bounce', 'wave', 'pulse'], intensity: 'medium' as const },
        scrollReveal: { enabled: true },
        morphing: { enabled: true, duration: 800 },
      },
      colors: {
        dynamicColors: { enabled: true, timeOfDayShift: true },
        hdr: { enabled: true, detectCapability: true, fallbackToSRGB: true },
        neonAccents: { enabled: true, intensity: 0.7 },
        gradientMeshes: { enabled: true, animated: true, rotationSpeed: 2 },
      },
      scroll: {
        parallax: { enabled: true, layers: 3, intensity: 1 },
        scrollTriggers: { enabled: true },
        momentum: { enabled: true, bounce: true },
        sticky: { enabled: true, transformOnStick: true },
      },
      performance: {
        capabilityGating: true,
        lowEndDevicePolicy: 'simplify' as const,
        maxParticles: 100,
        maxBlurRadius: 25,
      },
    },
  },
  ultra: {
    name: 'Ultra',
    description: 'Maximum visual impact, flagship devices only',
    config: {
      preset: 'ultra' as const,
      animations: { enabled: true },
      effects: {
        threeDCards: { enabled: true, tiltDegrees: 15, depthShadow: true, gyroscopeTilt: true },
        particles: { enabled: true, maxCount: 150 },
        glassMorphism: { enabled: true, blurIntensity: 30, opacity: 0.3, reflection: true, animated: true },
        isometric: { enabled: true, angle: 45, depth: 80 },
        texturedRealism: { enabled: true, softShadows: true, claymorphicShapes: true, gradientMeshes: true },
      },
      typography: {
        gradientText: { enabled: true, animationSpeed: 3, variants: ['primary', 'secondary', 'premium', 'neon', 'rainbow', 'holographic'] },
        kinetic: { enabled: true, variants: ['bounce', 'wave', 'pulse', 'slide'], intensity: 'bold' as const },
        scrollReveal: { enabled: true },
        morphing: { enabled: true, duration: 500 },
      },
      colors: {
        dynamicColors: { enabled: true, timeOfDayShift: true, ambientLightAdaptation: true },
        hdr: { enabled: true, detectCapability: true, fallbackToSRGB: true },
        neonAccents: { enabled: true, intensity: 1 },
        gradientMeshes: { enabled: true, animated: true, rotationSpeed: 5 },
      },
      scroll: {
        parallax: { enabled: true, layers: 5, intensity: 1.5 },
        scrollTriggers: { enabled: true },
        momentum: { enabled: true, bounce: true, friction: 0.8 },
        sticky: { enabled: true, transformOnStick: true },
      },
      performance: {
        capabilityGating: true,
        lowEndDevicePolicy: 'full' as const,
        maxParticles: 200,
        maxBlurRadius: 40,
      },
    },
  },
};

export function VisualEnhancements2025Tab({ config, onConfigChange }: VisualEnhancements2025TabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'animations' | 'effects' | 'typography' | 'colors' | 'scroll'>('presets');
  const [localConfig, setLocalConfig] = useState<Partial<VisualEnhancements2025>>(
    config?.visualEnhancements2025 || PRESETS.standard.config,
  );

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    setLocalConfig(preset.config);
    onConfigChange({ visualEnhancements2025: preset.config });
  };

  const updateConfig = (path: string[], value: unknown) => {
    const newConfig = { ...localConfig };
    let current: any = newConfig;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setLocalConfig(newConfig);
    onConfigChange({ visualEnhancements2025: newConfig });
  };

  const subTabs = [
    { id: 'presets', name: 'Presets', icon: BoltIcon },
    { id: 'animations', name: 'Animations', icon: SparklesIcon },
    { id: 'effects', name: 'Visual Effects', icon: CubeIcon },
    { id: 'typography', name: 'Typography', icon: DocumentTextIcon },
    { id: 'colors', name: 'Colors', icon: ColorSwatchIcon },
    { id: 'scroll', name: 'Scroll', icon: ArrowsPointingOutIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">✨ 2025 Visual Enhancements</h2>
        <p className="text-gray-400 mt-1">Cutting-edge animations, effects, and interactions</p>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`
                  flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap
                  ${
                    isActive
                      ? 'border-admin-primary text-admin-primary'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Presets Tab */}
      {activeSubTab === 'presets' && (
        <div className="space-y-6">
          <div className="bg-admin-dark-light rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Presets</h3>
            <p className="text-sm text-gray-400 mb-6">
              Choose a preset to instantly configure all visual enhancements, or customize below.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key as keyof typeof PRESETS)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      localConfig.preset === key
                        ? 'border-admin-primary bg-admin-primary/10'
                        : 'border-gray-600 bg-admin-dark hover:border-gray-500'
                    }
                  `}
                >
                  <h4 className="font-semibold text-white mb-1">{preset.name}</h4>
                  <p className="text-xs text-gray-400">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Settings */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capability Gating
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.performance?.capabilityGating ?? true}
                    onChange={(e) => updateConfig(['performance', 'capabilityGating'], e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
                  <span className="ml-3 text-sm text-gray-300">
                    Auto-disable heavy effects on low-end devices
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Low-End Device Policy
                </label>
                <select
                  value={localConfig.performance?.lowEndDevicePolicy || 'simplify'}
                  onChange={(e) => updateConfig(['performance', 'lowEndDevicePolicy'], e.target.value)}
                  className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                >
                  <option value="skip">Skip all animations</option>
                  <option value="simplify">Simplify animations</option>
                  <option value="full">Full animations</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Particles
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={localConfig.performance?.maxParticles ?? 100}
                    onChange={(e) => updateConfig(['performance', 'maxParticles'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Blur Radius
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={localConfig.performance?.maxBlurRadius ?? 25}
                    onChange={(e) => updateConfig(['performance', 'maxBlurRadius'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations Tab - Animation Presets Editor */}
      {activeSubTab === 'animations' && (
        <div className="space-y-6">
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Animation Presets</h3>
                <p className="text-sm text-gray-400">Create and manage custom spring/timing presets</p>
              </div>
              <button
                onClick={() => {
                  const newPreset = {
                    id: `preset-${Date.now()}`,
                    name: 'New Preset',
                    description: 'Custom animation preset',
                    spring: {
                      stiffness: 300,
                      damping: 30,
                      mass: 1,
                      overshootClamping: false,
                    },
                    timing: {
                      duration: 300,
                      easing: [0.2, 0, 0, 1] as const,
                    },
                  };
                  const currentPresets = localConfig.animations?.presets ?? [];
                  updateConfig(['animations', 'presets'], [...currentPresets, newPreset]);
                }}
                className="px-4 py-2 bg-admin-primary text-white rounded hover:bg-admin-primary/90"
              >
                + New Preset
              </button>
            </div>

            {/* Custom Preset Editor */}
            <div className="mt-6 space-y-4">
              <h4 className="text-md font-semibold">Custom Animation Preset</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spring Stiffness</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={localConfig.animations?.customPreset?.spring?.stiffness ?? 300}
                    onChange={(e) =>
                      updateConfig(['animations', 'customPreset'], {
                        ...localConfig.animations?.customPreset,
                        id: 'custom',
                        name: 'Custom',
                        spring: {
                          ...localConfig.animations?.customPreset?.spring,
                          stiffness: parseInt(e.target.value, 10) || 300,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spring Damping</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={localConfig.animations?.customPreset?.spring?.damping ?? 30}
                    onChange={(e) =>
                      updateConfig(['animations', 'customPreset'], {
                        ...localConfig.animations?.customPreset,
                        id: 'custom',
                        name: 'Custom',
                        spring: {
                          ...localConfig.animations?.customPreset?.spring,
                          damping: parseInt(e.target.value, 10) || 30,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spring Mass</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="5"
                    value={localConfig.animations?.customPreset?.spring?.mass ?? 1}
                    onChange={(e) =>
                      updateConfig(['animations', 'customPreset'], {
                        ...localConfig.animations?.customPreset,
                        id: 'custom',
                        name: 'Custom',
                        spring: {
                          ...localConfig.animations?.customPreset?.spring,
                          mass: parseFloat(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timing Duration (ms)</label>
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    value={localConfig.animations?.customPreset?.timing?.duration ?? 300}
                    onChange={(e) =>
                      updateConfig(['animations', 'customPreset'], {
                        ...localConfig.animations?.customPreset,
                        id: 'custom',
                        name: 'Custom',
                        timing: {
                          ...localConfig.animations?.customPreset?.timing,
                          duration: parseInt(e.target.value, 10) || 300,
                          easing: localConfig.animations?.customPreset?.timing?.easing ?? [0.2, 0, 0, 1],
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Easing (Bezier)</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={idx}
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={localConfig.animations?.customPreset?.timing?.easing?.[idx] ?? [0.2, 0, 0, 1][idx]}
                        onChange={(e) => {
                          const easing = localConfig.animations?.customPreset?.timing?.easing ?? [0.2, 0, 0, 1];
                          const newEasing = [...easing] as [number, number, number, number];
                          newEasing[idx] = parseFloat(e.target.value) || 0;
                          updateConfig(['animations', 'customPreset'], {
                            ...localConfig.animations?.customPreset,
                            id: 'custom',
                            name: 'Custom',
                            timing: {
                              ...localConfig.animations?.customPreset?.timing,
                              easing: newEasing,
                            },
                          });
                        }}
                        className="w-full px-2 py-2 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                        placeholder={`${idx === 0 ? 'x1' : idx === 1 ? 'y1' : idx === 2 ? 'x2' : 'y2'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localConfig.animations?.customPreset?.spring?.overshootClamping ?? false}
                  onChange={(e) =>
                    updateConfig(['animations', 'customPreset'], {
                      ...localConfig.animations?.customPreset,
                      id: 'custom',
                      name: 'Custom',
                      spring: {
                        ...localConfig.animations?.customPreset?.spring,
                        overshootClamping: e.target.checked,
                      },
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Overshoot Clamping</span>
              </label>
            </div>

            {/* Preset List */}
            {localConfig.animations?.presets && localConfig.animations.presets.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-4">Saved Presets</h4>
                <div className="space-y-2">
                  {localConfig.animations.presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 bg-admin-dark rounded border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-white">{preset.name}</h5>
                          <p className="text-xs text-gray-400">{preset.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Spring: k={preset.spring.stiffness}, c={preset.spring.damping}, m={preset.spring.mass}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newPresets = (localConfig.animations?.presets ?? []).filter(
                              (p) => p.id !== preset.id,
                            );
                            updateConfig(['animations', 'presets'], newPresets);
                          }}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Effects Tab */}
      {activeSubTab === 'effects' && (
        <div className="space-y-6">
          {/* 3D Cards */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">3D Card Effects</h3>
                <p className="text-sm text-gray-400">Perspective transforms and depth shadows</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.effects?.threeDCards?.enabled ?? false}
                  onChange={(e) => updateConfig(['effects', 'threeDCards', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.effects?.threeDCards?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tilt Degrees</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={localConfig.effects?.threeDCards?.tiltDegrees ?? 10}
                    onChange={(e) => updateConfig(['effects', 'threeDCards', 'tiltDegrees'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Cards</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={localConfig.effects?.threeDCards?.maxCards ?? 3}
                    onChange={(e) => updateConfig(['effects', 'threeDCards', 'maxCards'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.effects?.threeDCards?.depthShadow ?? false}
                      onChange={(e) => updateConfig(['effects', 'threeDCards', 'depthShadow'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Depth-based Shadows</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.effects?.threeDCards?.gyroscopeTilt ?? false}
                      onChange={(e) => updateConfig(['effects', 'threeDCards', 'gyroscopeTilt'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Gyroscope Tilt (capability-gated)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Particles */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Particle Systems</h3>
                <p className="text-sm text-gray-400">Confetti, hearts, stars, and more</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.effects?.particles?.enabled ?? false}
                  onChange={(e) => updateConfig(['effects', 'particles', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.effects?.particles?.enabled && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Particle Count</label>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={localConfig.effects?.particles?.maxCount ?? 50}
                    onChange={(e) => updateConfig(['effects', 'particles', 'maxCount'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                {/* Confetti, hearts, stars configs would go here */}
              </div>
            )}
          </div>

          {/* Glass Morphism */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Glass Morphism</h3>
                <p className="text-sm text-gray-400">Frosted glass effects with blur</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.effects?.glassMorphism?.enabled ?? false}
                  onChange={(e) => updateConfig(['effects', 'glassMorphism', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.effects?.glassMorphism?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Blur Intensity</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={localConfig.effects?.glassMorphism?.blurIntensity ?? 20}
                    onChange={(e) => updateConfig(['effects', 'glassMorphism', 'blurIntensity'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Opacity</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={localConfig.effects?.glassMorphism?.opacity ?? 0.5}
                    onChange={(e) => updateConfig(['effects', 'glassMorphism', 'opacity'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.effects?.glassMorphism?.reflection ?? false}
                      onChange={(e) => updateConfig(['effects', 'glassMorphism', 'reflection'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Animated Reflection</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localConfig.effects?.glassMorphism?.animated ?? false}
                      onChange={(e) => updateConfig(['effects', 'glassMorphism', 'animated'], e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Animated Opacity</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Three.js WebGL Effects */}
          <div className="bg-admin-dark-light rounded-lg p-6 border-2 border-admin-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <CubeIcon className="h-5 w-5 text-admin-primary" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Three.js WebGL Effects</h3>
                <p className="text-sm text-gray-400">Premium WebGL effects: Liquid Morph, Galaxy Particles, Volumetric Portal</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.effects?.threeJsEffects?.enabled ?? false}
                  onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.effects?.threeJsEffects?.enabled && (
              <div className="space-y-4 mt-4">
                {/* Liquid Morph */}
                <div className="bg-admin-dark rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Liquid Morph</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.effects?.threeJsEffects?.liquidMorph?.enabled ?? false}
                        onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'liquidMorph', 'enabled'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-primary"></div>
                    </label>
                  </div>
                  {localConfig.effects?.threeJsEffects?.liquidMorph?.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Intensity</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="3"
                          value={localConfig.effects?.threeJsEffects?.liquidMorph?.intensity ?? 1}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'liquidMorph', 'intensity'], parseFloat(e.target.value) || 1)}
                          className="w-full px-2 py-1 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Speed</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={localConfig.effects?.threeJsEffects?.liquidMorph?.speed ?? 1.5}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'liquidMorph', 'speed'], parseFloat(e.target.value) || 1.5)}
                          className="w-full px-2 py-1 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Color 1</label>
                        <input
                          type="color"
                          value={localConfig.effects?.threeJsEffects?.liquidMorph?.color1 ?? '#ec4899'}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'liquidMorph', 'color1'], e.target.value)}
                          className="w-full h-8 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Color 2</label>
                        <input
                          type="color"
                          value={localConfig.effects?.threeJsEffects?.liquidMorph?.color2 ?? '#8b5cf6'}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'liquidMorph', 'color2'], e.target.value)}
                          className="w-full h-8 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Galaxy Particles */}
                <div className="bg-admin-dark rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Galaxy Particles</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.effects?.threeJsEffects?.galaxyParticles?.enabled ?? false}
                        onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'galaxyParticles', 'enabled'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-primary"></div>
                    </label>
                  </div>
                  {localConfig.effects?.threeJsEffects?.galaxyParticles?.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Base Count</label>
                        <input
                          type="number"
                          min="0"
                          max="100000"
                          step="1000"
                          value={localConfig.effects?.threeJsEffects?.galaxyParticles?.baseCount ?? 50000}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'galaxyParticles', 'baseCount'], parseInt(e.target.value) || 50000)}
                          className="w-full px-2 py-1 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Max Count</label>
                        <input
                          type="number"
                          min="0"
                          max="100000"
                          step="1000"
                          value={localConfig.effects?.threeJsEffects?.galaxyParticles?.maxCount ?? 60000}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'galaxyParticles', 'maxCount'], parseInt(e.target.value) || 60000)}
                          className="w-full px-2 py-1 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localConfig.effects?.threeJsEffects?.galaxyParticles?.autoScale !== false}
                            onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'galaxyParticles', 'autoScale'], e.target.checked)}
                            className="w-4 h-4 text-admin-primary bg-admin-dark border-gray-600 rounded focus:ring-admin-primary"
                          />
                          <span className="text-xs text-gray-300">Auto-scale based on device quality</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Volumetric Portal */}
                <div className="bg-admin-dark rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">Volumetric Portal</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localConfig.effects?.threeJsEffects?.volumetricPortal?.enabled ?? false}
                        onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'volumetricPortal', 'enabled'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-primary"></div>
                    </label>
                  </div>
                  {localConfig.effects?.threeJsEffects?.volumetricPortal?.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localConfig.effects?.threeJsEffects?.volumetricPortal?.active !== false}
                            onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'volumetricPortal', 'active'], e.target.checked)}
                            className="w-4 h-4 text-admin-primary bg-admin-dark border-gray-600 rounded focus:ring-admin-primary"
                          />
                          <span className="text-xs text-gray-300">Active</span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Intensity</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="3"
                          value={localConfig.effects?.threeJsEffects?.volumetricPortal?.intensity ?? 1}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'volumetricPortal', 'intensity'], parseFloat(e.target.value) || 1)}
                          className="w-full px-2 py-1 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                        />
                      </div>
                      <div className="col-span-1"></div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Color 1</label>
                        <input
                          type="color"
                          value={localConfig.effects?.threeJsEffects?.volumetricPortal?.color1 ?? '#f0abfc'}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'volumetricPortal', 'color1'], e.target.value)}
                          className="w-full h-8 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Color 2</label>
                        <input
                          type="color"
                          value={localConfig.effects?.threeJsEffects?.volumetricPortal?.color2 ?? '#c084fc'}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'volumetricPortal', 'color2'], e.target.value)}
                          className="w-full h-8 bg-admin-dark border border-gray-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Global Settings */}
                <div className="bg-admin-dark rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-3">Global Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Safe Mode</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConfig.effects?.threeJsEffects?.global?.safeMode ?? false}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'global', 'safeMode'], e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-primary"></div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Quality Tier</label>
                      <select
                        value={localConfig.effects?.threeJsEffects?.global?.qualityTier || 'auto'}
                        onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'global', 'qualityTier'], e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                      >
                        <option value="auto">Auto</option>
                        <option value="low">Low</option>
                        <option value="mid">Mid</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">DPR Cap</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="3"
                        value={localConfig.effects?.threeJsEffects?.global?.dprCap ?? 2}
                        onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'global', 'dprCap'], parseFloat(e.target.value) || 2)}
                        className="w-full px-2 py-1 text-sm bg-admin-dark border border-gray-600 rounded text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-300">Respect Reduced Motion</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConfig.effects?.threeJsEffects?.global?.respectReducedMotion !== false}
                          onChange={(e) => updateConfig(['effects', 'threeJsEffects', 'global', 'respectReducedMotion'], e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-admin-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Typography Tab */}
      {activeSubTab === 'typography' && (
        <div className="space-y-6">
          {/* Gradient Text */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Animated Gradient Text</h3>
                <p className="text-sm text-gray-400">Gradient text with animated color shifts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.typography?.gradientText?.enabled ?? false}
                  onChange={(e) => updateConfig(['typography', 'gradientText', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.typography?.gradientText?.enabled && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Animation Speed</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="5"
                    value={localConfig.typography?.gradientText?.animationSpeed ?? 1.5}
                    onChange={(e) => updateConfig(['typography', 'gradientText', 'animationSpeed'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Variants</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['primary', 'secondary', 'premium', 'neon', 'rainbow', 'holographic'].map((variant) => (
                      <label key={variant} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localConfig.typography?.gradientText?.variants?.includes(variant as any) ?? false}
                          onChange={(e) => {
                            const variants = localConfig.typography?.gradientText?.variants ?? [];
                            const newVariants = e.target.checked
                              ? [...variants, variant]
                              : variants.filter((v) => v !== variant);
                            updateConfig(['typography', 'gradientText', 'variants'], newVariants);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-300 capitalize">{variant}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Kinetic Typography */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Kinetic Typography</h3>
                <p className="text-sm text-gray-400">Bouncy, playful text animations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.typography?.kinetic?.enabled ?? false}
                  onChange={(e) => updateConfig(['typography', 'kinetic', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.typography?.kinetic?.enabled && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Variants</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['bounce', 'wave', 'pulse', 'slide'].map((variant) => (
                      <label key={variant} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localConfig.typography?.kinetic?.variants?.includes(variant as any) ?? false}
                          onChange={(e) => {
                            const variants = localConfig.typography?.kinetic?.variants ?? [];
                            const newVariants = e.target.checked
                              ? [...variants, variant]
                              : variants.filter((v) => v !== variant);
                            updateConfig(['typography', 'kinetic', 'variants'], newVariants);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-300 capitalize">{variant}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Intensity</label>
                  <select
                    value={localConfig.typography?.kinetic?.intensity || 'medium'}
                    onChange={(e) => updateConfig(['typography', 'kinetic', 'intensity'], e.target.value)}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  >
                    <option value="subtle">Subtle</option>
                    <option value="medium">Medium</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Scroll Reveal */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Scroll Reveal Text</h3>
                <p className="text-sm text-gray-400">Text that animates into view on scroll</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.typography?.scrollReveal?.enabled ?? false}
                  onChange={(e) => updateConfig(['typography', 'scrollReveal', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.typography?.scrollReveal?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Offset</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={localConfig.typography?.scrollReveal?.offset ?? 100}
                    onChange={(e) => updateConfig(['typography', 'scrollReveal', 'offset'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Direction</label>
                  <select
                    value={localConfig.typography?.scrollReveal?.direction || 'up'}
                    onChange={(e) => updateConfig(['typography', 'scrollReveal', 'direction'], e.target.value)}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  >
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Colors Tab */}
      {activeSubTab === 'colors' && (
        <div className="space-y-6">
          {/* Dynamic Colors */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Dynamic Color Adaptation</h3>
                <p className="text-sm text-gray-400">Colors that adapt to time of day and ambient light</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.colors?.dynamicColors?.enabled ?? false}
                  onChange={(e) => updateConfig(['colors', 'dynamicColors', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.colors?.dynamicColors?.enabled && (
              <div className="space-y-2 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.colors?.dynamicColors?.timeOfDayShift ?? false}
                    onChange={(e) => updateConfig(['colors', 'dynamicColors', 'timeOfDayShift'], e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Time of Day Shift</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.colors?.dynamicColors?.ambientLightAdaptation ?? false}
                    onChange={(e) => updateConfig(['colors', 'dynamicColors', 'ambientLightAdaptation'], e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Ambient Light Adaptation (Future)</span>
                </label>
              </div>
            )}
          </div>

          {/* HDR/P3 Support */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">HDR/P3 Color Support</h3>
                <p className="text-sm text-gray-400">Wide color gamut for capable devices</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.colors?.hdr?.enabled ?? false}
                  onChange={(e) => updateConfig(['colors', 'hdr', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.colors?.hdr?.enabled && (
              <div className="space-y-2 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.colors?.hdr?.detectCapability ?? true}
                    onChange={(e) => updateConfig(['colors', 'hdr', 'detectCapability'], e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Auto-detect Capability</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.colors?.hdr?.fallbackToSRGB ?? true}
                    onChange={(e) => updateConfig(['colors', 'hdr', 'fallbackToSRGB'], e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Fallback to sRGB</span>
                </label>
              </div>
            )}
          </div>

          {/* Neon Accents */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Neon Accents</h3>
                <p className="text-sm text-gray-400">Vibrant neon color accents</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.colors?.neonAccents?.enabled ?? false}
                  onChange={(e) => updateConfig(['colors', 'neonAccents', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.colors?.neonAccents?.enabled && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localConfig.colors?.neonAccents?.intensity ?? 0.7}
                    onChange={(e) => updateConfig(['colors', 'neonAccents', 'intensity'], parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">
                    {((localConfig.colors?.neonAccents?.intensity ?? 0.7) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Gradient Meshes */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Gradient Meshes</h3>
                <p className="text-sm text-gray-400">Animated gradient mesh backgrounds</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.colors?.gradientMeshes?.enabled ?? false}
                  onChange={(e) => updateConfig(['colors', 'gradientMeshes', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.colors?.gradientMeshes?.enabled && (
              <div className="space-y-4 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.colors?.gradientMeshes?.animated ?? false}
                    onChange={(e) => updateConfig(['colors', 'gradientMeshes', 'animated'], e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Animated Rotation</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rotation Speed</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={localConfig.colors?.gradientMeshes?.rotationSpeed ?? 2}
                    onChange={(e) => updateConfig(['colors', 'gradientMeshes', 'rotationSpeed'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scroll Tab */}
      {activeSubTab === 'scroll' && (
        <div className="space-y-6">
          {/* Parallax */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Multi-layer Parallax</h3>
                <p className="text-sm text-gray-400">Depth effects based on scroll position</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.scroll?.parallax?.enabled ?? false}
                  onChange={(e) => updateConfig(['scroll', 'parallax', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.scroll?.parallax?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Layers</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={localConfig.scroll?.parallax?.layers ?? 3}
                    onChange={(e) => updateConfig(['scroll', 'parallax', 'layers'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Intensity</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={localConfig.scroll?.parallax?.intensity ?? 1}
                    onChange={(e) => updateConfig(['scroll', 'parallax', 'intensity'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scroll Triggers */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Scroll-triggered Animations</h3>
                <p className="text-sm text-gray-400">Animations that trigger when elements enter viewport</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.scroll?.scrollTriggers?.enabled ?? false}
                  onChange={(e) => updateConfig(['scroll', 'scrollTriggers', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.scroll?.scrollTriggers?.enabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Offset</label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={localConfig.scroll?.scrollTriggers?.offset ?? 100}
                    onChange={(e) => updateConfig(['scroll', 'scrollTriggers', 'offset'], parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={localConfig.scroll?.scrollTriggers?.threshold ?? 0.3}
                    onChange={(e) => updateConfig(['scroll', 'scrollTriggers', 'threshold'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Momentum */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Momentum-based Effects</h3>
                <p className="text-sm text-gray-400">Physics-based scroll momentum and bounce</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.scroll?.momentum?.enabled ?? false}
                  onChange={(e) => updateConfig(['scroll', 'momentum', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.scroll?.momentum?.enabled && (
              <div className="space-y-4 mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.scroll?.momentum?.bounce ?? false}
                    onChange={(e) => updateConfig(['scroll', 'momentum', 'bounce'], e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Bounce Effect</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Friction</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={localConfig.scroll?.momentum?.friction ?? 0.85}
                    onChange={(e) => updateConfig(['scroll', 'momentum', 'friction'], parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-admin-dark border border-gray-600 rounded text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Elements */}
          <div className="bg-admin-dark-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Sticky Elements</h3>
                <p className="text-sm text-gray-400">Elements that stick to viewport on scroll</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.scroll?.sticky?.enabled ?? false}
                  onChange={(e) => updateConfig(['scroll', 'sticky', 'enabled'], e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-admin-primary"></div>
              </label>
            </div>
            {localConfig.scroll?.sticky?.enabled && (
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.scroll?.sticky?.transformOnStick ?? false}
                    onChange={(e) => updateConfig(['scroll', 'sticky', 'transformOnStick'], e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Transform on Stick</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

