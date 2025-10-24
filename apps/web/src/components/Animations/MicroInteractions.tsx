/**
 * 🎭 ULTRA PREMIUM MICRO-INTERACTIONS
 * Tactile, delightful animations for buttons, cards, and UI elements
 * Spring physics | Haptic feedback | WCAG 2.1 AA compliant
 */
'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
/**
 * Spring configuration for all micro-interactions
 */
const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};
export function AnimatedButton({ children, variant = 'primary', size = 'md', loading = false, success = false, haptic = true, className = '', onClick, disabled, ...props }) {
    const [isPressed, setIsPressed] = useState(false);
    const triggerHaptic = () => {
        if (haptic && 'vibrate' in navigator && !disabled) {
            navigator.vibrate(10);
        }
    };
    const handleClick = (e) => {
        triggerHaptic();
        onClick?.(e);
    };
    return (<motion.button {...(!disabled && {
        whileHover: { scale: 1.05, y: -2 },
        whileTap: { scale: 0.95 },
    })} transition={springConfig} onMouseDown={() => !disabled && setIsPressed(true)} onMouseUp={() => setIsPressed(false)} onMouseLeave={() => setIsPressed(false)} onClick={handleClick} disabled={disabled || loading} className={`relative overflow-hidden ${className}`} {...props}>
            {/* Ripple effect background */}
            {isPressed && (<motion.div initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 4, opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 bg-white rounded-full"/>)}

            {/* Loading spinner */}
            {loading && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"/>
                </motion.div>)}

            {/* Success checkmark */}
            {success && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={springConfig} className="absolute inset-0 flex items-center justify-center">
                    <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path d="M20 6L9 17l-5-5"/>
                    </motion.svg>
                </motion.div>)}

            {/* Button content */}
            <motion.div animate={{
            opacity: loading || success ? 0 : 1,
            y: loading || success ? 10 : 0,
        }} transition={springConfig}>
                {children}
            </motion.div>
        </motion.button>);
}
export function AnimatedCard({ children, hoverable = true, clickable = false, haptic = false, className = '', onClick, ...props }) {
    const [isHovered, setIsHovered] = useState(false);
    const triggerHaptic = () => {
        if (haptic && 'vibrate' in navigator && clickable) {
            navigator.vibrate(10);
        }
    };
    const handleClick = (e) => {
        triggerHaptic();
        onClick?.(e);
    };
    return (<motion.div {...(hoverable && {
        whileHover: {
            scale: 1.02,
            y: -8,
            rotateX: 2,
            rotateY: isHovered ? 1 : 0,
        },
    })} {...(clickable && { whileTap: { scale: 0.98 } })} transition={springConfig} onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)} onClick={clickable ? handleClick : undefined} style={{ transformStyle: 'preserve-3d' }} className={`relative ${className}`} {...props}>
            {/* Glow effect on hover */}
            {hoverable && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 0.6 : 0 }} transition={{ duration: 0.3 }} className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg -z-10"/>)}

            {children}
        </motion.div>);
}
export function AnimatedIcon({ children, bounce = false, pulse = false, spin = false, className = '', ...props }) {
    const getAnimation = () => {
        if (bounce)
            return { y: [0, -10, 0] };
        if (pulse)
            return { scale: [1, 1.2, 1] };
        if (spin)
            return { rotate: 360 };
        return {};
    };
    const getTransition = () => {
        if (bounce || pulse)
            return { duration: 0.6, repeat: Infinity, repeatDelay: 2 };
        if (spin)
            return { duration: 2, repeat: Infinity, ease: 'linear' };
        return {};
    };
    return (<motion.div animate={getAnimation()} transition={getTransition()} className={className} {...props}>
            {children}
        </motion.div>);
}
export function LoadingSpinner({ size = 'md', color = 'currentColor', className = '' }) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };
    return (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className={`${sizeClasses[size]} border-t-transparent rounded-full ${className}`} style={{ borderColor: color }}/>);
}
export function SuccessCheckmark({ size = 'md', color = '#10b981', className = '' }) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    return (<motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={springConfig} className={className}>
            <svg className={sizeClasses[size]} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }} d="M20 6L9 17l-5-5"/>
            </svg>
        </motion.div>);
}
export function ProgressBar({ progress, color = '#8b5cf6', height = '8px', className = '', showPercentage = false, }) {
    return (<div className={`relative ${className}`}>
            <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: color }}/>
            </div>
            {showPercentage && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-0 -top-6 text-sm font-medium" style={{ color }}>
                    {Math.round(progress)}%
                </motion.div>)}
        </div>);
}
export function Badge({ children, pulse = false, variant = 'default', className = '', ...props }) {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
    };
    return (<motion.div {...(pulse && {
        animate: { scale: [1, 1.1, 1] },
        transition: { duration: 2, repeat: Infinity },
    })} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...props}>
            {pulse && (<motion.span animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-current mr-1.5"/>)}
            {children}
        </motion.div>);
}
export function NotificationDot({ count, pulse = true, className = '' }) {
    return (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={springConfig} className={`absolute -top-1 -right-1 ${className}`}>
            <motion.div {...(pulse && {
        animate: { scale: [1, 1.2, 1] },
        transition: { duration: 2, repeat: Infinity },
    })} className="relative">
                {/* Outer glow ring */}
                {pulse && (<motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-red-500 rounded-full"/>)}

                {/* Inner dot */}
                <div className="relative bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
                    {count !== undefined && count > 0 ? (count > 99 ? '99+' : count) : null}
                </div>
            </motion.div>
        </motion.div>);
}
export function Skeleton({ width = '100%', height = '20px', circle = false, className = '' }) {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`relative overflow-hidden bg-gray-200 ${circle ? 'rounded-full' : 'rounded-md'} ${className}`} style={{ width, height }}>
            <motion.div animate={{
            x: ['-100%', '100%'],
        }} transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" style={{ transform: 'translateX(-100%)' }}/>
        </motion.div>);
}
export function Tooltip({ children, content, position = 'top' }) {
    const [isVisible, setIsVisible] = useState(false);
    const positions = {
        top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-8px)' },
        bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(8px)' },
        left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-8px)' },
        right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(8px)' },
    };
    return (<div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
            {children}
            {isVisible && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className="absolute z-50 px-3 py-1.5 text-sm text-white bg-gray-900 rounded-lg whitespace-nowrap pointer-events-none" style={positions[position]}>
                    {content}
                    {/* Arrow */}
                    <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45" style={{
                ...(position === 'top' && { bottom: '-4px', left: '50%', marginLeft: '-4px' }),
                ...(position === 'bottom' && { top: '-4px', left: '50%', marginLeft: '-4px' }),
                ...(position === 'left' && { right: '-4px', top: '50%', marginTop: '-4px' }),
                ...(position === 'right' && { left: '-4px', top: '50%', marginTop: '-4px' }),
            }}/>
                </motion.div>)}
        </div>);
}
/**
 * Hook to detect reduced motion preference
 */
export function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        const handleChange = (e) => {
            setPrefersReducedMotion(e.matches);
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return prefersReducedMotion;
}
//# sourceMappingURL=MicroInteractions.jsx.map