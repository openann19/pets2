/**
 * Web Textarea Component
 * Production-hardened textarea component for web applications
 */

import React, { useId } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label !== undefined && label !== '' && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block rounded-md border-gray-300 shadow-sm',
            'focus:border-blue-500 focus:ring-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            'resize-none', // Default to no resize, can be overridden
            error !== undefined && error !== '' && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            resize === 'vertical' && 'resize-y',
            resize === 'horizontal' && 'resize-x',
            resize === 'both' && 'resize',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
