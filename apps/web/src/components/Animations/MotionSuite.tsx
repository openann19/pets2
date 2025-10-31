'use client'

/**
 * Motion Suite — Refactored
 * - Unifies variants + easing
 * - Fixes dynamic Tailwind classes (use style for gap/cols)
 * - Removes global listeners (element-scoped pointer events)
 * - Cleans types for haptics/sound
 * - Simplifies SVG morphing (animate d)
 * - Adds reduced–motion fallbacks
 */

import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type HTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { motion, type Variants, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// -----------------------------------------------------------------------------
// Easing + Variants
// -----------------------------------------------------------------------------

export const EASE = [0.22, 0.68, 0, 1] as const;

export const VARIANTS = {
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slideUp: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
  slideDown: { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } },
  slideLeft: { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } },
  scaleIn: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } },
} satisfies Record<string, Variants>;

const STAGGER = (staggerChildren = 0.1, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren, delayChildren },
  },
});

// -----------------------------------------------------------------------------
// Layout Animation Components
// -----------------------------------------------------------------------------

export interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  /** When true, applies stagger to children, while the container still animates with `variant` */
  stagger?: boolean;
  staggerChildren?: number;
  delayChildren?: number;
  delay?: number;
  duration?: number;
  className?: string;
  viewportOnce?: boolean;
  viewportAmount?: number;
}

export function AnimatedContainer({
  children,
  variant = 'fadeIn',
  stagger = false,
  staggerChildren = 0.1,
  delayChildren = 0.05,
  delay = 0,
  duration = 0.6,
  className = '',
  viewportOnce = true,
  viewportAmount = 0.2,
}: AnimatedContainerProps) {
  const variants = useMemo(() => {
    if (!stagger) return VARIANTS[variant];

    // merge: container gets stagger, children inherit their own variants
    return { ...STAGGER(staggerChildren, delayChildren), ...VARIANTS[variant] };
  }, [stagger, variant, staggerChildren, delayChildren]);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, amount: viewportAmount }}
      variants={variants}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedItemProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export function AnimatedItem({ children, variant = 'slideUp', className = '' }: AnimatedItemProps) {
  return (
    <motion.div className={className} variants={VARIANTS[variant]}>
      {children}
    </motion.div>
  );
}

export interface AnimatedGridProps {
  children: React.ReactNode;
  columns?: number; // uses inline style to avoid Tailwind purge on dynamic classes
  gap?: number; // rem units via inline style
  staggerDelay?: number;
  className?: string;
}

export function AnimatedGrid({ children, columns = 3, gap = 1.5, staggerDelay = 0.1, className = '' }: AnimatedGridProps) {
  return (
    <motion.div
      className={className}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}rem` }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedList({ children, staggerDelay = 0.08, className = '' }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
    >
      {children}
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Liquid — Simple, Robust SVG Morphing
// -----------------------------------------------------------------------------

export interface LiquidBlobProps {
  paths: string[]; // all paths must be topology-compatible
  duration?: number;
  ease?: string | number[];
  gradient?: { from: string; to: string; direction?: 'horizontal' | 'vertical' | 'diagonal' };
  opacity?: number;
  className?: string;
  viewBox?: string;
  disabled?: boolean;
  delay?: number;
}

const DEFAULT_GRADIENT = { from: '#7c3aed', to: '#06b6d4', direction: 'diagonal' as const };

export function LiquidBlob({ paths, duration = 8, ease = 'easeInOut', gradient = DEFAULT_GRADIENT, opacity = 0.5, className = '', viewBox = '-90 -90 180 180', disabled = false, delay = 0 }: LiquidBlobProps) {
  const gradientId = useMemo(() => `lg-${Math.random().toString(36).slice(2)}`, []);

  const dir = useMemo(() => {
    switch (gradient.direction) {
      case 'horizontal':
        return { x1: '0%', y1: '0%', x2: '100%', y2: '0%' };
      case 'vertical':
        return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };
      default:
        return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
    }
  }, [gradient.direction]);

  if (disabled || paths.length < 2) {
    return (
      <svg viewBox={viewBox} className={className} aria-hidden>
        <path d={paths[0] ?? ''} fill={`url(#${gradientId})`} opacity={opacity} />
        <defs>
          <linearGradient id={gradientId} {...dir}>
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg viewBox={viewBox} className={className} aria-hidden>
      <motion.path
        d={paths[0]}
        animate={{ d: paths }}
        transition={{ duration, ease, repeat: Infinity, repeatType: 'mirror', delay }}
        fill={`url(#${gradientId})`}
        opacity={opacity}
      />
      <defs>
        <linearGradient id={gradientId} {...dir}>
          <stop offset="0%" stopColor={gradient.from} />
          <stop offset="100%" stopColor={gradient.to} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LiquidBackdrop({ children, className = '', gradient = DEFAULT_GRADIENT, opacity = 0.35, paths, duration, delay, viewBox }: LiquidBlobProps & { children?: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <LiquidBlob paths={paths} gradient={gradient} opacity={opacity} duration={duration} delay={delay} viewBox={viewBox} className="absolute inset-0 h-full w-full" />
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}

// Multi-blob with stable positions (no SSR mismatch)
export function MultiBlobBackdrop({ blobs, className = '', children }: { blobs: Array<{ paths: string[]; gradient?: LiquidBlobProps['gradient']; opacity?: number; duration?: number; delay?: number; size?: 'small' | 'medium' | 'large' }>; className?: string; children?: React.ReactNode; }) {
  const sizeClasses = { small: 'w-32 h-32', medium: 'w-64 h-64', large: 'w-96 h-96' } as const;
  const positions = useMemo(() => blobs.map(() => ({ top: Math.random() * 80, left: Math.random() * 80, rot: Math.random() * 360 })), [blobs.length]);

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      {blobs.map((blob, i) => (
        <div key={i} className={`absolute ${sizeClasses[blob.size ?? 'medium']}`} style={{ top: `${positions[i].top}%`, left: `${positions[i].left}%`, transform: `rotate(${positions[i].rot}deg)` }}>
          <LiquidBlob paths={blob.paths} gradient={blob.gradient} opacity={blob.opacity ?? 0.2} duration={blob.duration ?? 8} delay={blob.delay ?? i * 2} />
        </div>
      ))}
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Micro-Interactions (Button + Card)
// -----------------------------------------------------------------------------

export type VibratePattern = number | number[];

export interface HapticFeedbackMap {
  light?: VibratePattern;
  medium?: VibratePattern;
  heavy?: VibratePattern;
  success?: VibratePattern;
  warning?: VibratePattern;
  error?: VibratePattern;
}

export function useHapticFeedback() {
  const trigger = useCallback((type: keyof HapticFeedbackMap = 'medium') => {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

    const patterns: HapticFeedbackMap = { light: 10, medium: 20, heavy: 40, success: [10, 50, 10], warning: [20, 50, 20], error: [40, 100, 40] };

    const pattern = patterns[type];

    if (pattern) (navigator as any).vibrate(pattern);
  }, []);

  return { trigger };
}

export function useSound(url?: string, { volume = 0.5, enabled = true }: { volume?: number; enabled?: boolean } = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!url) return;

    audioRef.current = new Audio(url);
    audioRef.current.volume = volume;
  }, [url, volume]);

  const play = useCallback(() => {
    if (!enabled || !audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [enabled]);

  return { play };
}

export interface MicroInteractionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  haptic?: boolean | keyof HapticFeedbackMap;
  soundUrl?: string; // simplified sound API
  ripple?: boolean;
  magnetic?: boolean;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  duration?: number;
  spring?: { stiffness?: number; damping?: number; mass?: number };
}

export function MicroInteractionButton({ variant = 'primary', size = 'md', haptic = false, soundUrl, ripple = true, magnetic = false, loading = false, success = false, error = false, disabled = false, icon, iconPosition = 'left', duration = 0.3, spring = { stiffness: 300, damping: 30, mass: 1 }, children, className = '', onClick, ...props }: MicroInteractionButtonProps) {
  const reduce = useReducedMotion();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const { trigger: vibrate } = useHapticFeedback();
  const { play } = useSound(soundUrl);

  // element-scoped pointer tracking (no globals)
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const x = useSpring(mvX, spring);
  const y = useSpring(mvY, spring);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!magnetic || !buttonRef.current) return;

      const r = buttonRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);

      if (d < 100) {
        mvX.set(dx * 0.3);
        mvY.set(dy * 0.3);
      } else {
        mvX.set(0);
        mvY.set(0);
      }
    },
    [magnetic, mvX, mvY]
  );

  const onPointerLeave = useCallback(() => {
    mvX.set(0);
    mvY.set(0);
  }, [mvX, mvY]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      if (haptic) vibrate(typeof haptic === 'string' ? haptic : 'medium');

      if (soundUrl) play();

      if (ripple && buttonRef.current) {
        const r = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { id, x, y }]);

        window.setTimeout(() => setRipples((prev) => prev.filter((rp) => rp.id !== id)), duration * 1000);
      }

      onClick?.(e);
    },
    [disabled, loading, haptic, vibrate, soundUrl, play, ripple, duration, onClick]
  );

  const variantCls: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  const sizeCls: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      ref={buttonRef}
      className={`relative overflow-hidden rounded-lg font-medium transition-colors ${variantCls[variant]} ${sizeCls[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileHover={!disabled && !reduce ? { scale: 1.05, y: -2 } : undefined}
      whileTap={!disabled && !reduce ? { scale: 0.95 } : undefined}
      style={{ x: magnetic ? x : undefined, y: magnetic ? y : undefined }}
      transition={{ type: 'spring', ...spring }}
      {...props}
    >
      {ripples.map((r) => (
        <motion.div
          key={r.id}
          className="absolute pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 20, opacity: 0 }}
          transition={{ duration, ease: 'easeOut' }}
        />
      ))}

      {/* Icon + content */}
      <motion.div
        className="relative flex items-center justify-center gap-2"
        animate={{ opacity: loading || success || error ? 0 : 1, y: loading || success || error ? 10 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {icon && iconPosition === 'left' && <span>{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span>{icon}</span>}
      </motion.div>

      {/* State overlays */}
      {loading && (
        <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {success && !loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', ...spring }}
        >
          <motion.svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <motion.path d="M20 6L9 17l-5-5" />
          </motion.svg>
        </motion.div>
      )}

      {error && !loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', ...spring }}
        >
          <motion.svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </motion.svg>
        </motion.div>
      )}

      {/* Hover glow */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl opacity-50 -z-10"
          style={{
            background: `linear-gradient(135deg, ${variant === 'primary' ? '#3b82f6' : '#6b7280'}, ${variant === 'primary' ? '#06b6d4' : '#9ca3af'})`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        />
      )}
    </motion.button>
  );
}

export interface MicroInteractionCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  clickable?: boolean;
  tilt?: boolean;
  magnetic?: boolean;
  haptic?: boolean;
  soundUrl?: string;
  gradient?: boolean;
  glow?: boolean;
  children: ReactNode;
}

export function MicroInteractionCard({
  hoverable = true,
  clickable = false,
  tilt = false,
  magnetic = false,
  haptic = false,
  soundUrl,
  gradient = false,
  glow = false,
  children,
  className = '',
  onClick,
  ...props
}: MicroInteractionCardProps) {
  const reduce = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { trigger: vibrate } = useHapticFeedback();
  const { play } = useSound(soundUrl);

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useTransform(mvY, [-0.5, 0.5], ['2deg', '-2deg']);
  const rotateY = useTransform(mvX, [-0.5, 0.5], ['-2deg', '2deg']);
  const x = useSpring(mvX, { stiffness: 300, damping: 30 });
  const y = useSpring(mvY, { stiffness: 300, damping: 30 });

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((!tilt && !magnetic) || !cardRef.current) return;

      const r = cardRef.current.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);

      mvX.set(dx * 0.1);
      mvY.set(dy * 0.1);
    },
    [tilt, magnetic, mvX, mvY]
  );

  const onPointerLeave = useCallback(() => {
    mvX.set(0);
    mvY.set(0);
  }, [mvX, mvY]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!clickable) return;

      if (haptic) vibrate('medium');

      if (soundUrl) play();

      onClick?.(e);
    },
    [clickable, haptic, soundUrl, play, onClick, vibrate]
  );

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onClick={handleClick}
      onHoverStart={() => hoverable && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileHover={hoverable && !reduce ? { scale: 1.02, y: -8 } : undefined}
      whileTap={clickable && !reduce ? { scale: 0.98 } : undefined}
      style={{
        x: magnetic ? x : undefined,
        y: magnetic ? y : undefined,
        ...(tilt ? { rotateX, rotateY, transformStyle: 'preserve-3d' as const } : {}),
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1 }}
      {...props}
    >
      {gradient && isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}

      {glow && isHovered && (
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-60 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Confetti — Physics-ish, reduced motion aware
// -----------------------------------------------------------------------------

export interface ConfettiPhysicsProps {
  count?: number;
  duration?: number; // seconds
  gravity?: number; // 0-1
  wind?: number; // -1 to 1
  shapes?: Array<'circle' | 'square' | 'triangle'>;
  colors?: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  size: number;
}

export function ConfettiPhysics({ count = 100, duration = 3, gravity = 0.5, wind = 0.1, shapes = ['circle', 'square', 'triangle'], colors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899', '#10B981'] }: ConfettiPhysicsProps) {
  const reduce = useReducedMotion();

  const particles = useMemo<Particle[]>(() => {
    const n = reduce ? Math.floor(count * 0.15) : count;

    return Array.from({ length: n }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 720,
      velocityX: (Math.random() - 0.5) * 100 + wind * 50,
      velocityY: -Math.random() * 150 - 100,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6,
    }));
  }, [count, wind, shapes, colors, reduce]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, rotate: p.rotation, opacity: 1 }}
          animate={{ x: p.velocityX, y: p.velocityY + gravity * 500, rotate: p.rotation + p.rotationSpeed * duration, opacity: 0 }}
          transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {p.shape === 'circle' && <div className="w-full h-full rounded-full" style={{ backgroundColor: p.color }} />}

          {p.shape === 'square' && <div className="w-full h-full" style={{ backgroundColor: p.color }} />}

          {p.shape === 'triangle' && (
            <div
              className="w-0 h-0"
              style={{
                borderLeft: `${p.size / 2}px solid transparent`,
                borderRight: `${p.size / 2}px solid transparent`,
                borderBottom: `${p.size}px solid ${p.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Presets
// -----------------------------------------------------------------------------

export const BLOB_SHAPES = {
  organic: [
    'M44.5,-58.8C57.1,-51.1,66.7,-38.3,71,-24.1C75.3,-10,74.2,5.6,68.2,18.3C62.2,31,51.2,40.8,39.2,49.3C27.2,57.8,13.6,65.1,-1.2,66.8C-16,68.5,-32.1,64.6,-44.1,55.2C-56.1,45.7,-64.1,30.7,-67.3,14.7C-70.5,-1.2,-68.9,-18.2,-61.3,-31C-53.7,-43.8,-40.2,-52.4,-26.2,-59.5C-12.3,-66.5,1.9,-72,16.6,-71.4C31.3,-70.9,46.5,-64.3,44.5,-58.8Z',
    'M39.1,-53.5C51.9,-44.9,64.1,-35.6,68.3,-23.5C72.5,-11.4,68.7,3.5,62.8,17.9C56.8,32.2,48.7,45.9,36.9,55.4C25,65,9.5,70.4,-5.1,74.6C-19.7,78.8,-39.5,81.7,-53.4,74.2C-67.2,66.8,-75.1,48.9,-76.1,32C-77.2,15.2,-71.5,-0.6,-64.2,-12.5C-56.8,-24.4,-47.9,-32.3,-37.9,-42.4C-27.9,-52.5,-16.8,-64.8,-3.6,-63.1C9.6,-61.5,19.2,-45.2,39.1,-53.5Z',
    'M52.3,-67.8C68.1,-58.2,81.2,-45.1,85.8,-29.8C90.4,-14.5,86.5,2.9,78.2,18.1C69.9,33.3,57.2,46.3,42.8,56.1C28.4,65.9,12.3,72.5,-4.1,75.8C-20.5,79.1,-41.1,79.1,-57.5,69.3C-73.9,59.5,-86.1,39.9,-89.1,18.9C-92.1,-2.1,-85.9,-24.5,-73.5,-42.3C-61.1,-60.1,-42.5,-73.3,-22.1,-82.9C-1.7,-92.5,20.5,-98.5,52.3,-67.8Z',
  ],
  wave: ['M0,50 Q25,0 50,50 T100,50 L100,100 L0,100 Z', 'M0,50 Q25,100 50,50 T100,50 L100,100 L0,100 Z', 'M0,50 Q25,25 50,50 T100,50 L100,100 L0,100 Z'],
  bubble: [
    'M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z',
    'M50,15 C65,15 80,30 80,50 C80,70 65,85 50,85 C35,85 20,70 20,50 C20,30 35,15 50,15 Z',
    'M50,20 C60,20 70,30 70,50 C70,70 60,80 50,80 C40,80 30,70 30,50 C30,30 40,20 50,20 Z',
  ],
};

export const GRADIENT_PRESETS = {
  sunset: { from: '#ff6b6b', to: '#feca57', direction: 'diagonal' as const },
  ocean: { from: '#667eea', to: '#764ba2', direction: 'vertical' as const },
  forest: { from: '#56ab2f', to: '#a8e6cf', direction: 'horizontal' as const },
  cosmic: { from: '#8360c3', to: '#2ebf91', direction: 'diagonal' as const },
  fire: { from: '#ff9a9e', to: '#fecfef', direction: 'vertical' as const },
  ice: { from: '#74b9ff', to: '#0984e3', direction: 'horizontal' as const },
};

