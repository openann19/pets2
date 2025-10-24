/**
 * 💎 Premium Badge Component - Ultra Elite UI
 * Status indicators with premium styling and animations
 */
'use client';
import { motion } from 'framer-motion';
import React from 'react';
import { SPRING_CONFIG } from '@/constants/animations';
export default function PremiumBadge({ children, variant = 'default', size = 'md', glow = false, pulse = false, className = '', icon, iconPosition = 'left', }) {
    // Get variant styles
    const getVariantStyles = () => {
        const variants = {
            default: {
                background: 'bg-gray-100 text-gray-800',
                glow: 'shadow-gray-500/25',
            },
            success: {
                background: 'bg-green-100 text-green-800',
                glow: 'shadow-green-500/25',
            },
            warning: {
                background: 'bg-yellow-100 text-yellow-800',
                glow: 'shadow-yellow-500/25',
            },
            error: {
                background: 'bg-red-100 text-red-800',
                glow: 'shadow-red-500/25',
            },
            info: {
                background: 'bg-blue-100 text-blue-800',
                glow: 'shadow-blue-500/25',
            },
            premium: {
                background: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
                glow: 'shadow-purple-500/50',
            },
            holographic: {
                background: 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white',
                glow: 'shadow-purple-500/50',
            },
        };
        return variants[variant];
    };
    // Get size classes
    const getSizeClasses = () => {
        const sizes = {
            sm: 'px-2 py-1 text-xs',
            md: 'px-3 py-1.5 text-sm',
            lg: 'px-4 py-2 text-base',
        };
        return sizes[size];
    };
    const variantStyles = getVariantStyles();
    const sizeClasses = getSizeClasses();
    return (<motion.span className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full
        ${variantStyles.background} ${sizeClasses}
        ${glow ? `shadow-lg ${variantStyles.glow}` : ''}
        ${className}
      `} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING_CONFIG.quick} whileHover={glow ? { scale: 1.05 } : {}}>
      {/* Pulse animation */}
      {pulse && (<motion.div className="absolute inset-0 rounded-full bg-current opacity-20" animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0, 0.2],
            }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            }}/>)}

      {/* Icon */}
      {icon && iconPosition === 'left' && (<span className="flex-shrink-0">
          {icon}
        </span>)}

      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>

      {/* Icon */}
      {icon && iconPosition === 'right' && (<span className="flex-shrink-0">
          {icon}
        </span>)}
    </motion.span>);
}
// Predefined badge variants for common use cases
export const StatusBadge = ({ status, ...props }) => {
    const statusConfig = {
        online: { variant: 'success', children: 'Online', icon: '🟢' },
        offline: { variant: 'default', children: 'Offline', icon: '⚫' },
        away: { variant: 'warning', children: 'Away', icon: '🟡' },
        busy: { variant: 'error', children: 'Busy', icon: '🔴' },
    };
    const config = statusConfig[status];
    return (<PremiumBadge variant={config.variant} {...props}>
      {config.children}
    </PremiumBadge>);
};
export const PremiumTierBadge = ({ tier, ...props }) => {
    const tierConfig = {
        free: { variant: 'default', children: 'Free' },
        basic: { variant: 'info', children: 'Basic' },
        premium: { variant: 'premium', children: 'Premium', glow: true },
        vip: { variant: 'holographic', children: 'VIP', glow: true, pulse: true },
    };
    const config = tierConfig[tier];
    return (<PremiumBadge variant={config.variant} glow={config.glow} pulse={config.pulse} {...props}>
      {config.children}
    </PremiumBadge>);
};
//# sourceMappingURL=PremiumBadge.jsx.map