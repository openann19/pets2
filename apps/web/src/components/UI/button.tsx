'use client';
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { THEME } from '@/theme/unified-design-system';
const Button = forwardRef(({ variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', fullWidth = false, children, className = '', disabled, href, as: Component = 'button', ...props }, ref) => {
    const baseStyle = THEME.createStyle(variant, size);
    const isDisabled = disabled || loading;
    // If href is provided, render as Link
    if (href) {
        const LinkComponent = Component;
        return (<LinkComponent href={href} className="block">
          <motion.button ref={ref} className={`
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `} style={{
                ...baseStyle,
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
            }} disabled={isDisabled} whileHover={!isDisabled ? {
                transform: baseStyle.hover?.transform || 'translateY(-2px)',
                boxShadow: baseStyle.hover?.shadow || THEME.shadows.hover,
            } : {}} whileTap={!isDisabled ? {
                transform: 'translateY(0px)',
                scale: 0.98,
            } : {}} transition={THEME.transitions.spring.normal} {...props}>
            <div className="flex items-center justify-center gap-2">
              {loading ? (<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>) : icon && iconPosition === 'left' ? (<span className="flex-shrink-0">{icon}</span>) : null}
              
              <span>{children}</span>
              
              {!loading && icon && iconPosition === 'right' ? (<span className="flex-shrink-0">{icon}</span>) : null}
            </div>
          </motion.button>
        </LinkComponent>);
    }
    return (<motion.button ref={ref} className={`
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `} style={{
            ...baseStyle,
            opacity: isDisabled ? 0.6 : 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
        }} disabled={isDisabled} whileHover={!isDisabled ? {
            transform: baseStyle.hover?.transform || 'translateY(-2px)',
            boxShadow: baseStyle.hover?.shadow || THEME.shadows.hover,
        } : {}} whileTap={!isDisabled ? {
            transform: 'translateY(0px)',
            scale: 0.98,
        } : {}} transition={THEME.transitions.spring.normal} {...props}>
        <div className="flex items-center justify-center gap-2">
          {loading ? (<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>) : icon && iconPosition === 'left' ? (<span className="flex-shrink-0">{icon}</span>) : null}
          
          <span>{children}</span>
          
          {!loading && icon && iconPosition === 'right' ? (<span className="flex-shrink-0">{icon}</span>) : null}
        </div>
      </motion.button>);
});
Button.displayName = 'Button';
export default Button;
//# sourceMappingURL=button.jsx.map