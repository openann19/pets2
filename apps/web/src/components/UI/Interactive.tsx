import { motion, MotionProps } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';
import clsx from 'clsx';
export const Interactive = forwardRef(({ children, className, hoverScale = 1.02, tapScale = 0.97, hoverY = -2, shadowIntensity = 'md', springConfig = { stiffness: 300, damping: 20 }, ...motionProps }, ref) => {
    const shadowMap = {
        sm: '0 4px 12px rgba(0,0,0,0.05)',
        md: '0 8px 24px rgba(0,0,0,0.08)',
        lg: '0 12px 36px rgba(0,0,0,0.12)',
        xl: '0 16px 48px rgba(0,0,0,0.16)',
    };
    return (<motion.div ref={ref} whileHover={{
            scale: hoverScale,
            y: hoverY,
            boxShadow: shadowMap[shadowIntensity]
        }} whileTap={{ scale: tapScale }} transition={{
            type: 'spring',
            stiffness: springConfig.stiffness,
            damping: springConfig.damping
        }} className={clsx('transform-gpu will-change-transform', className)} {...motionProps}>
      {children}
    </motion.div>);
});
Interactive.displayName = 'Interactive';
export const InteractiveButton = forwardRef(({ children, className, variant = 'primary', size = 'md', disabled = false, hoverScale = 1.05, tapScale = 0.95, ...motionProps }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 focus:ring-primary-500',
        secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:from-secondary-400 hover:to-secondary-500 focus:ring-secondary-500',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white focus:ring-primary-500',
        ghost: 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-neutral-500',
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    return (<motion.button ref={ref} whileHover={!disabled ? { scale: hoverScale } : {}} whileTap={!disabled ? { scale: tapScale } : {}} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], disabledClasses, className)} disabled={disabled} {...motionProps}>
      {children}
    </motion.button>);
});
InteractiveButton.displayName = 'InteractiveButton';
export const InteractiveCard = forwardRef(({ children, className, variant = 'default', hoverScale = 1.02, tapScale = 0.98, hoverY = -4, shadowIntensity = 'lg', ...motionProps }, ref) => {
    const baseClasses = 'rounded-xl overflow-hidden';
    const variantClasses = {
        default: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
        elevated: 'bg-white dark:bg-neutral-800 shadow-lg',
        glass: 'bg-white/10 dark:bg-neutral-800/10 backdrop-blur-md border border-white/20 dark:border-neutral-700/20',
    };
    return (<motion.div ref={ref} whileHover={{
            scale: hoverScale,
            y: hoverY,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }} whileTap={{ scale: tapScale }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className={clsx(baseClasses, variantClasses[variant], 'transform-gpu will-change-transform', className)} {...motionProps}>
      {children}
    </motion.div>);
});
InteractiveCard.displayName = 'InteractiveCard';
export const InteractiveSwipeCard = forwardRef(({ children, className, onSwipeLeft, onSwipeRight, onSwipeUp, ...motionProps }, ref) => {
    return (<motion.div ref={ref} drag="x" dragConstraints={{ left: -200, right: 200 }} dragElastic={0.1} onDragEnd={(_, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -10000) {
                onSwipeLeft?.();
            }
            else if (swipe > 10000) {
                onSwipeRight?.();
            }
        }} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className={clsx('transform-gpu will-change-transform cursor-grab active:cursor-grabbing', className)} {...motionProps}>
      {children}
    </motion.div>);
});
InteractiveSwipeCard.displayName = 'InteractiveSwipeCard';
export const InteractiveModal = forwardRef(({ children, className, isOpen, onClose, ...motionProps }, ref) => {
    if (!isOpen)
        return null;
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div ref={ref} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className={clsx('bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-md w-full', className)} onClick={(e) => e.stopPropagation()} {...motionProps}>
        {children}
      </motion.div>
    </motion.div>);
});
InteractiveModal.displayName = 'InteractiveModal';
// Export all interactive components
export const InteractiveComponents = {
    Interactive,
    InteractiveButton,
    InteractiveCard,
    InteractiveSwipeCard,
    InteractiveModal,
};
//# sourceMappingURL=Interactive.jsx.map
//# sourceMappingURL=Interactive.jsx.map