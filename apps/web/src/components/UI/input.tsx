'use client';
import React, { forwardRef, useState } from 'react';
import { THEME } from '@/theme/unified-design-system';
const Input = forwardRef(({ variant = 'default', size = 'md', label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputStyle = THEME.variants.input[variant];
    const sizeStyle = THEME.sizes.input[size];
    return (<div className="w-full">
        {label && (<label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>)}
        
        <div className="relative">
          {leftIcon && (<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>)}
          
          <input ref={ref} className={`
              w-full text-base sm:text-lg
              ${leftIcon ? 'pl-8 sm:pl-10' : ''}
              ${rightIcon ? 'pr-8 sm:pr-10' : ''}
              ${className}
            `} style={{
            ...inputStyle,
            ...sizeStyle,
            borderColor: error
                ? THEME.colors.error[500]
                : isFocused
                    ? THEME.colors.primary[500]
                    : inputStyle.border.split(' ')[2],
            boxShadow: isFocused && !error
                ? THEME.shadows.focus
                : 'none',
            transition: `all ${THEME.transitions.duration.normal} ${THEME.transitions.easing.easeOut}`,
        }} onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
        }} onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
        }} {...props}/>
          
          {rightIcon && (<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>)}
        </div>
        
        {(error || helperText) && (<p className="mt-2 text-sm" style={{
                color: error ? THEME.colors.error[600] : THEME.colors.neutral[600]
            }}>
            {error || helperText}
          </p>)}
      </div>);
});
Input.displayName = 'Input';
export default Input;
//# sourceMappingURL=Input.jsx.map