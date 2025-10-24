'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

import HoloLogo from '@/components/Brand/HoloLogo';
import LanguageSelect from '@/components/UI/LanguageSelect';
import PremiumButton from '@/components/UI/PremiumButton';
import { SPRING_CONFIG } from '@/constants/animations';

export default function PremiumLanding() {
  // Handle missing translations gracefully
  let t: any;
  try {
    t = useTranslations();
  } catch (error) {
    // Fallback translations if context is missing
    t = (key: string) => {
      const fallbacks: Record<string, string> = {
        // Navigation
        'navigation.browse': 'Browse',
        'navigation.matches': 'Matches',
        'navigation.dashboard': 'Dashboard',
        'navigation.map': 'Map',
        'navigation.premium': 'Premium',
        'navigation.language': 'Language',
        'navigation.aiBio': 'AI Bio',
        'navigation.aiPhoto': 'AI Photo',
        
        // Common
        'common.getStarted': 'Get Started',
        'common.createProfile': 'Create Profile',
        'common.startBrowsing': 'Start Browsing',
        
        // Landing
        'landing.toggleMenu': 'Toggle Menu',
        'landing.premiumPetMatching': 'Premium Pet Matching',
        'landing.headlinePrefix': 'Find Your Perfect',
        'landing.headlineHighlight': 'Pet Match',
        'landing.description': 'AI-powered pet matching for the perfect companion. Connect with pets that match your lifestyle and preferences.',
        'landing.browsePets': 'Browse Pets',
        'landing.myMatches': 'My Matches',
        'landing.petMap': 'Pet Map',
        'landing.premiumExperience': 'Premium Experience',
        
        // Hero section
        'hero.title': 'Find Your Perfect Pet Match',
        'hero.subtitle': 'AI-powered pet matching for the perfect companion',
        'hero.cta': 'Start Matching',
        
        // Features
        'features.title': 'Why Choose PawfectMatch?',
        'features.ai.title': 'AI-Powered Matching',
        'features.ai.description': 'Advanced algorithms find your ideal pet companion',
        'features.premium.title': 'Premium Experience',
        'features.premium.description': 'Exclusive features and premium support',
        'features.community.title': 'Active Community',
        'features.community.description': 'Connect with other pet lovers and experts',
      };
      return fallbacks[key] || key;
    };
  }
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-white">
      {/* Three.js background is provided by BackgroundProvider at root level */}


      {/* Header matching Start Browsing button style exactly */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="relative mx-auto max-w-7xl px-6 py-4">
          <motion.div
            className="relative rounded-2xl border border-white/12 bg-transparent backdrop-blur text-white transform-gpu overflow-hidden"
            whileHover={{ 
              scale: 1.02,
              y: -2,
              rotateX: 2,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Shimmer overlay for outline variant */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl animate-shimmer"
              style={{ opacity: 0.15 }}
            />
            <div className="relative">
              <div className="flex items-center justify-between px-4 py-3">
                <HoloLogo size={44} withText monochrome />
                
                  {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="./browse" className="text-white/90 hover:text-white transition-colors font-medium">{t('navigation.browse')}</Link>
                  <Link href="./matches" className="text-white/90 hover:text-white transition-colors font-medium">{t('navigation.matches')}</Link>
                  <Link href="./dashboard" className="text-white/90 hover:text-white transition-colors font-medium">{t('navigation.dashboard')}</Link>
                  <Link href="./map" className="text-white/90 hover:text-white transition-colors font-medium">{t('navigation.map')}</Link>
                  <Link href="./premium" className="text-white/90 hover:text-white transition-colors font-medium">{t('navigation.premium')}</Link>
                </nav>

                <div className="flex items-center gap-3">
                  <LanguageSelect />
                  {/* Mobile menu button */}
                  <button
                    className="md:hidden text-white hover:text-white/80 transition-colors p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={t('landing.toggleMenu')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  
                    <Link href="./register" aria-label={t('common.getStarted')}>
                    <PremiumButton variant="outline" magneticEffect className="border-2 border-white/80 hover:bg-white/20 hover:border-white font-semibold">
                      {t('common.getStarted')}
                    </PremiumButton>
                  </Link>
                </div>
              </div>

              {/* Mobile Navigation Menu */}
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="md:hidden border-t border-white/10 bg-black/20 backdrop-blur-md"
                >
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-white/80">{t('navigation.language')}</span>
                      <LanguageSelect />
                    </div>
                    <div className="h-px w-full bg-white/10" />
                    <Link href="./browse" className="block text-white/80 hover:text-white transition-colors py-2">{t('landing.browsePets')}</Link>
                    <Link href="./matches" className="block text-white/80 hover:text-white transition-colors py-2">{t('landing.myMatches')}</Link>
                    <Link href="./dashboard" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.dashboard')}</Link>
                    <Link href="./map" className="block text-white/80 hover:text-white transition-colors py-2">{t('landing.petMap')}</Link>
                    <Link href="./premium" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.premium')}</Link>
                    <Link href="./ai/bio" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.aiBio')}</Link>
                    <Link href="./ai/photo" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.aiPhoto')}</Link>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Center CTA over video */}
      <main className="relative z-40 flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={SPRING_CONFIG}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-6 shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <motion.div 
              className="w-2 h-2 bg-emerald-400 rounded-full" 
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-gray-700 font-medium">{t('landing.premiumPetMatching')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="text-5xl md:text-7xl font-extrabold leading-[1.1] text-gray-800 drop-shadow-lg"
          >
            {t('landing.headlinePrefix')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-sky-300 to-violet-300">{t('landing.headlineHighlight')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600"
          >
            {t('landing.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_CONFIG}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="./register" aria-label={t('common.createProfile')}>
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <PremiumButton variant="primary" glow magneticEffect size="lg" className="text-white relative z-10 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl">
                  {t('common.createProfile')}
                </PremiumButton>
              </motion.div>
            </Link>
            <Link href="./browse" aria-label={t('common.startBrowsing')}>
              <PremiumButton variant="outline" magneticEffect size="lg" className="text-white border-2 border-white/80 hover:bg-white/20 hover:border-white font-semibold backdrop-blur-md shadow-lg">
                {t('common.startBrowsing')}
              </PremiumButton>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Holographic Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">
        <div className="relative mx-auto max-w-7xl px-6 py-4">
          <div className="relative rounded-2xl glass-dark border border-white/10 bg-black/20 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                  <span className="text-sm">🐾</span>
                </div>
                <span className="text-sm text-white/80">© {new Date().getFullYear()} PawfectMatch</span>
              </div>
              <div className="text-sm text-white/70">{t('landing.premiumExperience')}</div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-violet-400/70 via-sky-400/70 to-fuchsia-400/70 opacity-50" />
          </div>
        </div>
      </footer>
    </div>
  );
}