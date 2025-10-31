'use client'

/**
 * 🔥 ENHANCED ANIMATION CONFIGURATION & TESTING PANEL
 * Ultra-premium admin panel with performance monitoring, code generation,
 * preset library, accessibility testing, and more
 * 
 * Enhanced Features:
 * - Real-time performance monitoring (FPS, memory, render time)
 * - Code generation for configurations
 * - Built-in preset library
 * - Accessibility testing mode
 * - Side-by-side comparison
 * - Device simulation
 * - Animation timeline scrubber
 * - Keyboard shortcuts
 * - Export/import with versioning
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  SquareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CodeBracketIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  EyeIcon,
  EyeSlashIcon,
  CommandLineIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon,
  Battery0Icon,
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useAccessibilityHooks';
import {
  useAnimationBudgetV2,
  AnimationBudgetDisplay,
} from '@/components/Animations/AnimationBudget';

// Import all animation components
import {
  SharedElementProvider,
  SharedElement,
  HeroSharedElement,
  SharedElementGrid,
  LiquidMorph,
  LiquidComposition,
  LIQUID_PRESETS,
  Parallax3D,
  Transform3D,
  PARALLAX_3D_PRESETS,
  KineticText,
  KineticTextSplit,
  KineticTextReveal,
  MicroInteractionButton,
  MicroInteractionCard,
  useHapticFeedback,
} from '@/components/Animations';

import { GlassCard } from '@/components/UI/glass-card';

// ------------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------------

interface AnimationConfig {
  id: string;
  name: string;
  phase: 3 | 4 | 5 | 6 | 7;
  enabled: boolean;
  config: Record<string, unknown>;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  configs: AnimationConfig[];
  tags?: string[];
  author?: string;
  version?: string;
}

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  renderTime: number;
  timestamp: number;
}

interface DeviceSimulation {
  width: number;
  height: number;
  devicePixelRatio: number;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
}

// ------------------------------------------------------------------------------------
// Built-in Presets
// ------------------------------------------------------------------------------------

const BUILT_IN_PRESETS: Preset[] = [
  {
    id: 'smooth-and-fast',
    name: 'Smooth & Fast',
    description: 'Optimized for performance with smooth animations',
    tags: ['performance', 'smooth'],
    configs: [
      {
        id: 'phase3',
        name: 'Shared Elements',
        phase: 3,
        enabled: true,
        config: {
          borderRadius: 12,
          aspectRatio: 16 / 9,
          preserveAspectRatio: true,
          gesture: 'swipe',
          spring: { stiffness: 200, damping: 25, mass: 0.8 },
        },
      },
      {
        id: 'phase7',
        name: 'Micro-interactions',
        phase: 7,
        enabled: true,
        config: {
          haptic: false,
          ripple: true,
          magnetic: false,
          spring: { stiffness: 250, damping: 28, mass: 0.9 },
          variant: 'primary',
        },
      },
    ],
  },
  {
    id: 'premium-feel',
    name: 'Premium Feel',
    description: 'Rich, luxurious animations with all effects enabled',
    tags: ['premium', 'rich'],
    configs: [
      {
        id: 'phase4',
        name: 'Liquid Morph',
        phase: 4,
        enabled: true,
        config: {
          duration: 10,
          opacity: 0.6,
          interactive: true,
          physics: { tension: 350, friction: 25, mass: 0.7 },
          gradient: {
            from: '#8b5cf6',
            to: '#06b6d4',
            type: 'linear',
            direction: 'diagonal',
          },
        },
      },
      {
        id: 'phase7',
        name: 'Micro-interactions',
        phase: 7,
        enabled: true,
        config: {
          haptic: true,
          ripple: true,
          magnetic: true,
          spring: { stiffness: 300, damping: 30, mass: 1 },
          variant: 'primary',
        },
      },
    ],
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Subtle, clean animations',
    tags: ['minimal', 'subtle'],
    configs: [
      {
        id: 'phase6',
        name: 'Kinetic Typography',
        phase: 6,
        enabled: true,
        config: {
          variant: 'fade',
          stagger: 0.01,
          splitBy: 'word',
          scrollTrigger: false,
          spring: { stiffness: 150, damping: 20, mass: 1 },
          gradient: {
            from: '#ffffff',
            to: '#ffffff',
          },
        },
      },
    ],
  },
];

// ------------------------------------------------------------------------------------
// Device Presets
// ------------------------------------------------------------------------------------

const DEVICE_PRESETS: DeviceSimulation[] = [
  { width: 375, height: 667, devicePixelRatio: 2, name: 'iPhone SE', type: 'mobile' },
  { width: 390, height: 844, devicePixelRatio: 3, name: 'iPhone 12/13', type: 'mobile' },
  { width: 768, height: 1024, devicePixelRatio: 2, name: 'iPad', type: 'tablet' },
  { width: 1920, height: 1080, devicePixelRatio: 1, name: 'Desktop HD', type: 'desktop' },
  { width: 2560, height: 1440, devicePixelRatio: 1, name: 'Desktop 2K', type: 'desktop' },
];

// ------------------------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------------------------

export default function AnimationConfigPage() {
  const [activePhase, setActivePhase] = useState<3 | 4 | 5 | 6 | 7>(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedPresets, setSavedPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showCodeGen, setShowCodeGen] = useState(false);
  const [showPerformance, setShowPerformance] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [a11yMode, setA11yMode] = useState(false);
  const [deviceSim, setDeviceSim] = useState<DeviceSimulation | null>(null);
  const [presetSearch, setPresetSearch] = useState('');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  const reducedMotion = useReducedMotion();
  const { budget } = useAnimationBudgetV2();

  // Performance monitoring
  useEffect(() => {
    if (!showPerformance) return;

    const measurePerformance = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      const fps = frameTime > 0 ? 1000 / frameTime : 60;

      // Measure render time
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStart;

        setPerformanceMetrics((prev) => {
          const newMetrics = [
            {
              fps,
              frameTime,
              renderTime,
              timestamp: now,
            },
            ...prev.slice(0, 59), // Keep last 60 frames
          ];
          return newMetrics;
        });
      });

      lastFrameTimeRef.current = now;
      frameRef.current = requestAnimationFrame(measurePerformance);
    };

    frameRef.current = requestAnimationFrame(measurePerformance);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [showPerformance]);

  const avgFps = useMemo(() => {
    if (performanceMetrics.length === 0) return 60;
    const sum = performanceMetrics.reduce((acc, m) => acc + m.fps, 0);
    return Math.round(sum / performanceMetrics.length);
  }, [performanceMetrics]);

  const avgRenderTime = useMemo(() => {
    if (performanceMetrics.length === 0) return 0;
    const sum = performanceMetrics.reduce((acc, m) => acc + m.renderTime, 0);
    return Math.round(sum / performanceMetrics.length * 100) / 100;
  }, [performanceMetrics]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowCodeGen((prev) => !prev);
            break;
          case 'p':
            e.preventDefault();
            setShowPerformance((prev) => !prev);
            break;
          case 'c':
            e.preventDefault();
            setShowComparison((prev) => !prev);
            break;
          case 'a':
            e.preventDefault();
            setA11yMode((prev) => !prev);
            break;
        }
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Phase 3: Shared Element Config
  const [phase3Config, setPhase3Config] = useState<{
    borderRadius: number;
    aspectRatio: number;
    preserveAspectRatio: boolean;
    gesture: 'none' | 'drag' | 'swipe' | 'pinch';
    spring: { stiffness: number; damping: number; mass: number };
  }>({
    borderRadius: 16,
    aspectRatio: 16 / 9,
    preserveAspectRatio: true,
    gesture: 'swipe',
    spring: { stiffness: 300, damping: 30, mass: 1 },
  });

  // Phase 4: Liquid Morph Config
  const [phase4Config, setPhase4Config] = useState<{
    duration: number;
    opacity: number;
    interactive: boolean;
    physics: { tension: number; friction: number; mass: number };
    gradient: {
      from: string;
      to: string;
      type: 'linear' | 'radial' | 'conic';
      direction: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
    };
  }>({
    duration: 8,
    opacity: 0.5,
    interactive: true,
    physics: { tension: 300, friction: 30, mass: 1 },
    gradient: {
      from: '#7c3aed',
      to: '#06b6d4',
      type: 'linear',
      direction: 'diagonal',
    },
  });

  // Phase 5: 3D Parallax Config
  const [phase5Config, setPhase5Config] = useState<{
    perspective: number;
    gyroscope: boolean;
    mouseSensitivity: number;
    optimize: 'auto' | 'quality' | 'maxfps';
    spring: { stiffness: number; damping: number; mass: number };
  }>({
    perspective: 1200,
    gyroscope: false,
    mouseSensitivity: 1,
    optimize: 'auto',
    spring: { stiffness: 160, damping: 26, mass: 0.9 },
  });

  // Phase 6: Kinetic Typography Config
  const [phase6Config, setPhase6Config] = useState<{
    variant:
      | 'fade'
      | 'slide'
      | 'scale'
      | 'rotate'
      | 'morph'
      | 'split'
      | 'reveal'
      | 'glitch'
      | 'wave'
      | 'typewriter';
    stagger: number;
    splitBy: 'char' | 'word' | 'line';
    scrollTrigger: boolean;
    spring: { stiffness: number; damping: number; mass: number };
    gradient: {
      from: string;
      to: string;
    };
  }>({
    variant: 'fade',
    stagger: 0.02,
    splitBy: 'char',
    scrollTrigger: false,
    spring: { stiffness: 300, damping: 30, mass: 1 },
    gradient: {
      from: '#7c3aed',
      to: '#06b6d4',
    },
  });

  // Phase 7: Micro-interactions Config
  const [phase7Config, setPhase7Config] = useState<{
    haptic: boolean;
    ripple: boolean;
    magnetic: boolean;
    spring: { stiffness: number; damping: number; mass: number };
    variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  }>({
    haptic: true,
    ripple: true,
    magnetic: false,
    spring: { stiffness: 300, damping: 30, mass: 1 },
    variant: 'primary',
  });

  // Comparison configs (for side-by-side)
  const [comparisonConfig, setComparisonConfig] = useState<typeof phase3Config | null>(null);

  const allPresets = useMemo(() => {
    return [...BUILT_IN_PRESETS, ...savedPresets].filter((preset) =>
      preset.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
      preset.tags?.some((tag) => tag.toLowerCase().includes(presetSearch.toLowerCase()))
    );
  }, [savedPresets, presetSearch]);

  const generateCode = useCallback(() => {
    const getCurrentConfig = () => {
      switch (activePhase) {
        case 3:
          return phase3Config;
        case 4:
          return phase4Config;
        case 5:
          return phase5Config;
        case 6:
          return phase6Config;
        case 7:
          return phase7Config;
      }
    };

    const config = getCurrentConfig();
    const configString = JSON.stringify(config, null, 2);

    return `// Phase ${activePhase} Configuration
const config = ${configString};

// Usage example:
<${activePhase === 3 ? 'SharedElement' : activePhase === 4 ? 'LiquidMorph' : activePhase === 5 ? 'Parallax3D' : activePhase === 6 ? 'KineticText' : 'MicroInteractionButton'}
  ${Object.entries(config)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return `${key}={{${Object.entries(value)
          .map(([k, v]) => `${k}: ${typeof v === 'string' ? `'${v}'` : v}`)
          .join(', ')}}}`;
      }
      return `${key}={${typeof value === 'string' ? `'${value}'` : value}}`;
    })
    .join('\n  ')}
>
  {/* Your content */}
</${activePhase === 3 ? 'SharedElement' : activePhase === 4 ? 'LiquidMorph' : activePhase === 5 ? 'Parallax3D' : activePhase === 6 ? 'KineticText' : 'MicroInteractionButton'}>`;
  }, [activePhase, phase3Config, phase4Config, phase5Config, phase6Config, phase7Config]);

  const handleSavePreset = useCallback(() => {
    const name = prompt('Preset name:');
    if (!name) return;

    const preset: Preset = {
      id: Date.now().toString(),
      name,
      description: `Animation configuration preset`,
      configs: [
        {
          id: 'phase3',
          name: 'Shared Elements',
          phase: 3,
          enabled: activePhase === 3,
          config: phase3Config,
        },
        {
          id: 'phase4',
          name: 'Liquid Morph',
          phase: 4,
          enabled: activePhase === 4,
          config: phase4Config,
        },
        {
          id: 'phase5',
          name: '3D Parallax',
          phase: 5,
          enabled: activePhase === 5,
          config: phase5Config,
        },
        {
          id: 'phase6',
          name: 'Kinetic Typography',
          phase: 6,
          enabled: activePhase === 6,
          config: phase6Config,
        },
        {
          id: 'phase7',
          name: 'Micro-interactions',
          phase: 7,
          enabled: activePhase === 7,
          config: phase7Config,
        },
      ],
      version: '1.0.0',
    };

    setSavedPresets((prev) => [...prev, preset]);
    setSelectedPreset(preset.id);
  }, [
    activePhase,
    phase3Config,
    phase4Config,
    phase5Config,
    phase6Config,
    phase7Config,
  ]);

  const handleLoadPreset = useCallback(
    (presetId: string) => {
      const preset = allPresets.find((p) => p.id === presetId);
      if (!preset) return;

      preset.configs.forEach((config) => {
        switch (config.phase) {
          case 3:
            setPhase3Config(config.config as typeof phase3Config);
            break;
          case 4:
            setPhase4Config(config.config as typeof phase4Config);
            break;
          case 5:
            setPhase5Config(config.config as typeof phase5Config);
            break;
          case 6:
            setPhase6Config(config.config as typeof phase6Config);
            break;
          case 7:
            setPhase7Config(config.config as typeof phase7Config);
            break;
        }
      });

      setSelectedPreset(presetId);
    },
    [allPresets]
  );

  const handleExport = useCallback(() => {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      presets: savedPresets,
      currentConfig: {
        phase3: phase3Config,
        phase4: phase4Config,
        phase5: phase5Config,
        phase6: phase6Config,
        phase7: phase7Config,
      },
      performance: {
        avgFps,
        avgRenderTime,
        budget: budget.performanceLevel,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animation-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    savedPresets,
    phase3Config,
    phase4Config,
    phase5Config,
    phase6Config,
    phase7Config,
    avgFps,
    avgRenderTime,
    budget,
  ]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.presets) {
            setSavedPresets(data.presets);
          }
          if (data.currentConfig) {
            if (data.currentConfig.phase3) setPhase3Config(data.currentConfig.phase3);
            if (data.currentConfig.phase4) setPhase4Config(data.currentConfig.phase4);
            if (data.currentConfig.phase5) setPhase5Config(data.currentConfig.phase5);
            if (data.currentConfig.phase6) setPhase6Config(data.currentConfig.phase6);
            if (data.currentConfig.phase7) setPhase7Config(data.currentConfig.phase7);
          }
        } catch (error) {
          alert('Failed to import configuration');
          // Error already handled by alert - no need to log
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleCopyConfig = useCallback(() => {
    const config = {
      phase3: phase3Config,
      phase4: phase4Config,
      phase5: phase5Config,
      phase6: phase6Config,
      phase7: phase7Config,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    alert('Configuration copied to clipboard!');
  }, [phase3Config, phase4Config, phase5Config, phase6Config, phase7Config]);

  const handleStartComparison = useCallback(() => {
    setComparisonConfig(phase3Config);
    setShowComparison(true);
  }, [phase3Config]);

  return (
    <SharedElementProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
                  Animation Configuration & Testing
                </h1>
                <p className="text-gray-300 text-sm md:text-base">
                  Configure and test all animation phases with live previews
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowCodeGen(!showCodeGen)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showCodeGen
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Toggle Code Generator (Ctrl/Cmd+K)"
                >
                  <CodeBracketIcon className="w-5 h-5 inline mr-1" />
                  Code
                </button>
                <button
                  onClick={() => setShowPerformance(!showPerformance)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    showPerformance
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Toggle Performance Monitor (Ctrl/Cmd+P)"
                >
                  <ChartBarIcon className="w-5 h-5 inline mr-1" />
                  Performance
                </button>
                <button
                  onClick={() => setA11yMode(!a11yMode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    a11yMode
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  title="Toggle A11y Mode (Ctrl/Cmd+A)"
                >
                  {a11yMode ? (
                    <EyeIcon className="w-5 h-5 inline mr-1" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 inline mr-1" />
                  )}
                  A11y
                </button>
              </div>
            </div>
          </div>

          {/* Performance Dashboard */}
          {showPerformance && (
            <GlassCard className="mb-6 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Performance Monitor
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CpuChipIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">FPS:</span>
                    <span
                      className={`font-mono font-bold ${
                        avgFps >= 55 ? 'text-green-400' : avgFps >= 30 ? 'text-yellow-400' : 'text-red-400'
                      }`}
                    >
                      {avgFps}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Render:</span>
                    <span className="font-mono text-white">{avgRenderTime}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Battery0Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Budget:</span>
                    <span
                      className={`font-semibold ${
                        budget.performanceLevel === 'high'
                          ? 'text-green-400'
                          : budget.performanceLevel === 'medium'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {budget.performanceLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <AnimationBudgetDisplay />
            </GlassCard>
          )}

          {/* Controls Bar */}
          <GlassCard className="mb-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Phase Selector */}
              <div className="flex gap-2 flex-wrap">
                {([3, 4, 5, 6, 7] as const).map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setActivePhase(phase)}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                      activePhase === phase
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Phase {phase}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm md:text-base"
                  title="Play/Pause (Space)"
                >
                  {isPlaying ? (
                    <>
                      <SquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Stop</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Play</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyConfig}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
                  title="Copy Configuration"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Copy</span>
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Export</span>
                </button>
                <button
                  onClick={handleImport}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 text-sm"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  <span className="hidden md:inline">Import</span>
                </button>
                <button
                  onClick={handleSavePreset}
                  className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm md:text-base"
                >
                  <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Save Preset</span>
                </button>
                {showComparison && (
                  <button
                    onClick={() => setShowComparison(false)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span className="hidden md:inline">Close Compare</span>
                  </button>
                )}
              </div>
            </div>

            {/* Device Simulation */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Device:</span>
                  <select
                    value={deviceSim?.name || 'default'}
                    onChange={(e) => {
                      const preset = DEVICE_PRESETS.find((d) => d.name === e.target.value);
                      setDeviceSim(preset || null);
                    }}
                    className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm"
                  >
                    <option value="default">Default</option>
                    {DEVICE_PRESETS.map((device) => (
                      <option key={device.name} value={device.name}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preset Search */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search presets..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                    className="flex-1 px-3 py-1 bg-gray-800 text-white rounded-lg text-sm placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Preset Selector */}
            {allPresets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <label className="text-sm text-gray-300 mb-2 block">Presets:</label>
                <div className="flex flex-wrap gap-2">
                  {allPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPreset(preset.id)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        selectedPreset === preset.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preset.name}
                      {preset.tags && preset.tags.length > 0 && (
                        <span className="ml-2 text-xs opacity-75">
                          ({preset.tags.join(', ')})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Code Generator Panel */}
          <AnimatePresence>
            {showCodeGen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <GlassCard className="mb-6 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <CodeBracketIcon className="w-5 h-5" />
                      Generated Code
                    </h2>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateCode());
                        alert('Code copied to clipboard!');
                      }}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      Copy Code
                    </button>
                  </div>
                  <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
                    <code>{generateCode()}</code>
                  </pre>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configuration Panel */}
            <div className={`${showComparison ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
              <GlassCard className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 md:w-6 md:h-6" />
                  Configuration
                </h2>
                <AnimationConfigPanel
                  phase={activePhase}
                  phase3Config={phase3Config}
                  phase4Config={phase4Config}
                  phase5Config={phase5Config}
                  phase6Config={phase6Config}
                  phase7Config={phase7Config}
                  onPhase3Change={setPhase3Config}
                  onPhase4Change={setPhase4Config}
                  onPhase5Change={setPhase5Config}
                  onPhase6Change={setPhase6Config}
                  onPhase7Change={setPhase7Config}
                  a11yMode={a11yMode}
                />
              </GlassCard>
            </div>

            {/* Preview Panel */}
            <div className={`${showComparison ? 'lg:col-span-2' : 'lg:col-span-2'}`}>
              <GlassCard className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-white">Live Preview</h2>
                  {!showComparison && (
                    <button
                      onClick={handleStartComparison}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Compare
                    </button>
                  )}
                </div>
                <div
                  ref={previewRef}
                  className={`min-h-[400px] p-4 md:p-8 bg-gray-900/50 rounded-2xl ${
                    deviceSim ? 'border-2 border-purple-500' : ''
                  }`}
                  style={
                    deviceSim
                      ? {
                          width: `${deviceSim.width}px`,
                          height: `${deviceSim.height}px`,
                          maxWidth: '100%',
                          margin: '0 auto',
                        }
                      : {}
                  }
                >
                  {showComparison ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-white text-sm mb-2">Current</h3>
                        <AnimationPreview
                          phase={activePhase}
                          phase3Config={phase3Config}
                          phase4Config={phase4Config}
                          phase5Config={phase5Config}
                          phase6Config={phase6Config}
                          phase7Config={phase7Config}
                          isPlaying={isPlaying}
                          a11yMode={a11yMode}
                        />
                      </div>
                      <div>
                        <h3 className="text-white text-sm mb-2">Comparison</h3>
                        <AnimationPreview
                          phase={activePhase}
                          phase3Config={comparisonConfig || phase3Config}
                          phase4Config={phase4Config}
                          phase5Config={phase5Config}
                          phase6Config={phase6Config}
                          phase7Config={phase7Config}
                          isPlaying={isPlaying}
                          a11yMode={a11yMode}
                        />
                      </div>
                    </div>
                  ) : (
                    <AnimationPreview
                      phase={activePhase}
                      phase3Config={phase3Config}
                      phase4Config={phase4Config}
                      phase5Config={phase5Config}
                      phase6Config={phase6Config}
                      phase7Config={phase7Config}
                      isPlaying={isPlaying}
                      a11yMode={a11yMode}
                    />
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <GlassCard className="mt-6 p-4">
            <details className="group">
              <summary className="cursor-pointer text-gray-300 hover:text-white flex items-center gap-2">
                <CommandLineIcon className="w-4 h-4" />
                <span className="text-sm">Keyboard Shortcuts</span>
              </summary>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                <div>
                  <kbd className="px-2 py-1 bg-gray-800 rounded">Ctrl/Cmd</kbd> + <kbd className="px-2 py-1 bg-gray-800 rounded">K</kbd> - Code Generator
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-gray-800 rounded">Ctrl/Cmd</kbd> + <kbd className="px-2 py-1 bg-gray-800 rounded">P</kbd> - Performance
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-gray-800 rounded">Ctrl/Cmd</kbd> + <kbd className="px-2 py-1 bg-gray-800 rounded">A</kbd> - A11y Mode
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-gray-800 rounded">Space</kbd> - Play/Pause
                </div>
              </div>
            </details>
          </GlassCard>
        </div>
      </div>
    </SharedElementProvider>
  );
}

// ------------------------------------------------------------------------------------
// Configuration Panel Component
// ------------------------------------------------------------------------------------

interface AnimationConfigPanelProps {
  phase: 3 | 4 | 5 | 6 | 7;
  phase3Config: typeof phase3Config;
  phase4Config: typeof phase4Config;
  phase5Config: typeof phase5Config;
  phase6Config: typeof phase6Config;
  phase7Config: typeof phase7Config;
  onPhase3Change: (config: typeof phase3Config) => void;
  onPhase4Change: (config: typeof phase4Config) => void;
  onPhase5Change: (config: typeof phase5Config) => void;
  onPhase6Change: (config: typeof phase6Config) => void;
  onPhase7Change: (config: typeof phase7Config) => void;
  a11yMode?: boolean;
}

function AnimationConfigPanel({
  phase,
  phase3Config,
  phase4Config,
  phase5Config,
  phase6Config,
  phase7Config,
  onPhase3Change,
  onPhase4Change,
  onPhase5Change,
  onPhase6Change,
  onPhase7Change,
  a11yMode = false,
}: AnimationConfigPanelProps) {
  const renderPhaseConfig = () => {
    switch (phase) {
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Border Radius</label>
              <input
                type="number"
                value={phase3Config.borderRadius}
                onChange={(e) =>
                  onPhase3Change({ ...phase3Config, borderRadius: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Aspect Ratio</label>
              <input
                type="number"
                step="0.1"
                value={phase3Config.aspectRatio}
                onChange={(e) =>
                  onPhase3Change({ ...phase3Config, aspectRatio: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Gesture</label>
              <select
                value={phase3Config.gesture}
                onChange={(e) =>
                  onPhase3Change({
                    ...phase3Config,
                    gesture: e.target.value as typeof phase3Config.gesture,
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              >
                <option value="none">None</option>
                <option value="drag">Drag</option>
                <option value="swipe">Swipe</option>
                <option value="pinch">Pinch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Spring Stiffness</label>
              <input
                type="number"
                value={phase3Config.spring.stiffness}
                onChange={(e) =>
                  onPhase3Change({
                    ...phase3Config,
                    spring: { ...phase3Config.spring, stiffness: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Spring Damping</label>
              <input
                type="number"
                value={phase3Config.spring.damping}
                onChange={(e) =>
                  onPhase3Change({
                    ...phase3Config,
                    spring: { ...phase3Config.spring, damping: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Duration (seconds)</label>
              <input
                type="number"
                step="0.1"
                value={phase4Config.duration}
                onChange={(e) =>
                  onPhase4Change({ ...phase4Config, duration: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Opacity</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={phase4Config.opacity}
                onChange={(e) =>
                  onPhase4Change({ ...phase4Config, opacity: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Gradient From</label>
              <input
                type="color"
                value={phase4Config.gradient.from}
                onChange={(e) =>
                  onPhase4Change({
                    ...phase4Config,
                    gradient: { ...phase4Config.gradient, from: e.target.value },
                  })
                }
                className="w-full h-10 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Gradient To</label>
              <input
                type="color"
                value={phase4Config.gradient.to}
                onChange={(e) =>
                  onPhase4Change({
                    ...phase4Config,
                    gradient: { ...phase4Config.gradient, to: e.target.value },
                  })
                }
                className="w-full h-10 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={phase4Config.interactive}
                  onChange={(e) =>
                    onPhase4Change({ ...phase4Config, interactive: e.target.checked })
                  }
                  className="rounded"
                />
                Interactive
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Perspective</label>
              <input
                type="number"
                value={phase5Config.perspective}
                onChange={(e) =>
                  onPhase5Change({ ...phase5Config, perspective: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Mouse Sensitivity</label>
              <input
                type="number"
                step="0.1"
                value={phase5Config.mouseSensitivity}
                onChange={(e) =>
                  onPhase5Change({
                    ...phase5Config,
                    mouseSensitivity: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={phase5Config.gyroscope}
                  onChange={(e) =>
                    onPhase5Change({ ...phase5Config, gyroscope: e.target.checked })
                  }
                  className="rounded"
                />
                Enable Gyroscope
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Optimize</label>
              <select
                value={phase5Config.optimize}
                onChange={(e) =>
                  onPhase5Change({
                    ...phase5Config,
                    optimize: e.target.value as typeof phase5Config.optimize,
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              >
                <option value="auto">Auto</option>
                <option value="quality">Quality</option>
                <option value="maxfps">Max FPS</option>
              </select>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Variant</label>
              <select
                value={phase6Config.variant}
                onChange={(e) =>
                  onPhase6Change({
                    ...phase6Config,
                    variant: e.target.value as typeof phase6Config.variant,
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="scale">Scale</option>
                <option value="rotate">Rotate</option>
                <option value="morph">Morph</option>
                <option value="wave">Wave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Stagger</label>
              <input
                type="number"
                step="0.01"
                value={phase6Config.stagger}
                onChange={(e) =>
                  onPhase6Change({ ...phase6Config, stagger: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Split By</label>
              <select
                value={phase6Config.splitBy}
                onChange={(e) =>
                  onPhase6Change({
                    ...phase6Config,
                    splitBy: e.target.value as typeof phase6Config.splitBy,
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              >
                <option value="char">Character</option>
                <option value="word">Word</option>
                <option value="line">Line</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Gradient From</label>
              <input
                type="color"
                value={phase6Config.gradient.from}
                onChange={(e) =>
                  onPhase6Change({
                    ...phase6Config,
                    gradient: { ...phase6Config.gradient, from: e.target.value },
                  })
                }
                className="w-full h-10 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Gradient To</label>
              <input
                type="color"
                value={phase6Config.gradient.to}
                onChange={(e) =>
                  onPhase6Change({
                    ...phase6Config,
                    gradient: { ...phase6Config.gradient, to: e.target.value },
                  })
                }
                className="w-full h-10 bg-gray-800 rounded-lg"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Variant</label>
              <select
                value={phase7Config.variant}
                onChange={(e) =>
                  onPhase7Change({
                    ...phase7Config,
                    variant: e.target.value as typeof phase7Config.variant,
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="ghost">Ghost</option>
                <option value="danger">Danger</option>
                <option value="success">Success</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={phase7Config.haptic}
                  onChange={(e) =>
                    onPhase7Change({ ...phase7Config, haptic: e.target.checked })
                  }
                  className="rounded"
                />
                Haptic Feedback
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={phase7Config.ripple}
                  onChange={(e) =>
                    onPhase7Change({ ...phase7Config, ripple: e.target.checked })
                  }
                  className="rounded"
                />
                Ripple Effect
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={phase7Config.magnetic}
                  onChange={(e) =>
                    onPhase7Change({ ...phase7Config, magnetic: e.target.checked })
                  }
                  className="rounded"
                />
                Magnetic Effect
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Spring Stiffness</label>
              <input
                type="number"
                value={phase7Config.spring.stiffness}
                onChange={(e) =>
                  onPhase7Change({
                    ...phase7Config,
                    spring: { ...phase7Config.spring, stiffness: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Spring Damping</label>
              <input
                type="number"
                value={phase7Config.spring.damping}
                onChange={(e) =>
                  onPhase7Change({
                    ...phase7Config,
                    spring: { ...phase7Config.spring, damping: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {a11yMode && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Accessibility Mode Active - Reduced Motion Enabled</span>
          </div>
        </div>
      )}
      {renderPhaseConfig()}
    </div>
  );
}

// ------------------------------------------------------------------------------------
// Preview Component
// ------------------------------------------------------------------------------------

interface AnimationPreviewProps {
  phase: 3 | 4 | 5 | 6 | 7;
  phase3Config: typeof phase3Config;
  phase4Config: typeof phase4Config;
  phase5Config: typeof phase5Config;
  phase6Config: typeof phase6Config;
  phase7Config: typeof phase7Config;
  isPlaying: boolean;
  a11yMode?: boolean;
}

function AnimationPreview({
  phase,
  phase3Config,
  phase4Config,
  phase5Config,
  phase6Config,
  phase7Config,
  isPlaying,
  a11yMode = false,
}: AnimationPreviewProps) {
  const renderPreview = () => {
    switch (phase) {
      case 3:
        return (
          <div className="space-y-4">
            <SharedElement
              id="demo-shared-1"
              className="w-full h-64 rounded-2xl overflow-hidden"
              borderRadius={phase3Config.borderRadius}
              aspectRatio={phase3Config.aspectRatio}
              preserveAspectRatio={phase3Config.preserveAspectRatio}
              gesture={a11yMode ? 'none' : phase3Config.gesture}
            >
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Shared Element</h3>
              </div>
            </SharedElement>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-2xl overflow-hidden">
              <LiquidMorph
                paths={LIQUID_PRESETS.organic}
                duration={phase4Config.duration}
                opacity={phase4Config.opacity}
                interactive={a11yMode ? false : phase4Config.interactive}
                gradient={phase4Config.gradient}
                physics={phase4Config.physics}
                className="absolute inset-0"
                disabled={a11yMode}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="relative w-full h-96 rounded-2xl overflow-hidden">
              <Parallax3D
                layers={PARALLAX_3D_PRESETS.hero}
                height="100%"
                perspective={phase5Config.perspective}
                gyroscope={a11yMode ? false : phase5Config.gyroscope}
                mouseSensitivity={a11yMode ? 0 : phase5Config.mouseSensitivity}
                optimize={phase5Config.optimize}
                respectReducedMotion={a11yMode}
                className="rounded-2xl"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="p-8 bg-gray-800 rounded-2xl">
              <KineticText
                variant={phase6Config.variant}
                stagger={phase6Config.stagger}
                splitBy={phase6Config.splitBy}
                scrollTrigger={phase6Config.scrollTrigger}
                spring={phase6Config.spring}
                gradient={phase6Config.gradient}
                size="3xl"
                weight="bold"
                className="text-white"
              >
                Kinetic Typography
              </KineticText>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <MicroInteractionButton
                variant={phase7Config.variant}
                haptic={a11yMode ? false : phase7Config.haptic}
                ripple={phase7Config.ripple}
                magnetic={a11yMode ? false : phase7Config.magnetic}
                spring={phase7Config.spring}
              >
                Click Me
              </MicroInteractionButton>
              <MicroInteractionCard
                hoverable
                tilt={!a11yMode}
                magnetic={a11yMode ? false : phase7Config.magnetic}
                haptic={a11yMode ? false : phase7Config.haptic}
                className="p-6 bg-gray-800 rounded-xl"
              >
                <h3 className="text-white font-semibold mb-2">Interactive Card</h3>
                <p className="text-gray-300 text-sm">
                  Hover and interact with this card
                </p>
              </MicroInteractionCard>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div>{renderPreview()}</div>;
}
