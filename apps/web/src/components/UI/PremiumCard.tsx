/**
 * 💎 ULTRA PREMIUM CARD COMPONENT - World-Class Mobile-First UI
 * Advanced card with glass morphism, 3D effects, haptic feedback, and WCAG 2.1 AA compliance
 * Implements the complete premium design system with mobile-first approach
 */
'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';
import { SPRING_CONFIG } from '@/constants/animations';
import { BLUR, COLORS, GRADIENTS, RADIUS, SHADOWS, transitions } from '@/constants/design-tokens';
export default function PremiumCard({ children, variant = 'default', hover = false, tilt = false, glow = false, blur = false, shimmer = false, magnetic = false, padding = 'md', className = '', onClick, entrance = 'fadeInUp', delay = 0, haptic = true, sound = true, disabled = false, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, 'aria-labelledby': ariaLabelledBy, 'aria-expanded': ariaExpanded, 'aria-selected': ariaSelected, 'aria-hidden': ariaHidden, 'aria-live': ariaLive, 'aria-atomic': ariaAtomic, 'aria-relevant': ariaRelevant, role, tabIndex, 'data-testid': dataTestId, }) {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    // 3D tilt effect with enhanced physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), transitions.micro);
    const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), transitions.micro);
    // Enhanced haptic feedback for mobile devices
    const triggerHaptic = useCallback((intensity = 'medium') => {
        if (!haptic || typeof window === 'undefined' || disabled)
            return;
        if ('vibrate' in navigator) {
            const patterns = {
                light: [8],
                medium: [15],
                heavy: [25, 10, 15],
            };
            navigator.vibrate(patterns[intensity]);
        }
    }, [haptic, disabled]);
    // Enhanced sound feedback with user gesture handling
    const [audioContext, setAudioContext] = useState(null);
    const [audioInitialized, setAudioInitialized] = useState(false);
    // Initialize audio context on first user interaction
    const initializeAudio = useCallback(() => {
        if (audioInitialized || typeof window === 'undefined')
            return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass)
                return;
            const ctx = new AudioContextClass();
            setAudioContext(ctx);
            setAudioInitialized(true);
        }
        catch {
            // Audio feedback not available
        }
    }, [audioInitialized]);
    const triggerSound = useCallback((type = 'press') => {
        if (!sound || typeof window === 'undefined' || disabled)
            return;
        // Initialize audio on first use
        if (!audioInitialized) {
            initializeAudio();
            return; // Skip this sound, will work on next interaction
        }
        if (!audioContext)
            return;
        try {
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            const frequencies = { hover: 800, press: 600 };
            oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
        catch {
            // Audio feedback not available
        }
    }, [sound, disabled, audioContext, audioInitialized, initializeAudio]);
    // Handle mouse move for tilt effect
    const handleMouseMove = (event) => {
        if (!tilt || !cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    };
    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        if (tilt) {
            x.set(0);
            y.set(0);
        }
    }, [tilt, x, y]);
    const handleMouseEnter = useCallback(() => {
        if (disabled)
            return;
        setIsHovered(true);
        triggerSound('hover');
    }, [disabled, triggerSound]);
    const handleClick = useCallback(() => {
        if (disabled || !onClick)
            return;
        triggerHaptic('medium');
        triggerSound('press');
        onClick();
    }, [disabled, onClick, triggerHaptic, triggerSound]);
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    }, [handleClick]);
    // Get enhanced variant styles with premium effects using design tokens
    const getVariantClasses = () => {
        const variants = {
            default: "text-white border border-white/15",
            glass: "text-white border border-white/20",
            elevated: "text-white border border-white/15 shadow-premium-lg hover:shadow-2xl transform hover:-translate-y-2",
            gradient: "text-white border border-white/15",
            neon: `border border-${COLORS.primary[400]}/40 text-${COLORS.primary[300]} hover:shadow-[0_0_24px_${COLORS.primary[400]}25]`,
            holographic: "text-white border border-white/15",
        };
        return variants[variant];
    };
    // Get enhanced background styles with better glassmorphism using design tokens
    const getBackgroundStyle = () => {
        const backgrounds = {
            default: {
                background: GRADIENTS.glass.light,
                backdropFilter: BLUR.premium,
                WebkitBackdropFilter: BLUR.premium,
                boxShadow: SHADOWS.glass,
            },
            glass: {
                background: GRADIENTS.glass.medium,
                backdropFilter: BLUR['2xl'],
                WebkitBackdropFilter: BLUR['2xl'],
                boxShadow: SHADOWS.glass,
            },
            elevated: {
                background: GRADIENTS.glass.medium,
                backdropFilter: BLUR.premium,
                WebkitBackdropFilter: BLUR.premium,
                boxShadow: SHADOWS['premium-lg'],
            },
            gradient: {
                background: GRADIENTS.primary,
                backdropFilter: BLUR.premium,
                WebkitBackdropFilter: BLUR.premium,
                boxShadow: SHADOWS.primaryGlow,
            },
            neon: {
                background: GRADIENTS.neon,
                backdropFilter: BLUR.premium,
                WebkitBackdropFilter: BLUR.premium,
                boxShadow: SHADOWS.neon,
            },
            holographic: {
                background: GRADIENTS.holographic,
                backdropFilter: BLUR['2xl'],
                WebkitBackdropFilter: BLUR['2xl'],
                boxShadow: SHADOWS['2xl'],
                backgroundSize: '400% 400%',
                animation: 'holographic 4s ease infinite',
            },
        };
        return backgrounds[variant];
    };
    // Get padding classes
    const getPaddingClasses = () => {
        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-7',
            xl: 'p-9',
        };
        return paddings[padding];
    };
    const variantClasses = getVariantClasses();
    const paddingClasses = getPaddingClasses();
    const backgroundStyle = getBackgroundStyle();
    return (<>
      <motion.div ref={cardRef} className={`
          relative rounded-2xl transition-all duration-300 transform-gpu
          ${variantClasses}
          ${paddingClasses}
          ${onClick && !disabled ? 'cursor-pointer' : disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${tilt ? 'perspective-1000 preserve-3d' : ''}
          ${className}
          w-full max-w-full
          sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
        `} style={{
            ...backgroundStyle,
            rotateX: tilt ? rotateX : 0,
            rotateY: tilt ? rotateY : 0,
            borderRadius: RADIUS['2xl'],
        }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: disabled ? 0.5 : 1, y: 0 }} transition={{ ...SPRING_CONFIG.default, delay }} whileHover={hover && !disabled ? { scale: 1.02, y: -4 } : {}} whileTap={onClick && !disabled ? { scale: 0.98 } : {}} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} onKeyDown={handleKeyDown} aria-label={ariaLabel} aria-describedby={ariaDescribedBy} aria-labelledby={ariaLabelledBy} aria-expanded={ariaExpanded} aria-selected={ariaSelected} aria-hidden={ariaHidden} aria-live={ariaLive} aria-atomic={ariaAtomic} aria-relevant={ariaRelevant} role={role} tabIndex={onClick ? (tabIndex ?? 0) : undefined} data-testid={dataTestId} aria-disabled={disabled}>
        {/* Enhanced Glow effect with design tokens */}
        {glow && isHovered && !disabled && (<motion.div className="absolute inset-0 rounded-2xl pointer-events-none blur-xl scale-110 -z-10" style={{
                background: `radial-gradient(circle, ${COLORS.primary[400]}20 0%, transparent 70%)`,
            }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ ...SPRING_CONFIG.quick }}/>)}

        {/* Enhanced Blur overlay */}
        {blur && (<motion.div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                backdropFilter: BLUR.xl,
                background: 'rgba(255, 255, 255, 0.05)',
            }}/>)}

        {/* Content with proper z-index */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Enhanced Interactive shine effect */}
        {hover && isHovered && !disabled && (<motion.div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 0.6, ease: 'easeInOut' }}/>
          </motion.div>)}

        {/* Enhanced Shimmer effect */}
        {shimmer && (<motion.div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{
                x: ['-100%', '100%'],
            }} transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
            }}/>
          </motion.div>)}

        {/* Enhanced Magnetic effect */}
        {magnetic && isHovered && !disabled && (<motion.div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1) 0%, transparent 50%)',
            }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...SPRING_CONFIG.quick }}/>)}
      </motion.div>

      {/* Holographic animation styles */}
      {variant === 'holographic' && (<style>{`
          @keyframes holographic {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>)}
    </>);
}
//# sourceMappingURL=PremiumCard.jsx.map