/**
 * 💎 Premium Input Component - World-Class Form Fields
 * Features: Floating labels, focus rings, validation states, icon support
 */
'use client';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_CONFIG, MICRO_CONFIG } from '../../constants/animations';
const PremiumInput = ({ label, placeholder, value = '', onChange, onBlur, onFocus, type = 'text', variant = 'default', size = 'md', disabled = false, error, helperText, maxLength, showCharCount = false, leftIcon, rightIcon, required = false, className = '', autoComplete, name, }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value);
    const inputRef = useRef(null);
    const currentValue = value || internalValue;
    const hasValue = currentValue.length > 0;
    const isFloating = isFocused || hasValue;
    const handleFocus = () => {
        setIsFocused(true);
        onFocus?.();
    };
    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };
    const handleChange = (e) => {
        const newValue = e.target.value;
        if (maxLength && newValue.length > maxLength)
            return;
        setInternalValue(newValue);
        onChange?.(newValue);
    };
    // Variant styles
    const variantStyles = {
        default: {
            container: `bg-white dark:bg-gray-800 border-2 ${error ? 'border-red-500' : isFocused ? 'border-pink-500' : 'border-gray-300 dark:border-gray-600'}`,
            input: 'text-gray-900 dark:text-white',
            label: error ? 'text-red-500' : isFocused ? 'text-pink-500' : 'text-gray-600 dark:text-gray-400',
        },
        glass: {
            container: `glass-light backdrop-blur-xl border ${error ? 'border-red-400/50' : isFocused ? 'border-pink-400/50' : 'border-white/30'}`,
            input: 'text-gray-900 dark:text-white',
            label: error ? 'text-red-500' : isFocused ? 'text-pink-500' : 'text-gray-700 dark:text-gray-300',
        },
        gradient: {
            container: `bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-2 ${error ? 'border-red-500' : isFocused ? 'border-pink-500' : 'border-pink-200 dark:border-pink-800'}`,
            input: 'text-gray-900 dark:text-white',
            label: error ? 'text-red-500' : isFocused ? 'text-pink-600' : 'text-pink-600 dark:text-pink-400',
        },
        neon: {
            container: `bg-gray-900 border-2 ${error ? 'border-red-500' : isFocused ? 'border-pink-400' : 'border-pink-400/50'} ${isFocused ? 'shadow-[0_0_20px_rgba(236,72,153,0.5)]' : ''}`,
            input: 'text-pink-400',
            label: error ? 'text-red-500' : 'text-pink-400',
        },
        floating: {
            container: `bg-white/10 backdrop-blur-md border-2 ${error ? 'border-red-500' : isFocused ? 'border-blue-400' : 'border-white/20'} ${isFocused ? 'shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`,
            input: 'text-white',
            label: error ? 'text-red-500' : isFocused ? 'text-blue-400' : 'text-white/70',
        },
        outlined: {
            container: `bg-transparent border-2 ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'} ${isFocused ? 'shadow-[0_0_0_3px_rgba(59,130,246,0.1)]' : ''}`,
            input: 'text-gray-900 dark:text-white',
            label: error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400',
        },
        filled: {
            container: `bg-gray-100 dark:bg-gray-800 border-2 ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-transparent'} ${isFocused ? 'shadow-[0_0_0_3px_rgba(59,130,246,0.1)]' : ''}`,
            input: 'text-gray-900 dark:text-white',
            label: error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400',
        },
    };
    const sizeStyles = {
        sm: {
            container: 'h-10',
            input: 'text-sm sm:text-base', // Mobile-first responsive text sizing
            label: 'text-xs sm:text-sm',
            padding: leftIcon ? 'pl-8 sm:pl-10 pr-3 sm:pr-4' : rightIcon ? 'pl-3 sm:pl-4 pr-8 sm:pr-10' : 'px-3 sm:px-4',
            icon: 'w-4 h-4 sm:w-5 sm:h-5',
        },
        md: {
            container: 'h-12',
            input: 'text-base sm:text-lg', // Mobile-first responsive text sizing
            label: 'text-sm sm:text-base',
            padding: leftIcon ? 'pl-10 sm:pl-12 pr-3 sm:pr-4' : rightIcon ? 'pl-3 sm:pl-4 pr-10 sm:pr-12' : 'px-3 sm:px-4',
            icon: 'w-5 h-5 sm:w-6 sm:h-6',
        },
        lg: {
            container: 'h-14',
            input: 'text-lg sm:text-xl', // Mobile-first responsive text sizing
            label: 'text-base sm:text-lg',
            padding: leftIcon ? 'pl-12 sm:pl-14 pr-4 sm:pr-5' : rightIcon ? 'pl-4 sm:pl-5 pr-12 sm:pr-14' : 'px-4 sm:px-5',
            icon: 'w-6 h-6 sm:w-7 sm:h-7',
        },
    };
    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];
    return (<div className={`relative ${className}`}>
      {/* Input Container */}
      <motion.div className={`
          relative ${sizes.container} rounded-xl transition-all duration-200
          ${styles.container}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
          transform-gpu
        `} whileTap={!disabled ? { scale: 0.995 } : {}} transition={MICRO_CONFIG} onClick={() => inputRef.current?.focus()}>
        {/* Left Icon */}
        {leftIcon && (<div className={`absolute left-4 top-1/2 -translate-y-1/2 ${styles.label}`}>
            <div className={sizes.icon}>{leftIcon}</div>
          </div>)}

        {/* Floating Label */}
        {label && (<motion.label className={`
              absolute left-4 pointer-events-none
              ${styles.label} font-medium
              transition-all duration-200
            `} animate={{
                y: isFloating ? -20 : 0,
                scale: isFloating ? 0.85 : 1,
                x: isFloating ? (leftIcon ? 20 : 0) : (leftIcon ? 32 : 0),
            }} transition={SPRING_CONFIG} style={{
                top: '50%',
                originX: 0,
                originY: 0.5,
            }}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>)}

        {/* Input Field */}
        <input ref={inputRef} type={type} name={name} value={currentValue} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} disabled={disabled} placeholder={!label || isFloating ? placeholder : ''} autoComplete={autoComplete} className={`
            w-full h-full bg-transparent
            ${sizes.input} ${styles.input}
            ${sizes.padding}
            outline-none
            ${label ? 'pt-3' : ''}
          `}/>

        {/* Right Icon */}
        {rightIcon && (<div className={`absolute right-4 top-1/2 -translate-y-1/2 ${styles.label}`}>
            <div className={sizes.icon}>{rightIcon}</div>
          </div>)}

        {/* Focus Ring Animation */}
        <AnimatePresence>
          {isFocused && !error && (<motion.div className="absolute inset-0 rounded-xl pointer-events-none" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={MICRO_CONFIG} style={{
                boxShadow: variant === 'neon'
                    ? '0 0 20px rgba(236, 72, 153, 0.5)'
                    : '0 0 0 4px rgba(236, 72, 153, 0.1)',
            }}/>)}
        </AnimatePresence>
      </motion.div>

      {/* Helper Text / Error Message */}
      <AnimatePresence mode="wait">
        {(error || helperText || showCharCount) && (<motion.div className="mt-2 flex items-start justify-between gap-2" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={MICRO_CONFIG}>
            {/* Error or Helper Text */}
            {(error || helperText) && (<p className={`text-sm ${error ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                {error || helperText}
              </p>)}

            {/* Character Count */}
            {showCharCount && maxLength && (<p className="text-sm text-gray-500 dark:text-gray-400 ml-auto whitespace-nowrap">
                {currentValue.length}/{maxLength}
              </p>)}
          </motion.div>)}
      </AnimatePresence>
    </div>);
};
export default PremiumInput;
//# sourceMappingURL=PremiumInput.jsx.map