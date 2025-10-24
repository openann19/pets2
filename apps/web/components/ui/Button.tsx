/**
 * Premium Button Component
 * Production-hardened React component with accessibility, security, and performance
 */

import React, { forwardRef, useCallback } from 'react';
import { logger } from '@pawfectmatch/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Button content */
  children: React.ReactNode;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler with error handling */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  /** Full width */
  fullWidth?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Haptic feedback enabled */
  haptic?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/25',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      onClick,
      fullWidth = false,
      leftIcon,
      rightIcon,
      haptic = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleClick = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      try {
        // Haptic feedback (would integrate with web haptic API if available)
        if (haptic && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
          navigator.vibrate(50);
        }

        // Call the onClick handler
        if (onClick !== undefined) {
          const result = onClick(event);

          // Handle async onClick
          if (result instanceof Promise) {
            await result;
          }
        }

        logger.debug('Button clicked', { variant, size });

      } catch (error) {
        logger.error('Button click error', {
          error: error instanceof Error ? error.message : String(error),
          variant,
          size,
        });

        // Re-throw to let parent handle
        throw error;
      }
    }, [onClick, loading, disabled, haptic, variant, size]);

    const isDisabled = disabled || loading;
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = variantStyles[variant];
    const sizeClasses = sizeStyles[size];
    const widthClasses = fullWidth ? 'w-full' : '';
    const shadowClasses = variant !== 'ghost' ? 'shadow-lg hover:shadow-xl' : '';

    const buttonClasses = [
      baseClasses,
      variantClasses,
      sizeClasses,
      widthClasses,
      shadowClasses,
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={buttonClasses}
        onClick={handleClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {leftIcon && !loading && (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span className={loading ? 'opacity-75' : ''}>
          {children}
        </span>

        {rightIcon && !loading && (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export types for use in other components
// ButtonProps is already exported above
