/**
 * 🔘 BUTTON COMPONENT - WEB VERSION
 * Matches mobile Button component API exactly
 * Uses theme tokens for consistent styling
 */

'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  href?: string;
  as?: React.ElementType;
  className?: string;
  onPress?: () => void;
}

const sizeStyles: Record<
  ButtonSize,
  { paddingVertical: number; paddingHorizontal: number; gap: number; fontSize: number }
> = {
  sm: { paddingVertical: 10, paddingHorizontal: 16, gap: 8, fontSize: 14 },
  md: { paddingVertical: 14, paddingHorizontal: 20, gap: 12, fontSize: 16 },
  lg: { paddingVertical: 18, paddingHorizontal: 24, gap: 16, fontSize: 18 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      title,
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      onPress,
      onClick,
      href,
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const theme = useTheme() as AppTheme;
    const { paddingVertical, paddingHorizontal, gap, fontSize } = sizeStyles[size];
    const isDisabled = disabled || loading;

    // Handle both onPress (mobile-style) and onClick (web-style)
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      if (onPress) {
        e.preventDefault();
        onPress();
      }
      if (onClick) {
        onClick(e);
      }
    };

    // Determine colors based on variant
    let backgroundColor = 'transparent';
    let borderColor = 'transparent';
    let textColor = theme.colors.onSurface;

    switch (variant) {
      case 'primary':
        backgroundColor = theme.colors.primary;
        textColor = theme.colors.onPrimary;
        break;
      case 'secondary':
        backgroundColor = theme.colors.primary; // Use primary for secondary in web
        textColor = theme.colors.onPrimary;
        break;
      case 'outline':
        borderColor = theme.colors.border;
        textColor = theme.colors.primary;
        break;
      case 'ghost':
      default:
        backgroundColor = 'transparent';
        textColor = theme.colors.onSurface;
        break;
    }

    const buttonContent = (
      <motion.button
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isDisabled && 'opacity-60 cursor-not-allowed',
          fullWidth && 'w-full',
          className
        )}
        style={{
          backgroundColor,
          borderColor,
          color: textColor,
          borderRadius: theme.radii.md,
          paddingTop: paddingVertical,
          paddingBottom: paddingVertical,
          paddingLeft: paddingHorizontal,
          paddingRight: paddingHorizontal,
          fontSize,
          borderWidth: variant === 'outline' ? 1 : 0,
        }}
        whileHover={!isDisabled ? {
          scale: 1.02,
          opacity: 0.9,
        } : {}}
        whileTap={!isDisabled ? {
          scale: 0.98,
        } : {}}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        aria-disabled={isDisabled}
        {...props}
      >
        <div
          className="flex items-center justify-center"
          style={{ gap }}
        >
          {loading ? (
            <div
              className="border-2 border-current border-t-transparent rounded-full animate-spin"
              style={{ width: 16, height: 16 }}
            />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <span className="flex-shrink-0">{icon}</span>
              )}
              <span>{title || children}</span>
              {icon && iconPosition === 'right' && (
                <span className="flex-shrink-0">{icon}</span>
              )}
            </>
          )}
        </div>
      </motion.button>
    );

    // If href is provided, wrap in Link
    if (href) {
      const LinkComponent = Component;
      return (
        <LinkComponent href={href} className="block">
          {buttonContent}
        </LinkComponent>
      );
    }

    return buttonContent;
  }
);

Button.displayName = 'Button';
export default Button;
//# sourceMappingURL=Button.jsx.map