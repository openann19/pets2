import { cn } from '@/lib/utils';
import { useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import React, { useRef, useState, useCallback, useMemo, type ReactNode, type HTMLAttributes } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'light' | 'medium' | 'heavy';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  glow?: boolean;
  hover?: boolean;
  animate?: boolean;
  interactive?: boolean;
  children?: ReactNode;
}

const GlassCardComponent = React.forwardRef<HTMLDivElement, GlassCardProps>(({ className, variant = 'medium', blur = 'md', border = true, glow = false, hover = true, animate: _animate = true, interactive = false, children, ...props }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    // 2025 Standard: Subtle parallax/tilt effect on hover
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ['2deg', '-2deg']);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-2deg', '2deg']);
    // Reduced motion and pointer capability
    const reduceMotion = useReducedMotion();
    const canHover = useMemo(() => 
        typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
        []
    );
    
    // Throttle reference for mouse move
    const lastMoveTime = useRef(0);
    
    // Optimized mouse move handler with manual throttling (16ms = ~60fps)
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const now = Date.now();
        if (now - lastMoveTime.current < 16) return; // Throttle to ~60fps
        lastMoveTime.current = now;
        
        if (!interactive || !canHover || reduceMotion || !cardRef.current)
            return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = (e.clientX - centerX) / (rect.width / 2);
        const distanceY = (e.clientY - centerY) / (rect.height / 2);
        mouseX.set(distanceX * 0.1);
        mouseY.set(distanceY * 0.1);
    }, [interactive, canHover, reduceMotion, mouseX, mouseY]);
    
    const handleMouseLeave = useCallback(() => {
        mouseX.set(0);
        mouseY.set(0);
        setIsHovered(false);
    }, [mouseX, mouseY]);
    
    const handleMouseEnter = useCallback(() => {
        if (canHover) {
            setIsHovered(true);
        }
    }, [canHover]);
    // 2025 Standard: Layered, dimensional backgrounds (memoized)
    const variantStyles = useMemo(() => ({
        light: 'bg-gradient-to-br from-white/10 via-white/8 to-transparent',
        medium: 'bg-gradient-to-br from-white/15 via-white/12 to-white/5',
        heavy: 'bg-gradient-to-br from-white/20 via-white/16 to-white/10',
    }), []);
    
    const blurStyles = useMemo(() => ({
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
    }), []);
    
    // Memoize class names to avoid recalculation
    const cardClassName = useMemo(() => cn(
        'group relative rounded-2xl overflow-hidden',
        variantStyles[variant],
        blurStyles[blur],
        border && 'border border-white/20',
        'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        hover && 'hover:border-white/30 hover:shadow-2xl',
        'will-change-transform transform-gpu',
        className
    ), [variant, blur, border, hover, className, variantStyles, blurStyles]);
    
    // Use CSS custom properties for transform to avoid calling .get() during render
    // Motion values will update the transform via framer-motion's animation system
    const interactivePlainStyle = useMemo(() => {
        if (!interactive || !isHovered) return undefined;
        // Return style object that framer-motion can interpolate
        return {
            transformStyle: 'preserve-3d' as const,
            transform: `perspective(1000px) rotateX(${rotateX.get()}) rotateY(${rotateY.get()}) translateZ(10px)`,
        } as React.CSSProperties;
    }, [interactive, isHovered, rotateX, rotateY]);
    // Avoid passing a CSSProperties style to motion.div (expects MotionStyle)
    const { style: userStyle, ...restProps } = props;
    
    // Memoize ref callback
    const setRef = useCallback((node: HTMLDivElement | null) => {
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref && 'current' in ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
    }, [ref]);
    
    // Memoize combined style
    const combinedStyle = useMemo(() => 
        interactivePlainStyle ? { ...userStyle, ...interactivePlainStyle } : userStyle,
        [interactivePlainStyle, userStyle]
    );
    
    return (<div 
        ref={setRef}
        className={cardClassName}
        style={combinedStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...restProps}
    >
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