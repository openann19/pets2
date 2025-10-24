'use client'

/**
 * 🔥 ULTRA‑PREMIUM ANIMATIONS DEMO PAGE
 * Showcases all V2 animation components from ANIMATION_EXAMPLES_COMPLETE.tsx
 */

import React, { useState } from 'react';
import {
  ParallaxHeroV2,
  PARALLAX_PRESETS_V2,
  TiltCardV2,
  RevealGridExample,
  useRevealObserver,
  LiquidBackground,
  MagneticButton,
  ConfettiBurst,
  useHaptics,
  AnimationBudgetDisplay,
  CommandPaletteWrapper,
  ConfettiPhysics,
  CONFETTI_PRESETS,
  AnimatedContainer,
  AnimatedGrid,
  AnimatedItem,
  SoundToggle,
  type Command,
} from '@/components/Animations';

export default function UltraAnimationsDemoPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const haptics = useHaptics();

  const handleCelebrate = () => {
    haptics.success();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* Liquid Background */}
      <LiquidBackground 
        duration={8} 
        opacity={0.25} 
        className="fixed inset-0 -z-10"
      />

      {/* Confetti Burst */}
      {showConfetti && <ConfettiBurst count={80} />}

      {/* Animation Budget Display (dev only) */}
      {process.env.NODE_ENV === 'development' && <AnimationBudgetDisplay />}

      {/* HERO SECTION - Parallax with 3D Depth */}
      <ParallaxHeroV2
        height="130vh"
        pin
        perspective={1400}
        optimize="maxfps"
        layers={PARALLAX_PRESETS_V2.heroClassic}
        className="rounded-none"
      />

      {/* CONTENT SECTIONS */}
      <section className="mx-auto max-w-6xl py-16 px-4">
        {/* 3D Tilt Cards Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            3D Tilt Cards with Glare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Glass Card */}
            <TiltCardV2 className="backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl p-6">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">Glass Card</h3>
                <p className="text-white/80">
                  Beautiful glassmorphism + 3D tilt + glossy glare effect.
                </p>
              </div>
            </TiltCardV2>

            {/* Gradient Frame Card */}
            <TiltCardV2 className="rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400">
              <div className="rounded-2xl p-6 bg-slate-950/70 text-white">
                <h3 className="text-xl font-bold mb-2">Gradient Frame</h3>
                <p className="text-white/80">
                  Crisp gradient border with buttery smooth spring physics.
                </p>
              </div>
            </TiltCardV2>

            {/* Pet Card with Image */}
            <TiltCardV2 className="relative overflow-hidden rounded-2xl">
              <div className="w-full h-56 bg-gradient-to-br from-purple-600 to-pink-500" />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-bold">Pet Card</h3>
                <p className="text-sm opacity-90">Realistic tilt with glossy glare</p>
              </div>
            </TiltCardV2>
          </div>
        </div>

        {/* Custom Parallax Example */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            Custom Parallax Layers
          </h2>
          <ParallaxHeroV2
            height="80vh"
            perspective={1400}
            optimize="maxfps"
            layers={[
              {
                children: (
                  <div className="bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-400" />
                ),
                scrollRange: [0, 900],
                yRange: [0, -160],
                z: -240,
                zIndex: 1,
              },
              {
                children: (
                  <div className="absolute top-20 left-16 w-40 h-40 rounded-full bg-white/12 backdrop-blur" />
                ),
                scrollRange: [0, 900],
                yRange: [0, -80],
                xRange: [0, 60],
                opacityRange: [0.5, 0.95],
                z: -100,
                zIndex: 2,
              },
              {
                children: (
                  <div className="flex items-center justify-center h-full">
                    <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-2xl">
                      Pawfect Motion
                    </h1>
                  </div>
                ),
                scrollRange: [0, 500],
                yRange: [0, -30],
                scaleRange: [0.92, 1],
                opacityRange: [0, 1],
                z: 0,
                zIndex: 10,
                spring: { stiffness: 180, damping: 24, mass: 0.8 },
              },
            ]}
            className="rounded-2xl overflow-hidden"
          />
        </div>

        {/* Reveal Grid Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            Scroll Reveal Grid
          </h2>
          <RevealGridExample />
        </div>

        {/* Feature Cards with Reveal */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            Feature Showcase
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              title="True 3D Depth"
              description="Real translateZ transforms create authentic depth perception with perspective."
              delay={0}
            />
            <FeatureCard
              title="Glossy Glare"
              description="Radial gradient glare follows cursor for premium glass-like reflections."
              delay={100}
            />
            <FeatureCard
              title="Sticky Scrollytelling"
              description="Pin parallax heroes for immersive scroll-through experiences."
              delay={200}
            />
            <FeatureCard
              title="Reduced Motion"
              description="Respects prefers-reduced-motion with graceful fallbacks."
              delay={300}
            />
          </div>
        </div>

        {/* Magnetic Button & Confetti Demo */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            Magnetic Button + Confetti
          </h2>
          <div className="flex justify-center">
            <MagneticButton
              strength={40}
              radius={120}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-8 py-4"
              onClick={handleCelebrate}
            >
              🎉 Celebrate!
            </MagneticButton>
          </div>
          <p className="text-center text-slate-400 mt-4">
            Hover near the button to feel the magnetic pull, click for confetti + haptics
          </p>
        </div>

        {/* Advanced Tilt Examples */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            Advanced Tilt Variants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* High Tilt */}
            <TiltCardV2
              maxTilt={20}
              hoverScale={1.05}
              className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-8"
            >
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Dramatic Tilt</h3>
                <p className="text-white/90">maxTilt: 20°, hoverScale: 1.05</p>
              </div>
            </TiltCardV2>

            {/* Subtle Tilt */}
            <TiltCardV2
              maxTilt={5}
              hoverScale={1.01}
              glareOpacity={0.15}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8"
            >
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Subtle Tilt</h3>
                <p className="text-white/90">maxTilt: 5°, hoverScale: 1.01</p>
              </div>
            </TiltCardV2>
          </div>
        </div>

        {/* P2 — Layout Animations */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            P2: Layout Animations
          </h2>
          <AnimatedGrid columns={4} gap={4} staggerDelay={0.05}>
            {Array.from({ length: 8 }, (_, i) => (
              <AnimatedItem key={i}>
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {i + 1}
                </div>
              </AnimatedItem>
            ))}
          </AnimatedGrid>
        </div>

        {/* P2 — Advanced Confetti */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            P2: Physics-Based Confetti
          </h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 100);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold"
            >
              🎊 Celebration
            </button>
          </div>
          {showConfetti && (
            <ConfettiPhysics 
              count={100}
              duration={3}
              gravity={0.5}
              wind={0.1}
              shapes={['circle', 'square', 'triangle']}
            />
          )}
        </div>

        {/* P2 — Sound Toggle */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8 text-center">
            P2: Sound Kit
          </h2>
          <div className="flex justify-center">
            <SoundToggle />
          </div>
          <p className="text-center text-slate-400 mt-4">
            Toggle sound effects on/off (uses Web Audio API)
          </p>
        </div>

        {/* Integration Guide */}
        <div className="mb-24">
          <div className="reveal reveal-premium p-8 rounded-2xl bg-slate-900 border border-slate-700">
            <h2 className="text-3xl font-bold mb-4">Integration Guide</h2>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong className="text-white">Import:</strong>{' '}
                <code className="bg-slate-800 px-2 py-1 rounded text-sm">
                  import {'{'} ParallaxHeroV2, TiltCardV2, useRevealObserver {'}'} from
                  &apos;@/components/Animations&apos;
                </code>
              </p>
              <p>
                <strong className="text-white">CSS:</strong> Reveal classes already added to
                globals.css
              </p>
              <p>
                <strong className="text-white">Accessibility:</strong> All components respect
                prefers-reduced-motion and include ARIA labels
              </p>
              <p>
                <strong className="text-white">Performance:</strong> GPU-accelerated with
                will-change, backface-visibility, and contain optimizations
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Feature Card with Reveal Animation
 */
function FeatureCard({
  title,
  description,
  delay,
}: {
  title: string;
  description: string;
  delay: number;
}) {
  const { ref } = useRevealObserver();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="reveal reveal-premium p-6 rounded-2xl bg-slate-900 border border-slate-700"
      style={{ ['--delay' as string]: `${delay}ms` }}
    >
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
