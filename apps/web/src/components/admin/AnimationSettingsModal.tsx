import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { logger } from '@/services/logger';
import { AccessibleModal, AccessibleModalContent, AccessibleModalDescription, AccessibleModalHeader, AccessibleModalTitle } from '@/components/ui/accessible-modal';
import PremiumButton from '@/components/ui/PremiumButton';
import { GlassCard } from '@/components/ui/glass-card';
import { CogIcon, PlayIcon, PauseIcon, SparklesIcon, HandRaisedIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, PaintBrushIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
// This will be replaced with the actual import once the package is rebuilt
const mockAnimationConfig = {
    getConfig: () => ({
        enabled: true,
        reduceMotionRespected: true,
        buttons: { enabled: true, pressScale: 0.92, bounceScale: 1.02, rotationDegrees: 2, springStiffness: 300, springDamping: 20, hapticFeedback: true, loadingAnimation: true },
        cards: { enabled: true, hoverEffects: true, interactiveTilt: false, tiltDegrees: 2, shimmerEffect: true, shimmerDuration: 1000, glowEffect: true, glowOpacity: 0.1, entranceAnimation: true, entranceDelay: 100, springStiffness: 400, springDamping: 25 },
        lists: { enabled: true, staggerDelay: 100, entranceAnimation: 'slide', springStiffness: 200, springDamping: 15 },
        celebrations: { enabled: true, confetti: { enabled: true, duration: 3000, particleCount: 50, colors: ['#ff6b9d', '#4facfe', '#a855f7', '#ec4899', '#f59e0b'], spread: { min: 50, max: 70 }, velocity: { min: 50, max: 100 } } },
        mobile: { hapticFeedback: true, gestureAnimations: true, tabTransitions: true, searchFocusAnimations: true },
        web: { cursorEffects: true, parallaxScroll: false, hoverAnimations: true, microInteractions: true }
    }),
    updateConfig: (updates) => {
        logger.info('Updating animation config:', { updates });
    },
    resetToDefaults: () => {
        logger.info('Resetting animation config to defaults');
    }
};
export function AnimationSettingsModal({ isOpen, onClose }) {
    const [config, setConfig] = useState(mockAnimationConfig.getConfig());
    const [hasChanges, setHasChanges] = useState(false);
    useEffect(() => {
        if (isOpen) {
            setConfig(mockAnimationConfig.getConfig());
            setHasChanges(false);
        }
    }, [isOpen]);
    const updateConfig = (updates) => {
        const newConfig = { ...config, ...updates };
        setConfig(newConfig);
        setHasChanges(true);
    };
    const updateNestedConfig = (section, updates) => {
        updateConfig({ [section]: { ...config[section], ...updates } });
    };
    const saveChanges = () => {
        try {
            mockAnimationConfig.updateConfig(config);
            setHasChanges(false);
            logger.info('Animation settings saved successfully');
        }
        catch (error) {
            logger.error('Failed to save animation settings', { error });
        }
    };
    const resetToDefaults = () => {
        mockAnimationConfig.resetToDefaults();
        setConfig(mockAnimationConfig.getConfig());
        setHasChanges(false);
    };
    return (<AccessibleModal isOpen={isOpen} onClose={onClose}>
      <AccessibleModalContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AccessibleModalHeader>
          <AccessibleModalTitle className="flex items-center gap-3">
            <CogIcon className="w-6 h-6 text-blue-500"/>
            Animation Settings
          </AccessibleModalTitle>
          <AccessibleModalDescription>
            Configure advanced animation settings for web and mobile platforms. All changes are applied in real-time.
          </AccessibleModalDescription>
        </AccessibleModalHeader>

        <div className="space-y-8 p-6">
          {/* Global Settings */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PlayIcon className="w-5 h-5"/>
              Global Animation Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-white/80">Enable Animations</label>
                <button onClick={() => { updateConfig({ enabled: !config.enabled }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80">Respect Reduced Motion</label>
                <button onClick={() => { updateConfig({ reduceMotionRespected: !config.reduceMotionRespected }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.reduceMotionRespected ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.reduceMotionRespected ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Button Animations */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HandRaisedIcon className="w-5 h-5"/>
              Button Animations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Enable Buttons</label>
                <button onClick={() => { updateNestedConfig('buttons', { enabled: !config.buttons.enabled }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.buttons.enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.buttons.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Press Scale</label>
                <input type="number" step="0.01" min="0.5" max="1.0" value={config.buttons.pressScale} onChange={(e) => { updateNestedConfig('buttons', { pressScale: parseFloat(e.target.value) }); }} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"/>
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Bounce Scale</label>
                <input type="number" step="0.01" min="1.0" max="1.2" value={config.buttons.bounceScale} onChange={(e) => { updateNestedConfig('buttons', { bounceScale: parseFloat(e.target.value) }); }} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"/>
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Rotation (°)</label>
                <input type="number" step="0.5" min="0" max="10" value={config.buttons.rotationDegrees} onChange={(e) => { updateNestedConfig('buttons', { rotationDegrees: parseFloat(e.target.value) }); }} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"/>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Haptic Feedback</label>
                <button onClick={() => { updateNestedConfig('buttons', { hapticFeedback: !config.buttons.hapticFeedback }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.buttons.hapticFeedback ? 'bg-purple-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.buttons.hapticFeedback ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Loading Animation</label>
                <button onClick={() => { updateNestedConfig('buttons', { loadingAnimation: !config.buttons.loadingAnimation }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.buttons.loadingAnimation ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.buttons.loadingAnimation ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Card Animations */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PaintBrushIcon className="w-5 h-5"/>
              Card Animations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Enable Cards</label>
                <button onClick={() => { updateNestedConfig('cards', { enabled: !config.cards.enabled }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.cards.enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.cards.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Hover Effects</label>
                <button onClick={() => { updateNestedConfig('cards', { hoverEffects: !config.cards.hoverEffects }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.cards.hoverEffects ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.cards.hoverEffects ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Interactive Tilt</label>
                <button onClick={() => { updateNestedConfig('cards', { interactiveTilt: !config.cards.interactiveTilt }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.cards.interactiveTilt ? 'bg-orange-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.cards.interactiveTilt ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Tilt Degrees</label>
                <input type="number" step="0.5" min="0" max="10" value={config.cards.tiltDegrees} onChange={(e) => { updateNestedConfig('cards', { tiltDegrees: parseFloat(e.target.value) }); }} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"/>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Shimmer Effect</label>
                <button onClick={() => { updateNestedConfig('cards', { shimmerEffect: !config.cards.shimmerEffect }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.cards.shimmerEffect ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.cards.shimmerEffect ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Glow Effect</label>
                <button onClick={() => { updateNestedConfig('cards', { glowEffect: !config.cards.glowEffect }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.cards.glowEffect ? 'bg-pink-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.cards.glowEffect ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Celebration Effects */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5"/>
              Celebration Effects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Enable Celebrations</label>
                <button onClick={() => { updateNestedConfig('celebrations', { enabled: !config.celebrations.enabled }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.celebrations.enabled ? 'bg-purple-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.celebrations.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-white/80 text-sm">Enable Confetti</label>
                <button onClick={() => { updateNestedConfig('celebrations', {
            confetti: { ...config.celebrations.confetti, enabled: !config.celebrations.confetti.enabled }
        }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.celebrations.confetti.enabled ? 'bg-pink-600' : 'bg-gray-600'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.celebrations.confetti.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Platform-Specific Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DevicePhoneMobileIcon className="w-5 h-5"/>
                Mobile Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Haptic Feedback</label>
                  <button onClick={() => { updateNestedConfig('mobile', { hapticFeedback: !config.mobile.hapticFeedback }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.mobile.hapticFeedback ? 'bg-green-600' : 'bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.mobile.hapticFeedback ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Gesture Animations</label>
                  <button onClick={() => { updateNestedConfig('mobile', { gestureAnimations: !config.mobile.gestureAnimations }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.mobile.gestureAnimations ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.mobile.gestureAnimations ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Tab Transitions</label>
                  <button onClick={() => { updateNestedConfig('mobile', { tabTransitions: !config.mobile.tabTransitions }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.mobile.tabTransitions ? 'bg-purple-600' : 'bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.mobile.tabTransitions ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ComputerDesktopIcon className="w-5 h-5"/>
                Web Settings
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Cursor Effects</label>
                  <button onClick={() => { updateNestedConfig('web', { cursorEffects: !config.web.cursorEffects }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.web.cursorEffects ? 'bg-green-600' : 'bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.web.cursorEffects ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Hover Animations</label>
                  <button onClick={() => { updateNestedConfig('web', { hoverAnimations: !config.web.hoverAnimations }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.web.hoverAnimations ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.web.hoverAnimations ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white/80 text-sm">Micro Interactions</label>
                  <button onClick={() => { updateNestedConfig('web', { microInteractions: !config.web.microInteractions }); }} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.web.microInteractions ? 'bg-purple-600' : 'bg-gray-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.web.microInteractions ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-white/10">
          <PremiumButton variant="secondary" onClick={resetToDefaults} className="flex items-center gap-2">
            <EyeSlashIcon className="w-4 h-4"/>
            Reset to Defaults
          </PremiumButton>

          <div className="flex gap-3">
            <PremiumButton variant="ghost" onClick={onClose}>
              Cancel
            </PremiumButton>
            <PremiumButton onClick={saveChanges} disabled={!hasChanges} className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4"/>
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </PremiumButton>
          </div>
        </div>
      </AccessibleModalContent>
    </AccessibleModal>);
}
//# sourceMappingURL=AnimationSettingsModal.jsx.map
//# sourceMappingURL=AnimationSettingsModal.jsx.map