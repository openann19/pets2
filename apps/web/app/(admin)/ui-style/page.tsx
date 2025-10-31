/**
 * Admin UI Style Configuration Page
 * Configure premium UI styling across all screens
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EnhancedCard, EnhancedButton, LoadingSkeleton } from '@/components/admin/UIEnhancements';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  PaintBrushIcon,
  CpuChipIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface PremiumStyleConfig {
  animations: {
    enabled: boolean;
    reducedMotion: boolean;
    springConfig: {
      stiffness: number;
      damping: number;
      mass: number;
    };
    entranceDelay: number;
    staggerDelay: number;
  };
  pageTransitions: {
    enabled: boolean;
    defaultPreset: 'fade' | 'scale' | 'slideRight' | 'slideLeft' | 'slideUp' | 'zoom' | 'blurFade';
    routeMappings: Record<string, 'fade' | 'scale' | 'slideRight' | 'slideLeft' | 'slideUp' | 'zoom' | 'blurFade'>;
    duration: number;
    easing: [number, number, number, number];
  };
  card: {
    variant: 'elevated' | 'glass' | 'neon' | 'minimal' | 'holographic';
    enableGlow: boolean;
    enableShimmer: boolean;
    enableTilt: boolean;
    enableMagnetic: boolean;
    blurIntensity: number;
    shadowIntensity: number;
  };
  button: {
    variant: 'primary' | 'secondary' | 'premium' | 'glass' | 'neon';
    enableRipple: boolean;
    enableMagnetic: boolean;
    enableGlow: boolean;
    hapticFeedback: boolean;
    soundEffects: boolean;
  };
  typography: {
    enableGradientText: boolean;
    enableKineticTypography: boolean;
    enableScrollReveal: boolean;
    gradientSpeed: number;
    kineticVariant: 'bounce' | 'wave' | 'pulse' | 'slide';
  };
  effects: {
    enableParallax: boolean;
    enableParticles: boolean;
    enableConfetti: boolean;
    parallaxLayers: number;
    particleCount: number;
  };
  colors: {
    enableNeonAccents: boolean;
    neonIntensity: number;
    enableHDR: boolean;
    enableDynamicColors: boolean;
    enableGradientMeshes: boolean;
  };
  scroll: {
    enableParallax: boolean;
    enableSticky: boolean;
    enableMomentum: boolean;
    parallaxIntensity: number;
    stickyTransform: boolean;
  };
  performance: {
    enableGPUAcceleration: boolean;
    enableLazyLoading: boolean;
    maxFPS: number;
    qualityTier: 'auto' | 'low' | 'medium' | 'high' | 'ultra';
  };
}

const fetchConfig = async (): Promise<PremiumStyleConfig> => {
  const res = await fetch('/api/admin/ui-style/config');
  if (!res.ok) throw new Error('Failed to fetch config');
  const data = await res.json();
  return data.data;
};

const updateConfig = async (config: Partial<PremiumStyleConfig>): Promise<PremiumStyleConfig> => {
  const res = await fetch('/api/admin/ui-style/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to update config');
  const data = await res.json();
  return data.data;
};

const resetConfig = async (): Promise<void> => {
  const res = await fetch('/api/admin/ui-style/config/reset', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset config');
};

export default function UIStyleConfigPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<PremiumStyleConfig | null>(null);

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['ui-style-config'],
    queryFn: fetchConfig,
  });

  const updateMutation = useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-style-config'] });
      setHasChanges(false);
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-style-config'] });
      setHasChanges(false);
    },
  });

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton height={400} />
      </div>
    );
  }

  if (error || !localConfig) {
    return (
      <div className="p-6">
        <EnhancedCard variant="error">
          <p className="text-red-600">Failed to load UI style configuration</p>
        </EnhancedCard>
      </div>
    );
  }

  const updateLocalConfig = (path: string, value: unknown) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      const keys = path.split('.');
      const newConfig = { ...prev };
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newConfig;
    });
  };

  const handleSave = () => {
    if (localConfig) {
      updateMutation.mutate(localConfig);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all UI style settings to defaults?')) {
      resetMutation.mutate();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SparklesIcon className="w-8 h-8 text-pink-500" />
            User-Facing UI Style Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Configure premium styling, animations, and visual effects for the user-facing mobile and web applications.
            <br />
            <span className="text-sm text-gray-500">
              Note: These settings apply to user apps, not the admin panel.
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <EnhancedButton
              variant="secondary"
              onClick={handleReset}
              disabled={resetMutation.isPending}
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Reset
            </EnhancedButton>
          )}
          <EnhancedButton
            variant="primary"
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              'Saving...'
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </EnhancedButton>
        </div>
      </div>

      {/* Page Transitions Section */}
      <EnhancedCard>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <SparklesIcon className="w-6 h-6" />
          Page Transitions
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span>Enable Page Transitions</span>
            <input
              type="checkbox"
              checked={localConfig.pageTransitions?.enabled ?? true}
              onChange={(e) =>
                updateLocalConfig('pageTransitions.enabled', e.target.checked)
              }
              className="rounded"
            />
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Default Transition Preset</label>
            <select
              value={localConfig.pageTransitions?.defaultPreset || 'fade'}
              onChange={(e) =>
                updateLocalConfig('pageTransitions.defaultPreset', e.target.value as PremiumStyleConfig['pageTransitions']['defaultPreset'])
              }
              className="w-full rounded border p-2"
            >
              <option value="fade">Fade</option>
              <option value="scale">Scale</option>
              <option value="slideRight">Slide Right</option>
              <option value="slideLeft">Slide Left</option>
              <option value="slideUp">Slide Up</option>
              <option value="zoom">Zoom</option>
              <option value="blurFade">Blur Fade</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Transition Duration (seconds)</label>
            <input
              type="number"
              value={localConfig.pageTransitions?.duration ?? 0.6}
              onChange={(e) =>
                updateLocalConfig('pageTransitions.duration', Number(e.target.value))
              }
              className="w-full rounded border p-2"
              min="0.1"
              max="2"
              step="0.1"
            />
          </div>
        </div>
      </EnhancedCard>

      {/* Animations Section */}
      <EnhancedCard>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <SparklesIcon className="w-6 h-6" />
          Animations
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span>Enable Animations</span>
            <input
              type="checkbox"
              checked={localConfig.animations.enabled}
              onChange={(e) =>
                updateLocalConfig('animations.enabled', e.target.checked)
              }
              className="rounded"
            />
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Spring Stiffness</label>
              <input
                type="number"
                value={localConfig.animations.springConfig.stiffness}
                onChange={(e) =>
                  updateLocalConfig('animations.springConfig.stiffness', Number(e.target.value))
                }
                className="w-full rounded border p-2"
                min="0"
                max="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Damping</label>
              <input
                type="number"
                value={localConfig.animations.springConfig.damping}
                onChange={(e) =>
                  updateLocalConfig('animations.springConfig.damping', Number(e.target.value))
                }
                className="w-full rounded border p-2"
                min="0"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mass</label>
              <input
                type="number"
                value={localConfig.animations.springConfig.mass}
                onChange={(e) =>
                  updateLocalConfig('animations.springConfig.mass', Number(e.target.value))
                }
                className="w-full rounded border p-2"
                min="0.1"
                max="10"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Card Variants Section */}
      <EnhancedCard>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <PaintBrushIcon className="w-6 h-6" />
          Card Variants
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Card Variant</label>
            <select
              value={localConfig.card.variant}
              onChange={(e) =>
                updateLocalConfig('card.variant', e.target.value as PremiumStyleConfig['card']['variant'])
              }
              className="w-full rounded border p-2"
            >
              <option value="elevated">Elevated</option>
              <option value="glass">Glass</option>
              <option value="neon">Neon</option>
              <option value="minimal">Minimal</option>
              <option value="holographic">Holographic</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between">
              <span>Enable Glow</span>
              <input
                type="checkbox"
                checked={localConfig.card.enableGlow}
                onChange={(e) => updateLocalConfig('card.enableGlow', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Enable Shimmer</span>
              <input
                type="checkbox"
                checked={localConfig.card.enableShimmer}
                onChange={(e) => updateLocalConfig('card.enableShimmer', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Enable Tilt</span>
              <input
                type="checkbox"
                checked={localConfig.card.enableTilt}
                onChange={(e) => updateLocalConfig('card.enableTilt', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Enable Magnetic</span>
              <input
                type="checkbox"
                checked={localConfig.card.enableMagnetic}
                onChange={(e) => updateLocalConfig('card.enableMagnetic', e.target.checked)}
                className="rounded"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Blur Intensity</label>
              <input
                type="range"
                value={localConfig.card.blurIntensity}
                onChange={(e) => updateLocalConfig('card.blurIntensity', Number(e.target.value))}
                className="w-full"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-600">{localConfig.card.blurIntensity}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shadow Intensity</label>
              <input
                type="range"
                value={localConfig.card.shadowIntensity * 100}
                onChange={(e) =>
                  updateLocalConfig('card.shadowIntensity', Number(e.target.value) / 100)
                }
                className="w-full"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-600">
                {Math.round(localConfig.card.shadowIntensity * 100)}%
              </span>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Button Variants Section */}
      <EnhancedCard>
        <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Variant</label>
            <select
              value={localConfig.button.variant}
              onChange={(e) =>
                updateLocalConfig('button.variant', e.target.value as PremiumStyleConfig['button']['variant'])
              }
              className="w-full rounded border p-2"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="premium">Premium</option>
              <option value="glass">Glass</option>
              <option value="neon">Neon</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between">
              <span>Enable Ripple</span>
              <input
                type="checkbox"
                checked={localConfig.button.enableRipple}
                onChange={(e) => updateLocalConfig('button.enableRipple', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Enable Magnetic</span>
              <input
                type="checkbox"
                checked={localConfig.button.enableMagnetic}
                onChange={(e) => updateLocalConfig('button.enableMagnetic', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Enable Glow</span>
              <input
                type="checkbox"
                checked={localConfig.button.enableGlow}
                onChange={(e) => updateLocalConfig('button.enableGlow', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Haptic Feedback</span>
              <input
                type="checkbox"
                checked={localConfig.button.hapticFeedback}
                onChange={(e) => updateLocalConfig('button.hapticFeedback', e.target.checked)}
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Sound Effects</span>
              <input
                type="checkbox"
                checked={localConfig.button.soundEffects}
                onChange={(e) => updateLocalConfig('button.soundEffects', e.target.checked)}
                className="rounded"
              />
            </label>
          </div>
        </div>
      </EnhancedCard>

      {/* Performance Section */}
      <EnhancedCard>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CpuChipIcon className="w-6 h-6" />
          Performance
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center justify-between">
              <span>GPU Acceleration</span>
              <input
                type="checkbox"
                checked={localConfig.performance.enableGPUAcceleration}
                onChange={(e) =>
                  updateLocalConfig('performance.enableGPUAcceleration', e.target.checked)
                }
                className="rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Lazy Loading</span>
              <input
                type="checkbox"
                checked={localConfig.performance.enableLazyLoading}
                onChange={(e) =>
                  updateLocalConfig('performance.enableLazyLoading', e.target.checked)
                }
                className="rounded"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quality Tier</label>
            <select
              value={localConfig.performance.qualityTier}
              onChange={(e) =>
                updateLocalConfig('performance.qualityTier', e.target.value as PremiumStyleConfig['performance']['qualityTier'])
              }
              className="w-full rounded border p-2"
            >
              <option value="auto">Auto</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max FPS</label>
            <input
              type="number"
              value={localConfig.performance.maxFPS}
              onChange={(e) => updateLocalConfig('performance.maxFPS', Number(e.target.value))}
              className="w-full rounded border p-2"
              min="30"
              max="120"
            />
          </div>
        </div>
      </EnhancedCard>

      {updateMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5" />
          Configuration saved successfully!
        </div>
      )}
    </div>
  );
}

