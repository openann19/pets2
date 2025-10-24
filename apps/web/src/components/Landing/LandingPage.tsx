'use client';

/**
 * 🔥 ULTRA-PREMIUM LANDING PAGE
 * Integrates all advanced animation components:
 * - LiquidBackground
 * - ParallaxHeroV2
 * - MagneticButton
 * - SharedElement transitions
 */

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import {
  LiquidBackground,
  ParallaxHeroV2,
  PARALLAX_PRESETS_V2,
  MagneticButton,
  SharedImage,
  CardThumbnail,
  useRevealObserver,
} from '../Animations';

// Lazy load heavy components
const LazyParallaxHero = lazy(() => import('../Animations/ParallaxHero').then(m => ({ default: m.ParallaxHeroV2 })));
const LazyLiquidBackground = lazy(() => import('../Animations/LiquidBackground').then(m => ({ default: m.LiquidBackground })));

// Hero Content Component
function HeroContent() {
  const { ref, isVisible } = useRevealObserver({ threshold: 0.1 });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 flex flex-col items-center justify-center text-center px-4"
    >
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 0.68, 0, 1] }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
      >
        PawfectMatch Premium
      </motion.h1>
      
      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 0.68, 0, 1] }}
        className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl"
      >
        AI-powered pet matching platform that connects you with your perfect companion
      </motion.p>
      
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 0.68, 0, 1] }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <MagneticButton
          strength={50}
          radius={120}
          onClick={() => window.location.href = '/swipe-v2'}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50"
        >
          Start Matching
        </MagneticButton>
        
        <MagneticButton
          strength={50}
          radius={120}
          onClick={() => window.location.href = '/animations-demo'}
          className="bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
        >
          View Demo
        </MagneticButton>
      </motion.div>
    </motion.div>
  );
}

// Features Section Component
function FeaturesSection() {
  const { ref, isVisible } = useRevealObserver({ threshold: 0.1 });
  
  const features = [
    {
      icon: '🐾',
      title: 'Smart Matching',
      description: 'AI-powered algorithm finds your perfect pet companion',
    },
    {
      icon: '✨',
      title: 'Premium Experience',
      description: 'Ultra-premium animations and fluid interactions',
    },
    {
      icon: '🎯',
      title: 'Real-time Updates',
      description: 'Instant notifications and live updates',
    },
  ];
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="py-24 px-4 bg-slate-900/50 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isVisible ? 0 : 20, opacity: isVisible ? 1 : 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          Why Choose PawfectMatch?
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: isVisible ? 0 : 30, opacity: isVisible ? 1 : 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Pet Gallery Section with SharedElement
function PetGallerySection() {
  const { ref, isVisible } = useRevealObserver({ threshold: 0.1 });
  
  // Mock pet data
  const pets = [
    { id: '1', name: 'Bella', image: '/api/placeholder/400/400' },
    { id: '2', name: 'Max', image: '/api/placeholder/400/400' },
    { id: '3', name: 'Luna', image: '/api/placeholder/400/400' },
    { id: '4', name: 'Charlie', image: '/api/placeholder/400/400' },
  ];
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="py-24 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isVisible ? 0 : 20, opacity: isVisible ? 1 : 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-center mb-16 text-white"
        >
          Meet Our Pets
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {pets.map((pet, index) => (
            <motion.div
              key={pet.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: isVisible ? 1 : 0.9, opacity: isVisible ? 1 : 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <CardThumbnail
                id={`pet-${pet.id}`}
                src={pet.image}
                alt={pet.name}
                onClick={() => console.log(`View ${pet.name}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Liquid Background */}
      <Suspense fallback={<div className="fixed inset-0 bg-slate-950" />}>
        <LazyLiquidBackground
          duration={8}
          opacity={0.25}
          className="fixed inset-0 -z-10"
        />
      </Suspense>
      
      {/* Parallax Hero Section */}
      <section className="relative h-screen">
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
          </div>
        }>
          <ParallaxHeroV2
            height="100vh"
            pin
            perspective={1400}
            optimize="maxfps"
            layers={[
              {
                children: <div className="bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#06B6D4]" />,
                scrollRange: [0, 800] as [number, number],
                yRange: [0, -140] as [number, number],
                opacityRange: [1, 1] as [number, number],
                z: -200,
                zIndex: 1,
                className: 'layer-bg',
              },
              {
                children: <div className="bg-white/10 backdrop-blur-md" />,
                scrollRange: [0, 800] as [number, number],
                yRange: [0, -70] as [number, number],
                xRange: [0, 40] as [number, number],
                opacityRange: [0.7, 0.95] as [number, number],
                z: -80,
                zIndex: 2,
                className: 'layer-mid',
              },
              {
                children: <HeroContent />,
                scrollRange: [0, 500] as [number, number],
                yRange: [0, -30] as [number, number],
                scaleRange: [0.9, 1] as [number, number],
                opacityRange: [0, 1] as [number, number],
                z: 0,
                zIndex: 10,
                className: 'layer-fg',
                spring: { stiffness: 180, damping: 24, mass: 0.8 },
              },
            ]}
            className="rounded-none"
          />
        </Suspense>
      </section>
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Pet Gallery Section */}
      <PetGallerySection />
      
      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 px-4 bg-gradient-to-b from-slate-900 to-slate-950"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of pet lovers finding their ideal companions
          </p>
          <MagneticButton
            strength={60}
            radius={150}
            onClick={() => window.location.href = '/swipe-v2'}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white text-lg px-8 py-4 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            Get Started Now
          </MagneticButton>
        </div>
      </motion.section>
    </div>
  );
}
