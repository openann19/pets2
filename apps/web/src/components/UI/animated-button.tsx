import { MotionButton, MotionSpan } from '@/components/ui/motion-helper';
import { cn } from '@/lib/utils';
import React from 'react';
const AnimatedButtonForwardRef = React.forwardRef(({ className, variant = 'primary', size = 'md', ripple = true, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState([]);
    const variantStyles = {
        primary: 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md',
        secondary: 'bg-brand-secondary hover:bg-brand-secondary/90 text-white shadow-md',
        ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-900 dark:hover:bg-neutral-800 dark:text-white',
    };
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    const handleClick = (e) => {
        if (ripple) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = Date.now();
            setRipples((prev) => [...prev, { x, y, id }]);
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== id));
            }, 600);
        }
        if (props.onClick) {
            props.onClick(e);
        }
    };
    return (<MotionButton ref={ref} className={cn('relative overflow-hidden rounded-lg font-medium', 'transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2', 'disabled:opacity-50 disabled:cursor-not-allowed', variantStyles[variant], sizeStyles[size], className)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }} {...props} onClick={handleClick}>
        {children}

        {/* Ripple effect */}
        {ripples.map((ripple) => (<MotionSpan key={ripple.id} className="absolute rounded-full bg-white/30" style={{
                left: ripple.x - 100,
                top: ripple.y - 100,
                width: 0,
                height: 0,
            }} initial={{ width: 0, height: 0, opacity: 1 }} animate={{ width: 200, height: 200, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}/>))}
      </MotionButton>);
});
AnimatedButtonForwardRef.displayName = 'AnimatedButton';
// Named export and default export without any casting
export const AnimatedButton = AnimatedButtonForwardRef;
export default AnimatedButtonForwardRef;
//# sourceMappingURL=animated-button.jsx.map
//# sourceMappingURL=animated-button.jsx.map