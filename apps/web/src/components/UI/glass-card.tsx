import { cn } from '@/lib/utils';
import { useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { animationConfig } from '@pawfectmatch/core';
const GlassCardComponent = React.forwardRef(({ className, variant = 'medium', blur = 'md', border = true, glow = false, hover = true, animate: _animate = true, interactive = false, children, ...props }, ref) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    // 2025 Standard: Subtle parallax/tilt effect on hover
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ['2deg', '-2deg']);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-2deg', '2deg']);
    // Reduced motion and pointer capability
    const reduceMotion = useReducedMotion();
    const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const handleMouseMove = (e) => {
        if (!interactive || !canHover || reduceMotion || !cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = (e.clientX - centerX) / (rect.width / 2);
        const distanceY = (e.clientY - centerY) / (rect.height / 2);
        mouseX.set(distanceX * 0.1);
        mouseY.set(distanceY * 0.1);
    };
    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
    };
    // 2025 Standard: Layered, dimensional backgrounds
    const variantStyles = {
        light: 'bg-gradient-to-br from-white/10 via-white/8 to-transparent',
        medium: 'bg-gradient-to-br from-white/15 via-white/12 to-white/5',
        heavy: 'bg-gradient-to-br from-white/20 via-white/16 to-white/10',
    };
    const blurStyles = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
    };
    // Compute interactive style with explicit typing for both motion and plain div
    const transformStr = `perspective(1000px) rotateX(${rotateX.get()}) rotateY(${rotateY.get()}) translateZ(10px)`;
    const interactivePlainStyle = interactive && isHovered
        ? {
            transform: transformStr,
            transformStyle: 'preserve-3d',
        }
        : undefined;
    // Avoid passing a CSSProperties style to motion.div (expects MotionStyle)
    const { style: userStyle, ...restProps } = props;
    return (<div ref={(node) => {
            cardRef.current = node;
            if (typeof ref === 'function')
                ref(node);
            else if (ref)
                ref.current = node;
        }} className={cn('group relative rounded-2xl overflow-hidden', variantStyles[variant], blurStyles[blur], border && 'border border-white/20', 'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]', hover && 'hover:border-white/30 hover:shadow-2xl', 'will-change-transform transform-gpu', className)} style={interactivePlainStyle ? { ...userStyle, ...interactivePlainStyle } : userStyle} onMouseMove={handleMouseMove} onMouseEnter={() => canHover && setIsHovered(true)} onMouseLeave={handleMouseLeave} {...restProps}>
        {/* 2025 Standard: Subtle layered depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 opacity-50"/>

        {/* 2025 Standard: Micro-interaction shimmer (very subtle) */}
        {hover && canHover && !reduceMotion && (<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}/>
          </div>)}

        {/* 2025 Standard: Subtle glow (not overdone) */}
        {glow && (<div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10"/>)}

        {/* Content with proper z-index layering */}
        <div className="relative z-10">{children}</div>
      </div>);
});
GlassCardComponent.displayName = 'GlassCard';
// Named export and default export without casting
export const GlassCard = GlassCardComponent;
export default GlassCardComponent;
//# sourceMappingURL=glass-card.jsx.map
//# sourceMappingURL=glass-card.jsx.map