/**
 * 🚀 ADVANCED INTERACTION SYSTEM
 * Professional-grade hover effects, micro-interactions, and API integration
 * Ensures all interactive elements have consistent, polished behavior
 */
'use client';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { logger } from '@pawfectmatch/core';
;
import React, { useCallback, useRef, useState, useEffect, createContext, useContext } from 'react';
import { SPRING_CONFIG } from '@/constants/animations';
import { useAPILoading } from './UniversalLoadingStates';
const InteractionContext = createContext(null);
export const useInteractionSystem = () => {
    const context = useContext(InteractionContext);
    if (!context) {
        throw new Error('useInteractionSystem must be used within InteractionProvider');
    }
    return context;
};
export const InteractionProvider = ({ children }) => {
    const [states, setStates] = useState(new Map());
    const updateState = useCallback((id, updates) => {
        setStates(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(id) || {
                isHovered: false,
                isPressed: false,
                isFocused: false,
                isLoading: false,
                isDisabled: false,
                magneticOffset: { x: 0, y: 0 },
                tiltRotation: { x: 0, y: 0 },
            };
            newMap.set(id, { ...existing, ...updates });
            return newMap;
        });
    }, []);
    const getState = useCallback((id) => {
        return states.get(id);
    }, [states]);
    const resetState = useCallback((id) => {
        setStates(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
        });
    }, []);
    return (<InteractionContext.Provider value={{
            states,
            updateState,
            getState,
            resetState,
        }}>
      {children}
    </InteractionContext.Provider>);
};
export const EnhancedInteractive = ({ id, children, className = '', onClick, disabled = false, loading = false, variant = 'button', size = 'md', effects = {
    hover: true,
    magnetic: false,
    tilt: false,
    glow: false,
    ripple: true,
    sound: true,
    haptic: true,
    shimmer: false,
    particles: false,
}, apiOperation, tooltip, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, role, tabIndex, }) => {
    const { updateState, getState } = useInteractionSystem();
    const { startAPILoading, stopAPILoading } = useAPILoading();
    const elementRef = useRef(null);
    const [isPressed, setIsPressed] = useState(false);
    const [ripplePosition, setRipplePosition] = useState(null);
    // Motion values for advanced effects
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), SPRING_CONFIG.micro);
    const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), SPRING_CONFIG.micro);
    const magneticX = useSpring(0, SPRING_CONFIG.micro);
    const magneticY = useSpring(0, SPRING_CONFIG.micro);
    const state = getState(id) || {
        isHovered: false,
        isPressed: false,
        isFocused: false,
        isLoading: false,
        isDisabled: false,
        magneticOffset: { x: 0, y: 0 },
        tiltRotation: { x: 0, y: 0 },
    };
    // Enhanced haptic feedback
    const triggerHaptic = useCallback((intensity = 'medium') => {
        if (!effects.haptic || typeof window === 'undefined' || disabled)
            return;
        if ('vibrate' in navigator) {
            const patterns = {
                light: [8],
                medium: [15],
                heavy: [25, 10, 15],
            };
            navigator.vibrate(patterns[intensity]);
        }
    }, [effects.haptic, disabled]);
    // Enhanced sound feedback
    const [audioContext, setAudioContext] = useState(null);
    const [audioInitialized, setAudioInitialized] = useState(false);
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
        if (!effects.sound || typeof window === 'undefined' || disabled)
            return;
        if (!audioInitialized) {
            initializeAudio();
            return;
        }
        if (!audioContext)
            return;
        try {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            const frequencies = {
                hover: 800,
                press: 600,
                success: 1000,
                error: 400
            };
            oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
        catch {
            // Audio feedback not available
        }
    }, [effects.sound, disabled, audioContext, audioInitialized, initializeAudio]);
    // Magnetic mouse tracking
    const handleMouseMove = useCallback((event) => {
        if (!effects.magnetic || !elementRef.current || disabled)
            return;
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = event.clientX - centerX;
        const deltaY = event.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 50;
        if (distance < maxDistance) {
            const strength = 1 - distance / maxDistance;
            magneticX.set(deltaX * strength * 0.2);
            magneticY.set(deltaY * strength * 0.2);
        }
    }, [effects.magnetic, magneticX, magneticY, disabled]);
    // Tilt effect
    const handleTiltMove = useCallback((event) => {
        if (!effects.tilt || !elementRef.current)
            return;
        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(event.clientX - centerX);
        y.set(event.clientY - centerY);
    }, [effects.tilt, x, y]);
    const handleMouseLeave = useCallback(() => {
        updateState(id, { isHovered: false });
        if (effects.magnetic) {
            magneticX.set(0);
            magneticY.set(0);
        }
        if (effects.tilt) {
            x.set(0);
            y.set(0);
        }
    }, [id, updateState, effects.magnetic, effects.tilt, magneticX, magneticY, x, y]);
    const handleMouseEnter = useCallback(() => {
        if (disabled)
            return;
        updateState(id, { isHovered: true });
        triggerSound('hover');
    }, [id, updateState, disabled, triggerSound]);
    const handleClick = useCallback(async (event) => {
        if (disabled || loading || !onClick)
            return;
        // Ripple effect
        if (effects.ripple && elementRef.current) {
            const rect = elementRef.current.getBoundingClientRect();
            setRipplePosition({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
            setTimeout(() => setRipplePosition(null), 600);
        }
        triggerHaptic('medium');
        triggerSound('press');
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);
        // API integration
        if (apiOperation) {
            startAPILoading(apiOperation, { message: `Processing ${apiOperation}...` });
        }
        try {
            await onClick();
            triggerSound('success');
            if (apiOperation) {
                stopAPILoading(apiOperation);
            }
        }
        catch (error) {
            triggerSound('error');
            if (apiOperation) {
                stopAPILoading(apiOperation);
            }
            logger.error('Interaction error:', { error });
        }
    }, [disabled, loading, onClick, effects.ripple, triggerHaptic, triggerSound, apiOperation, startAPILoading, stopAPILoading]);
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick(event);
        }
    }, [handleClick]);
    const handleFocus = useCallback(() => {
        updateState(id, { isFocused: true });
    }, [id, updateState]);
    const handleBlur = useCallback(() => {
        updateState(id, { isFocused: false });
    }, [id, updateState]);
    // Get variant styles
    const getVariantClasses = () => {
        const variants = {
            button: 'cursor-pointer select-none',
            card: 'cursor-pointer select-none',
            link: 'cursor-pointer select-none',
            input: 'cursor-text select-text',
        };
        return variants[variant];
    };
    const getSizeClasses = () => {
        const sizes = {
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
            xl: 'text-xl',
        };
        return sizes[size];
    };
    return (<motion.div ref={elementRef} className={`
        relative inline-block
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${loading ? 'pointer-events-none' : ''}
        ${className}
      `} style={{
            x: effects.magnetic ? magneticX : 0,
            y: effects.magnetic ? magneticY : 0,
            rotateX: effects.tilt ? rotateX : 0,
            rotateY: effects.tilt ? rotateY : 0,
        }} onMouseMove={effects.magnetic || effects.tilt ? (e) => {
            if (effects.magnetic)
                handleMouseMove(e);
            if (effects.tilt)
                handleTiltMove(e);
        } : undefined} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} onKeyDown={handleKeyDown} onFocus={handleFocus} onBlur={handleBlur} whileHover={effects.hover && !disabled && !loading ? {
            scale: 1.02,
            y: -2,
            transition: SPRING_CONFIG.quick
        } : {}} whileTap={!disabled && !loading ? {
            scale: 0.98,
            transition: SPRING_CONFIG.quick
        } : {}} aria-label={ariaLabel} aria-describedby={ariaDescribedBy} role={role} tabIndex={tabIndex} aria-disabled={disabled}>
      {/* Glow effect */}
      {effects.glow && state.isHovered && !disabled && (<motion.div className="absolute inset-0 rounded-inherit pointer-events-none blur-xl scale-110 -z-10" style={{
                background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={SPRING_CONFIG.quick}/>)}

      {/* Shimmer effect */}
      {effects.shimmer && (<motion.div className="absolute inset-0 rounded-inherit pointer-events-none overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{
                x: ['-100%', '100%'],
            }} transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
            }}/>
        </motion.div>)}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Ripple effect */}
      <AnimatePresence>
        {effects.ripple && ripplePosition && (<motion.div className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none" initial={false} animate={{ scale: 1 }}>
            <motion.div className="absolute bg-white opacity-20" initial={{ scale: 0 }} animate={{ scale: 4 }} exit={{ scale: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{
                borderRadius: '50%',
                left: ripplePosition.x,
                top: ripplePosition.y,
                transform: 'translate(-50%, -50%)',
                width: 20,
                height: 20,
            }}/>
          </motion.div>)}
      </AnimatePresence>

      {/* Loading overlay */}
      {loading && (<motion.div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-inherit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING_CONFIG.quick}>
          <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
            }}/>
        </motion.div>)}

      {/* Tooltip */}
      {tooltip && state.isHovered && !disabled && (<motion.div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={SPRING_CONFIG.quick}>
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1"/>
        </motion.div>)}
    </motion.div>);
};
export const EnhancedButton = ({ variant = 'primary', icon, iconPosition = 'left', fullWidth = false, className = '', ...props }) => {
    const getVariantStyles = () => {
        const variants = {
            primary: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl',
            secondary: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl',
            danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl',
            ghost: 'bg-transparent text-gray-700 border-2 border-gray-300 hover:bg-gray-50',
            glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg',
            neon: 'bg-green-500 text-white shadow-lg shadow-green-500/50 hover:shadow-green-500/70',
            holographic: 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg animate-pulse',
            gradient: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl',
            outline: 'bg-transparent text-gray-700 border-2 border-gray-300 hover:bg-gray-50',
        };
        return variants[variant];
    };
    const getSizeStyles = () => {
        const sizes = {
            sm: 'px-3 py-2 text-sm min-h-[36px]',
            md: 'px-4 py-3 text-base min-h-[44px]',
            lg: 'px-6 py-4 text-lg min-h-[52px]',
            xl: 'px-8 py-5 text-xl min-h-[60px]',
        };
        return sizes[props.size || 'md'];
    };
    return (<EnhancedInteractive {...props} variant="button" className={`
        inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 transform-gpu
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}>
      {icon && iconPosition === 'left' && (<span className="flex-shrink-0 mr-2">{icon}</span>)}
      <span>{props.children}</span>
      {icon && iconPosition === 'right' && (<span className="flex-shrink-0 ml-2">{icon}</span>)}
    </EnhancedInteractive>);
};
export const EnhancedCard = ({ variant = 'default', padding = 'md', className = '', ...props }) => {
    const getVariantStyles = () => {
        const variants = {
            default: 'bg-white border border-gray-200 shadow-lg hover:shadow-xl',
            glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg',
            elevated: 'bg-white border border-gray-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2',
            gradient: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg',
            neon: 'bg-green-500/10 border border-green-500/30 text-green-300 shadow-lg shadow-green-500/20',
        };
        return variants[variant];
    };
    const getPaddingStyles = () => {
        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-5',
            lg: 'p-7',
            xl: 'p-9',
        };
        return paddings[padding];
    };
    return (<EnhancedInteractive {...props} variant="card" className={`
        rounded-2xl transition-all duration-300 transform-gpu
        ${getVariantStyles()}
        ${getPaddingStyles()}
        ${className}
      `}>
      {props.children}
    </EnhancedInteractive>);
};
// ====== EXPORT ALL COMPONENTS ======
// EnhancedInteractive is already exported above, don't duplicate
export { InteractionProvider as default, EnhancedButton, EnhancedCard };
//# sourceMappingURL=AdvancedInteractionSystem.jsx.map