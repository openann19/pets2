'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import UniversalHeader from './UniversalHeader';
import HoloLogo from '@/components/Brand/HoloLogo';
import LanguageSelect from '@/components/UI/LanguageSelect';
import PremiumButton from '@/components/UI/PremiumButton';
import { useAuthStore } from '@/lib/auth-store';
const PremiumLayout = ({ children, showHeader = true, showFooter = false, className = '', useUniversalHeader = true, }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);
    const { isAuthenticated } = useAuthStore();
    // Handle missing translations gracefully
    let t;
    try {
        t = useTranslations();
    }
    catch (error) {
        // Fallback translations if context is missing
        t = (key) => {
            const fallbacks = {
                'navigation.browse': 'Browse',
                'navigation.matches': 'Matches',
                'navigation.dashboard': 'Dashboard',
                'navigation.map': 'Map',
                'navigation.premium': 'Premium',
                'navigation.aiBio': 'AI Bio',
                'navigation.aiPhoto': 'AI Photo',
                'common.getStarted': 'Get Started',
                'landing.browsePets': 'Browse Pets',
                'landing.myMatches': 'My Matches',
                'landing.petMap': 'Pet Map',
            };
            return fallbacks[key] || key;
        };
    }
    // Dismiss mobile menu on outside click and Esc; restore focus
    useEffect(() => {
        if (!mobileMenuOpen)
            return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
                requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
            }
        };
        const handleMouseDown = (e) => {
            const target = e.target;
            if (mobileMenuRef.current &&
                !mobileMenuRef.current.contains(target) &&
                mobileMenuButtonRef.current &&
                !mobileMenuButtonRef.current.contains(target)) {
                setMobileMenuOpen(false);
                requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('keydown', handleKeyDown);
        // Focus first link on open
        requestAnimationFrame(() => {
            const first = mobileMenuRef.current?.querySelector('a,button,[tabindex]:not([tabindex="-1"])');
            first?.focus();
        });
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mobileMenuOpen]);
    // Use UniversalHeader for authenticated users
    if (showHeader && useUniversalHeader && isAuthenticated) {
        return (<div className={`relative min-h-screen text-white ${className}`}>
        <UniversalHeader />
        <main className="relative z-40">
          {children}
        </main>
      </div>);
    }
    return (<div className={`relative min-h-screen text-white ${className}`}>
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[2000] bg-white text-black px-3 py-2 rounded">
        Skip to content
      </a>
      {/* Three.js background is provided by BackgroundProvider at root level */}

      {/* Header */}
      {showHeader && (<header className="fixed top-0 left-0 right-0 z-50">
          <div className="relative mx-auto max-w-7xl px-6 py-4">
            <motion.div className="relative rounded-2xl border border-white/12 bg-transparent backdrop-blur text-white transform-gpu overflow-hidden" whileHover={{
                scale: 1.02,
                y: -2,
                rotateX: 2,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} style={{
                transformStyle: 'preserve-3d',
            }}>
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl animate-shimmer" style={{ opacity: 0.15 }}/>
              <div className="relative">
                <div className="flex items-center justify-between px-4 py-3">
                  <Link href="/">
                    <HoloLogo size={44} withText monochrome/>
                  </Link>
                  
                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex items-center gap-6">
                    <Link href="/browse" className="text-white/80 hover:text-white transition-colors">{t('navigation.browse')}</Link>
                    <Link href="/matches" className="text-white/80 hover:text-white transition-colors">{t('navigation.matches')}</Link>
                    <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">{t('navigation.dashboard')}</Link>
                    <Link href="/map" className="text-white/80 hover:text-white transition-colors">{t('navigation.map')}</Link>
                    <Link href="/premium" className="text-white/80 hover:text-white transition-colors">{t('navigation.premium')}</Link>
                  </nav>

                  {/* Right actions */}
                  <div className="hidden md:flex items-center gap-3">
                    <div className="relative z-50"><LanguageSelect /></div>
                    <Link href="/register" aria-label="Get Started">
                      <PremiumButton variant="outline" magneticEffect>
                        {t('common.getStarted')}
                      </PremiumButton>
                    </Link>
                  </div>

                  {/* Mobile actions */}
                  <div className="flex md:hidden items-center gap-3">
                    <div className="relative z-50"><LanguageSelect /></div>
                    <button className="text-white/80 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} ref={mobileMenuButtonRef} aria-label="Toggle menu">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                      </svg>
                    </button>
                    <Link href="/register" aria-label={t('common.getStarted')}>
                      <PremiumButton variant="outline" magneticEffect>
                        {t('common.getStarted')}
                      </PremiumButton>
                    </Link>
                  </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden border-t border-white/10 bg-black/20 backdrop-blur-md" ref={mobileMenuRef}>
                    <div className="px-4 py-3 space-y-2">
                      <Link href="/browse" className="block text-white/80 hover:text-white transition-colors py-2">{t('landing.browsePets')}</Link>
                      <Link href="/matches" className="block text-white/80 hover:text-white transition-colors py-2">{t('landing.myMatches')}</Link>
                      <Link href="/dashboard" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.dashboard')}</Link>
                      <Link href="/map" className="block text-white/80 hover:text-white transition-colors py-2">{t('landing.petMap')}</Link>
                      <Link href="/premium" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.premium')}</Link>
                      <Link href="/ai/bio" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.aiBio')}</Link>
                      <Link href="/ai/photo" className="block text-white/80 hover:text-white transition-colors py-2">{t('navigation.aiPhoto')}</Link>
                    </div>
                  </motion.div>)}
              </div>
            </motion.div>
          </div>
        </header>)}

      {/* Main Content */}
      <main id="main-content" className={`relative z-40 ${showHeader ? 'pt-24' : ''}`} role="main">
        {children}
      </main>

      {/* Footer */}
      {showFooter && (<footer className="fixed bottom-0 left-0 right-0 z-50">
          <div className="relative mx-auto max-w-7xl px-6 py-4">
            <div className="relative rounded-2xl glass-dark border border-white/10 bg-black/20 backdrop-blur-md">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                    <span className="text-sm">💖</span>
                  </div>
                  <span className="text-sm text-white/80">© {new Date().getFullYear()} Paws</span>
                </div>
                <div className="text-sm text-white/70">Premium Experience</div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-violet-400/70 via-sky-400/70 to-fuchsia-400/70 opacity-50"/>
            </div>
          </div>
        </footer>)}
    </div>);
};
export default PremiumLayout;
//# sourceMappingURL=PremiumLayout.jsx.map