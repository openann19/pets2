/**
 * 🎯 THREE.JS EFFECTS DEMO PAGE
 * 
 * Demo page showcasing all Three.js effects with quality tiers and feature flags
 */

'use client';

import React from 'react';
import { PremiumScene } from '@/scenes/PremiumScene';
import { FeatureFlagsProvider } from '@/foundation/flags/FeatureFlagsProvider';

export default function EffectsDemoPage() {
  return (
    <FeatureFlagsProvider>
      <div className="relative w-full h-screen overflow-hidden">
        <PremiumScene />
        
        {/* Info overlay */}
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white text-sm max-w-xs">
          <h3 className="font-bold mb-2">Three.js Effects Demo</h3>
          <p className="mb-1">Quality tiers, feature flags, and reduced motion support.</p>
          <p className="text-xs opacity-75 mt-2">
            Query params: ?safeMode=1 | ?quality=low|mid|high
          </p>
        </div>
      </div>
    </FeatureFlagsProvider>
  );
}

