/**
 * Web Input Component
 * Production-hardened input component for web applications
 */

import React, { useId } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      size = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label !== undefined && label !== '' && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon !== undefined && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block rounded-md border-gray-300 shadow-sm',
              'focus:border-blue-500 focus:ring-blue-500',
              'disabled:bg-gray-50 disabled:text-gray-500',
              error !== undefined && error !== '' && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              leftIcon !== undefined && 'pl-10',
              rightIcon !== undefined && 'pr-10',
              size === 'sm' && 'px-3 py-1.5 text-sm',
              size === 'md' && 'px-3 py-2 text-base',
              size === 'lg' && 'px-4 py-3 text-lg',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />

          {rightIcon !== undefined && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {((error !== undefined && error !== '') || (helperText !== undefined && helperText !== '')) && (
          <p
            className={cn(
              'text-sm',
              (error !== undefined && error !== '') ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {(error !== undefined && error !== '') ? error : (helperText !== undefined && helperText !== '') ? helperText : ''}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
