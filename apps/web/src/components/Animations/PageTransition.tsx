'use client'

/**
 * ULTRA PREMIUM PAGE + SHARED ELEMENT TRANSITIONS (Refactored)
 * - Clean presets with shared EASE + springs
 * - Proper prefers-reduced-motion via useReducedMotion
 * - Route-aware presets that actually map
 * - Stagger helpers (viewport-aware)
 * - Shared-element via LayoutGroup (no brittle overlay math)
 * - Tailwind-safe grid sizing (no dynamic class strings)
 * - WebAuthn component wired safely (expects real server options)
 * - Tiny sound kit with gain ramp + lazy AudioContext
 */

import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { usePathname } from 'next/navigation';

// -----------------------------------------------------------------------------
// Easing + Spring
// -----------------------------------------------------------------------------

export const EASE = [0.22, 0.68, 0, 1] as const;
export const SPRING = { type: 'spring' as const, stiffness: 300, damping: 30 } as const;

// -----------------------------------------------------------------------------
// Page Transition Presets
// -----------------------------------------------------------------------------

export type PresetKey =
  | 'fade'
  | 'scale'
  | 'slideRight'
  | 'slideLeft'
  | 'slideUp'
  | 'zoom'
  | 'blurFade';

export const transitionPresets: Record<PresetKey, {
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
  exit: Record<string, unknown>;
  transition: Record<string, unknown>;
}> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { ...SPRING },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { ...SPRING },
  },
  slideRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { ...SPRING },
  },
  slideLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { ...SPRING },
  },
  slideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
    transition: { ...SPRING },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
    transition: { ...SPRING },
  },
  blurFade: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
    transition: { ...SPRING },
  },
};

export interface PageTransitionProps {
  children: ReactNode;
  preset?: PresetKey;
  className?: string;
  variants?: Partial<(typeof transitionPresets)[PresetKey]>; // override
  disabled?: boolean;
}

export function PageTransition({ children, preset = 'fade', className = '', variants, disabled = false }: PageTransitionProps) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const animation = variants || transitionPresets[preset];

  if (disabled || reduce) return <div className={className}>{children}</div>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={animation.initial}
        animate={animation.animate}
        exit={animation.exit}
        transition={animation.transition}
        className={className}
        style={preset === 'blurFade' ? { willChange: 'filter' } : undefined}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// Stagger helpers
// -----------------------------------------------------------------------------

export interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function StaggerContainer({ children, staggerDelay = 0.06, className = '', once = true, amount = 0.2 }: StaggerContainerProps) {
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: staggerDelay, delayChildren: 0.1 } },
  };

  return (
    <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once, amount }} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { ...SPRING } } }}>
      {children}
    </motion.div>
  );
}

export function Presence({ children, show, preset = 'fade', className = '' }: { children: ReactNode; show: boolean; preset?: PresetKey; className?: string }) {
  const animation = transitionPresets[preset];

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div initial={animation.initial} animate={animation.animate} exit={animation.exit} transition={animation.transition} className={className}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ScrollReveal({ children, className = '', threshold = 0.12 }: { children: ReactNode; className?: string; threshold?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={SPRING}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HoverCard({ children, className = '', scale = 1.05 }: { children: ReactNode; className?: string; scale?: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.div whileHover={!reduce ? { scale, y: -5 } : undefined} whileTap={!reduce ? { scale: 0.98 } : undefined} transition={SPRING} className={className}>
      {children}
    </motion.div>
  );
}

export function Bounce({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1, 1.05, 1] }}
      transition={{ duration: 0.6, delay, times: [0, 0.2, 0.4, 0.6, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Pulse({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className={className}>
      {children}
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Route → Preset mapping
// -----------------------------------------------------------------------------

export const routeTransitions: Record<string, PresetKey> = {
  '/dashboard': 'fade',
  '/swipe': 'scale',
  '/matches': 'slideRight',
  '/chat': 'slideLeft',
  '/profile': 'zoom',
  '/settings': 'slideUp',
  '/premium': 'blurFade',
};

export function getRouteTransition(pathname: string): PresetKey {
  const hit = Object.entries(routeTransitions).find(([route]) => pathname.startsWith(route));
  return hit ? hit[1] : 'fade';
}

// -----------------------------------------------------------------------------
// Shared Elements — idiomatic LayoutGroup approach
// -----------------------------------------------------------------------------

export function SharedLayout({ children, groupId = 'shared', className = '' }: { children: ReactNode; groupId?: string; className?: string }) {
  return (
    <LayoutGroup id={groupId}>
      <div className={className}>{children}</div>
    </LayoutGroup>
  );
}

export function SharedElement({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return (
    <motion.div layoutId={id} className={className} transition={{ layout: { duration: 0.6, ease: EASE } }}>
      {children}
    </motion.div>
  );
}

export function HeroSharedElement({
  id,
  src,
  alt,
  title,
  subtitle,
  className = '',
  aspectRatio = 16 / 9,
  overlay = true,
  gradient = 'from-black/60 via-black/40 to-transparent',
}: {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
  aspectRatio?: number;
  overlay?: boolean;
  gradient?: string;
}) {
  return (
    <SharedElement id={id} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        layoutId={`${id}-image`}
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{ aspectRatio: String(aspectRatio) }}
      />

      {overlay && (
        <motion.div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      )}

      {(title || subtitle) && (
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          {title && (
            <motion.h1 className="text-4xl md:text-6xl font-bold mb-4 text-center" layoutId={`${id}-title`}>
              {title}
            </motion.h1>
          )}

          {subtitle && (
            <motion.p className="text-lg md:text-xl text-center opacity-90" layoutId={`${id}-subtitle`}>
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      )}
    </SharedElement>
  );
}

export function SharedElementGrid({ items, columns = 3, gap = 16, className = '' }: { items: Array<{ id: string; src: string; alt: string; title?: string }>; columns?: number; gap?: number; className?: string }) {
  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
      {items.map((item) => (
        <SharedElement key={item.id} id={item.id}>
          <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '1 / 1' }}>
            <motion.img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover"
              layoutId={`${item.id}-image`}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.35, ease: EASE }}
            />

            {item.title && (
              <motion.div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent" initial={{ opacity: 0, y: 20 }} whileHover={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <p className="text-white font-semibold">{item.title}</p>
              </motion.div>
            )}
          </div>
        </SharedElement>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sound Kit — lazy AudioContext + gain ramp to avoid pops
// -----------------------------------------------------------------------------

export interface SoundKitOptions {
  volume?: number;
  muted?: boolean;
}

export function useSoundKit(options: SoundKitOptions = {}) {
  const [muted, setMuted] = useState(options.muted ?? false);
  const [volume, setVolume] = useState(options.volume ?? 0.5);
  const audioContext = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContext.current && typeof window !== 'undefined') {
      const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) audioContext.current = new AC();
    }
    return audioContext.current;
  }, []);

  const ensureRunning = useCallback(async () => {
    const ctx = getContext();
    if (!ctx) return null;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Ignore resume errors
      }
    }

    return ctx;
  }, [getContext]);

  const playTone = useCallback(
    async (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      if (muted) return;

      const ctx = await ensureRunning();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = frequency;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const v = Math.max(0, Math.min(1, volume));

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(v, now + 0.005);
      gain.gain.linearRampToValueAtTime(0.0001, now + duration);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    },
    [muted, volume, ensureRunning]
  );

  const sounds = {
    tap: () => playTone(800, 0.05, 'sine'),
    success: () => {
      playTone(523.25, 0.1, 'sine');
      setTimeout(() => playTone(659.25, 0.12, 'sine'), 100);
    },
    error: () => {
      playTone(200, 0.1, 'sawtooth');
      setTimeout(() => playTone(150, 0.12, 'sawtooth'), 100);
    },
    notification: () => {
      playTone(880, 0.08, 'sine');
      setTimeout(() => playTone(1046.5, 0.1, 'sine'), 80);
    },
    hover: () => playTone(600, 0.02, 'sine'),
    click: () => playTone(1200, 0.03, 'square'),
  } as const;

  return { sounds, muted, setMuted, volume, setVolume, playTone };
}

export function SoundToggle() {
  const { muted, setMuted } = useSoundKit();

  return (
    <button
      onClick={() => setMuted(!muted)}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

export function SoundButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const { sounds } = useSoundKit();

  const handle = useCallback(() => {
    sounds.tap();
    onClick?.();
  }, [sounds, onClick]);

  return (
    <button onClick={handle} onMouseEnter={sounds.hover} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
      {children}
    </button>
  );
}

// -----------------------------------------------------------------------------
// WebAuthn BiometricAuth — safe wrapper (expects real server options)
// -----------------------------------------------------------------------------

export interface BiometricAuthProps {
  onSuccess: (cred: PublicKeyCredential) => void;
  onError: (message: string) => void;
  onFallback: () => void;
  requestOptions: () => Promise<PublicKeyCredentialRequestOptions>; // must provide challenge & RP config from server
}

export function BiometricAuth({ onSuccess, onError, onFallback, requestOptions }: BiometricAuthProps) {
  const [isSupported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        if (!('PublicKeyCredential' in window)) return setSupported(false);

        const available = await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable?.();

        if (mounted) setSupported(!!available);
      } catch {
        setSupported(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const authenticate = useCallback(async () => {
    if (!isSupported) return onFallback();

    setBusy(true);

    try {
      const opts = await requestOptions();

      if (!opts || !opts.challenge) throw new Error('Missing WebAuthn request options');

      const cred = (await navigator.credentials.get({ publicKey: opts })) as PublicKeyCredential | null;

      if (cred) onSuccess(cred);
      else onError('Authentication failed');
    } catch (e: unknown) {
      const name = (e as { name?: string })?.name;

      if (name === 'NotAllowedError') onError('Authentication cancelled');
      else if (name === 'InvalidStateError') onError('No biometric credentials found');
      else onError('Authentication failed');
    } finally {
      setBusy(false);
    }
  }, [isSupported, onFallback, onSuccess, onError, requestOptions]);

  if (!isSupported) return null;

  return (
    <div className="text-center">
      <button
        onClick={authenticate}
        disabled={busy}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        <div className="flex flex-col items-center space-y-2">
          {busy ? <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="text-2xl">🔒</span>}

          <div>
            <div className="font-bold">Biometric Authentication</div>
            <div className="text-sm opacity-90">Use your device biometrics</div>
          </div>
        </div>
      </button>

      <button onClick={onFallback} className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        Use password instead
      </button>
    </div>
  );
}
