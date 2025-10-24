'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import React, { useCallback, useRef, useState } from 'react';
import { SPRING_CONFIG } from '@/constants/animations';
/**
 * Premium Button with enhanced mobile responsiveness and professional styling
 * - Mobile-first responsive padding
 * - High contrast colors for better visibility
 * - Professional gradients and shadows
 * - WCAG compliant color combinations
 */
const PremiumButton = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, loading = false, className = '', haptic = true, sound = true, icon, iconPosition = 'left', glow = false, magneticEffect = false, fullWidth = false, type = 'button', href, as: Component = 'button', 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, 'aria-pressed': ariaPressed, 'aria-expanded': ariaExpanded, 'aria-haspopup': ariaHaspopup, role, tabIndex, ...props }) => {
    const buttonRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);
    // Magnetic effect using motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 400, damping: 25 });
    const springY = useSpring(y, { stiffness: 400, damping: 25 });
    const baseClasses = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none transform-gpu overflow-hidden backdrop-blur";
    const variantStyles = {
        primary: {
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            color: '#ffffff',
            boxShadow: glow ? '0 0 40px rgba(236, 72, 153, 0.4)' : '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontWeight: '600',
        },
        secondary: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#ffffff',
            boxShadow: glow ? '0 0 40px rgba(59, 130, 246, 0.4)' : '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontWeight: '600',
        },
        danger: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            boxShadow: glow ? '0 0 40px rgba(239, 68, 68, 0.4)' : '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontWeight: '600',
        },
        ghost: {
            background: 'transparent',
            color: '#ffffff',
            border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: 'none',
            fontWeight: '500',
        },
        glass: {
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#ffffff',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            fontWeight: '600',
        },
        solid: {
            background: '#1f2937',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
            fontWeight: '600',
        },
        outline: {
            background: 'transparent',
            color: '#ffffff',
            border: '2px solid #e5e7eb',
            boxShadow: 'none',
            fontWeight: '500',
        },
        holographic: {
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(139, 92, 246, 0.8), rgba(59, 130, 246, 0.8))',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 0 50px rgba(236, 72, 153, 0.3)',
            backgroundSize: '200% 200%',
            animation: 'holographic 8s ease infinite',
            filter: 'saturate(120%)',
            fontWeight: '600',
        },
        neon: {
            background: 'rgba(16, 185, 129, 0.9)',
            color: '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            boxShadow: `0 0 30px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
            fontWeight: '600',
        },
        gradient: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: glow ? '0 0 40px rgba(102, 126, 234, 0.5)' : '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
            fontWeight: '600',
        },
    };
    // Mobile-first responsive size classes
    const sizeClasses = {
        sm: "px-3 sm:px-4 py-2 text-sm min-h-[36px]",
        md: "px-4 sm:px-6 py-3 text-base min-h-[44px]",
        lg: "px-6 sm:px-8 py-4 text-lg min-h-[52px]"
    };
    const variantStyle = variantStyles[variant];
    // Enhanced haptic feedback
    const triggerHaptic = useCallback((intensity = 'medium') => {
        if (!haptic || typeof window === 'undefined')
            return;
        if ('vibrate' in navigator) {
            const patterns = {
                light: [8],
                medium: [15],
                heavy: [25, 10, 15],
            };
            navigator.vibrate(patterns[intensity]);
        }
    }, [haptic]);
    // Enhanced sound feedback
    const triggerSound = useCallback((type = 'press') => {
        if (!sound || typeof window === 'undefined')
            return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass)
                return;
            const audioContext = new AudioContextClass();
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
    }, [sound]);
    // Magnetic mouse tracking
    const handleMouseMove = useCallback((event) => {
        if (!magneticEffect || !buttonRef.current || disabled)
            return;
        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 50;
        if (distance < maxDistance) {
            const strength = 1 - distance / maxDistance;
            x.set(deltaX * strength * 0.2);
            y.set(deltaY * strength * 0.2);
        }
    }, [magneticEffect, x, y, disabled]);
    const handleMouseLeave = useCallback(() => {
        if (magneticEffect) {
            x.set(0);
            y.set(0);
        }
    }, [magneticEffect, x, y]);
    const handleMouseEnter = useCallback(() => {
        triggerSound('hover');
    }, [triggerSound]);
    const handleClick = () => {
        if (disabled || loading)
            return;
        triggerHaptic('medium');
        triggerSound('press');
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
        onClick?.();
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };
    const wrapperClass = fullWidth ? "relative block w-full" : "relative inline-block";
    // If href is provided, render as Link
    if (href) {
        const LinkComponent = Component;
        return (<div className={wrapperClass}>
        <LinkComponent href={href} className="block">
          <motion.button ref={buttonRef} type={type} className={`
              ${baseClasses}
              ${sizeClasses[size]}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `} style={{
                ...variantStyle,
                x: springX,
                y: springY,
            }} whileHover={!disabled && !loading ? {
                scale: 1.02,
                y: -2,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            } : {}} whileTap={!disabled && !loading ? {
                scale: 0.98,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            } : {}} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} onKeyDown={handleKeyDown} aria-label={ariaLabel} aria-describedby={ariaDescribedBy} aria-pressed={ariaPressed} aria-expanded={ariaExpanded} aria-haspopup={ariaHaspopup} role={role} tabIndex={tabIndex} disabled={disabled || loading} aria-disabled={disabled || loading} {...props}>
            {/* Enhanced content with icon support */}
            <motion.div className="flex items-center justify-center gap-2" animate={{
                scale: isPressed ? 0.95 : 1,
                opacity: loading ? 0 : 1,
            }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              {icon && iconPosition === 'left' && (<motion.span className="flex-shrink-0" whileHover={{ rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  {icon}
                </motion.span>)}
              
              <span>{children}</span>
              
              {icon && iconPosition === 'right' && (<motion.span className="flex-shrink-0" whileHover={{ rotate: -5 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                  {icon}
                </motion.span>)}
            </motion.div>

            {/* Ripple effect */}
            <motion.div className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none" initial={false} animate={isPressed ? { scale: 1 } : { scale: 0 }}>
              <motion.div className="absolute inset-0 bg-white opacity-20" initial={{ scale: 0 }} animate={isPressed ? { scale: 4 } : { scale: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
            }}/>
            </motion.div>
          </motion.button>
        </LinkComponent>
      </div>);
    }
    return (<div className={wrapperClass}>
      <motion.button ref={buttonRef} type={type} className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `} style={{
            ...variantStyle,
            x: magneticEffect ? springX : 0,
            y: magneticEffect ? springY : 0,
        }} onClick={handleClick} onKeyDown={handleKeyDown} disabled={disabled || loading} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onMouseEnter={useCallback(() => triggerSound('hover'), [triggerSound])} aria-label={ariaLabel} aria-describedby={ariaDescribedBy} aria-pressed={ariaPressed} aria-expanded={ariaExpanded} aria-haspopup={ariaHaspopup} aria-disabled={disabled || loading} role={role} tabIndex={tabIndex} 
    // Enhanced hover and tap animations
    {...(!disabled && !loading ? {
        whileHover: {
            scale: 1.02,
            y: -2,
            rotateY: 1,
            transition: { type: "spring", stiffness: 400, damping: 25 },
        },
        whileTap: {
            scale: 0.98,
            y: 0,
            transition: { type: "spring", stiffness: 400, damping: 25 },
        }
    } : {})} 
    // Entry animation
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: disabled ? 0.5 : 1, scale: 1 }} transition={SPRING_CONFIG}>
        {/* Shimmer overlay for holographic variant */}
        {variant === 'holographic' && (<div className="pointer-events-none absolute inset-0 rounded-xl animate-shimmer" style={{ opacity: 0.18 }}/>)}
        {/* Glow effect */}
        {glow && !disabled && (<motion.div className="absolute inset-0 rounded-inherit pointer-events-none" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} style={{
                background: variantStyle.background,
                filter: 'blur(12px)',
                zIndex: -1,
                transform: 'scale(1.1)',
            }} transition={{ type: "spring", stiffness: 400, damping: 25 }}/>)}

        {/* Loading overlay */}
        {loading && (<motion.div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-inherit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
            }} data-testid="loading-spinner"/>
          </motion.div>)}

        {/* Enhanced content with icon support */}
        <motion.div className="flex items-center justify-center gap-2" animate={{
            scale: isPressed ? 0.95 : 1,
            opacity: loading ? 0 : 1,
        }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
          {icon && iconPosition === 'left' && (<motion.span className="flex-shrink-0" whileHover={{ rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              {icon}
            </motion.span>)}
          
          <span>{children}</span>
          
          {icon && iconPosition === 'right' && (<motion.span className="flex-shrink-0" whileHover={{ rotate: -5 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              {icon}
            </motion.span>)}
        </motion.div>

        {/* Ripple effect */}
        <motion.div className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none" initial={false} animate={isPressed ? { scale: 1 } : { scale: 0 }}>
          <motion.div className="absolute inset-0 bg-white opacity-20" initial={{ scale: 0 }} animate={isPressed ? { scale: 4 } : { scale: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{
            borderRadius: '50%',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        }}/>
        </motion.div>
      </motion.button>
    </div>);
};
export default PremiumButton;
//# sourceMappingURL=PremiumButton.jsx.map