'use client';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
// Enhanced loading skeleton with shimmer effect
export const LoadingSkeleton = ({ variant = 'card', count = 1, className = '' }) => {
    const prefersReducedMotion = useReducedMotion();
    const variants = {
        card: 'h-32 rounded-lg',
        list: 'h-16 rounded-lg',
        table: 'h-12 rounded',
        chart: 'h-64 rounded-lg',
    };
    return (<div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (<motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className={`bg-gray-200 dark:bg-gray-700 ${variants[variant]} relative overflow-hidden`}>
          {!prefersReducedMotion && (<motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{
                    x: ['-100%', '100%'],
                }} transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}/>)}
        </motion.div>))}
    </div>);
};
// Accessibility hooks and components
export const SkipLink = ({ href, children }) => (<a href={href} className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded">
    {children}
  </a>);
export const useAnnouncement = () => {
    const announce = (message) => {
        const el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.className = 'sr-only';
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => document.body.removeChild(el), 1000);
    };
    return { announce };
};
export const useColorScheme = () => {
    const [scheme, setScheme] = useState('light');
    useEffect(() => {
        try {
            const media = window.matchMedia?.('(prefers-color-scheme: dark)');
            setScheme(media?.matches ? 'dark' : 'light');
        }
        catch {
            // Ignore errors in environments without matchMedia support
        }
    }, []);
    return scheme;
};
export const useFocusManagement = () => {
    let lastFocused = null;
    const saveFocus = () => {
        lastFocused = document.activeElement ?? null;
    };
    const restoreFocus = () => {
        if (lastFocused && typeof lastFocused.focus === 'function')
            lastFocused.focus();
    };
    const focusFirst = () => {
        const firstFocusable = document.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        firstFocusable?.focus();
    };
    return { saveFocus, restoreFocus, focusFirst };
};
export const useHighContrastMode = () => {
    const [highContrast, setHighContrast] = useState(false);
    useEffect(() => {
        try {
            const media = window.matchMedia?.('(prefers-contrast: more)');
            setHighContrast(!!media?.matches);
        }
        catch {
            // Ignore errors in environments without matchMedia support
        }
    }, []);
    return highContrast;
};
export { useReducedMotion };
// Enhanced button with multiple variants and animations
export const EnhancedButton = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, loading = false, icon, iconPosition = 'left', className = '', ariaLabel, }) => {
    const prefersReducedMotion = useReducedMotion();
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 shadow-sm hover:shadow-md',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
        glass: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 focus:ring-white/50',
    };
    const sizeKey = (size === 'sm' || size === 'md' || size === 'lg' ? size : 'md');
    const variantKey = (variant === 'primary' ||
        variant === 'secondary' ||
        variant === 'danger' ||
        variant === 'ghost' ||
        variant === 'gradient' ||
        variant === 'glass'
        ? variant
        : 'primary');
    const handleClick = () => {
        if (!disabled && !loading && onClick) {
            onClick();
        }
    };
    return (<motion.button onClick={handleClick} disabled={disabled || loading} aria-label={ariaLabel} className={`${baseClasses} ${sizeClasses[sizeKey]} ${variantClasses[variantKey]} ${className}`} whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}} whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}>
      {loading ? <motion.div className="mr-2" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"/>
      </motion.div> : null}

      {!loading && icon && iconPosition === 'left' ? <span className="mr-2">{icon}</span> : null}

      <span>{children}</span>

      {!loading && icon && iconPosition === 'right' ? <span className="ml-2">{icon}</span> : null}
    </motion.button>);
};
// Enhanced card with hover effects and animations
export const EnhancedCard = ({ children, className = '', hover = true, gradient = false, glass = false, onClick, ariaLabel, }) => {
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const baseClasses = 'rounded-xl shadow-lg border transition-all duration-300';
    const styleClasses = {
        default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-gray-700',
        glass: 'bg-white/10 backdrop-blur-sm border-white/20',
    };
    const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
    return (<motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: prefersReducedMotion ? 0 : 0.5 }} whileHover={!prefersReducedMotion && hover ? { scale: 1.02 } : {}} className={`${baseClasses} ${styleClasses[gradient ? 'gradient' : glass ? 'glass' : 'default']} ${hoverClasses} ${className}`} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} aria-label={ariaLabel} onKeyDown={onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }
            : undefined}>
      {children}
    </motion.div>);
};
// Enhanced input with floating labels and animations
export const EnhancedInput = ({ label, value, onChange, onInputChange, type = 'text', placeholder, required = false, disabled = false, error, helpText, icon, className = '', id, step, min, max, ariaLabel, }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(false);
    const inputRef = useRef(null);
    const prefersReducedMotion = useReducedMotion();
    useEffect(() => {
        setIsFilled(value.length > 0);
    }, [value]);
    const isLabelFloating = isFocused || isFilled;
    return (<div className={`relative ${className}`}>
      <div className="relative">
        {icon ? <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div> : null}

        <input ref={inputRef} id={id} type={type} value={value} onChange={(e) => {
            onChange(e.target.value);
            onInputChange?.(e);
        }} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder={placeholder} required={required} disabled={disabled} step={step} min={min} max={max} aria-label={ariaLabel} className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${icon ? 'pl-10' : ''} ${error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} ${disabled
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}`}/>

        {label ? <motion.label htmlFor={id} className={`absolute left-3 transition-all duration-200 pointer-events-none ${isLabelFloating
                ? 'top-1 text-xs text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-1'
                : 'top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400'}`} animate={!prefersReducedMotion
                ? {
                    y: isLabelFloating ? -8 : 0,
                    scale: isLabelFloating ? 0.85 : 1,
                }
                : {}}>
          {label}
          {required ? <span className="text-red-500 ml-1">*</span> : null}
        </motion.label> : null}
      </div>

      {helpText ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p> : null}

      {error ? <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600 dark:text-red-400">
        {error}
      </motion.p> : null}
    </div>);
};
// Enhanced modal with backdrop blur and animations
export const EnhancedModal = ({ isOpen, onClose, title, children, size = 'md', closeOnBackdrop = true, showCloseButton = true, }) => {
    const prefersReducedMotion = useReducedMotion();
    const modalRef = useRef(null);
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    };
    const modalSizeKey = size === 'sm' || size === 'md' || size === 'lg' || size === 'xl' || size === 'full' ? size : 'md';
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0 : 0.2 }} className="fixed inset-0 z-50 overflow-y-auto" onClick={closeOnBackdrop ? onClose : undefined}>
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0 : 0.2 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true"/>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <motion.div ref={modalRef} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: prefersReducedMotion ? 0 : 0.3 }} className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[modalSizeKey]} sm:w-full`} onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                {showCloseButton ? <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" aria-label="Close modal">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button> : null}
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>);
};
// Enhanced tooltip with animations
export const EnhancedTooltip = ({ children, content, position = 'top', delay = 200, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const prefersReducedMotion = useReducedMotion();
    const showTooltip = () => {
        if (timeoutId)
            clearTimeout(timeoutId);
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };
    const hideTooltip = () => {
        if (timeoutId)
            clearTimeout(timeoutId);
        setIsVisible(false);
    };
    const positionClasses = {
        top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    };
    const arrowClasses = {
        top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-100',
        bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-100',
        left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 dark:border-l-gray-100',
        right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 dark:border-r-gray-100',
    };
    return (<div className={`relative inline-block ${className}`} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {children}

      <AnimatePresence>
        {isVisible ? <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: prefersReducedMotion ? 0 : 0.2 }} className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg shadow-lg ${positionClasses[position]}`} role="tooltip">
          {content}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}/>
        </motion.div> : null}
      </AnimatePresence>
    </div>);
};
// Enhanced progress bar with animations
export const EnhancedProgressBar = ({ value, max = 100, label, showValue = true, size = 'md', variant = 'default', animated = true, className = '', }) => {
    const prefersReducedMotion = useReducedMotion();
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
    };
    const variantClasses = {
        default: 'bg-blue-600',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
        striped: 'bg-blue-600',
    };
    const sizePBKey = size === 'sm' || size === 'md' || size === 'lg' ? size : 'md';
    const variantPBKey = variant === 'default' || variant === 'gradient' || variant === 'striped' ? variant : 'default';
    return (<div className={`w-full ${className}`}>
      {label ? <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showValue ? <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round(percentage)}%
        </span> : null}
      </div> : null}

      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[sizePBKey]}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
        <motion.div className={`h-full transition-all ease-out ${variantClasses[variantPBKey]} ${variant === 'striped' ? 'bg-stripes' : ''}`} initial={animated && !prefersReducedMotion ? { width: 0 } : { width: `${percentage}%` }} animate={{ width: `${percentage}%` }} transition={{ duration: animated && !prefersReducedMotion ? 0.5 : 0 }}/>
      </div>
    </div>);
};
// Enhanced badge with animations
export const EnhancedBadge = ({ children, variant = 'default', size = 'md', animated = true, className = '' }) => {
    const prefersReducedMotion = useReducedMotion();
    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
    };
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
    };
    return (<motion.span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} initial={animated && !prefersReducedMotion ? { scale: 0.8, opacity: 0 } : {}} animate={animated && !prefersReducedMotion ? { scale: 1, opacity: 1 } : {}} transition={{ duration: 0.2 }} whileHover={animated && !prefersReducedMotion ? { scale: 1.05 } : {}}>
      {children}
    </motion.span>);
};
// Enhanced dropdown with animations
export const EnhancedDropdown = ({ label, options, value, onChange, placeholder, required = false, disabled = false, error, helpText, className = '', id, ariaLabel, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const prefersReducedMotion = useReducedMotion();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const selectedOption = options.find((option) => option.value === value);
    return (<div className={`relative ${className}`}>
      {label ? <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" id={id ? `${id}-label` : undefined}>
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label> : null}

      <div ref={dropdownRef} className="relative">
        <button type="button" onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} className={`w-full px-3 py-2 text-left border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} ${disabled
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer'}`} aria-haspopup="listbox" aria-expanded={isOpen} aria-label={ariaLabel ?? label} aria-labelledby={id && label ? `${id}-label` : undefined}>
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <motion.svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </motion.svg>
          </span>
        </button>

        <AnimatePresence>
          {isOpen ? <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: prefersReducedMotion ? 0 : 0.2 }} className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto" role="listbox">
            {options.map((option) => (<button key={option.value} type="button" onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                }} disabled={option.disabled} className={`w-full px-3 py-2 text-left text-sm transition-colors ${option.disabled
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'} ${value === option.value
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : ''}`} role="option" aria-selected={value === option.value}>
                {option.label}
              </button>))}
          </motion.div> : null}
        </AnimatePresence>
      </div>

      {helpText ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p> : null}

      {error ? <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-sm text-red-600 dark:text-red-400">
        {error}
      </motion.p> : null}
    </div>);
};
// Enhanced toast notification
export const EnhancedToast = ({ message, type = 'info', duration = 5000, onClose, action, }) => {
    const prefersReducedMotion = useReducedMotion();
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);
    const typeClasses = {
        success: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
        info: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
    };
    const typeIcons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };
    return (<motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }} transition={{ duration: prefersReducedMotion ? 0 : 0.3 }} className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 ${typeClasses[type]}`} role="alert" aria-live="assertive">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{typeIcons[type]}</span>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
          {action ? <div className="mt-2">
            <button onClick={action.onClick} className="text-sm font-medium underline hover:no-underline">
              {action.label}
            </button>
          </div> : null}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close notification">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>);
};
// Enhanced data table with sorting and animations
export const EnhancedDataTable = ({ data, columns, onSort, sortBy, sortDirection, className = '', }) => {
    const prefersReducedMotion = useReducedMotion();
    return (<div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (<th key={column.key} className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`} onClick={column.sortable
                ? () => onSort?.(column.key, sortDirection === 'asc' ? 'desc' : 'asc')
                : undefined}>
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortBy === column.key ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </motion.span> : null}
                </div>
              </th>))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (<motion.tr key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: prefersReducedMotion ? 0 : 0.3 }} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {columns.map((column) => (<td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '')}
                </td>))}
            </motion.tr>))}
        </tbody>
      </table>
    </div>);
};
//# sourceMappingURL=UIEnhancements.jsx.map