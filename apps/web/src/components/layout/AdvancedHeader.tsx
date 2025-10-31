/**
 * 🚀 ADVANCED HEADER COMPONENT - WEB
 * Professional header with advanced hover effects, micro-interactions, and API integrations
 * Enterprise-level implementation matching mobile AdvancedHeader
 * Web adaptation with CSS backdrop-blur, Framer Motion animations, and vibration API
 */

'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  PlusIcon,
  PencilIcon,
  ShareIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { cn } from '@/lib/utils';

// Header Variants
export type HeaderVariant = 'default' | 'glass' | 'gradient' | 'premium' | 'minimal' | 'floating';

export type HeaderButtonType =
  | 'back'
  | 'close'
  | 'menu'
  | 'search'
  | 'filter'
  | 'settings'
  | 'profile'
  | 'add'
  | 'edit'
  | 'share'
  | 'more'
  | 'custom';

interface HeaderButton {
  type: HeaderButtonType;
  icon?: React.ReactNode;
  title?: string;
  onPress?: () => void | Promise<void>;
  apiAction?: () => Promise<unknown>;
  variant?: 'primary' | 'secondary' | 'glass' | 'minimal';
  haptic?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
  loading?: boolean;
  badge?: number;
  customComponent?: React.ReactNode;
}

interface AdvancedHeaderProps {
  title?: string;
  subtitle?: string;
  variant?: HeaderVariant;
  leftButtons?: HeaderButton[];
  rightButtons?: HeaderButton[];
  onBackPress?: () => void;
  showBackButton?: boolean;
  backgroundColor?: string;
  textColor?: string;
  blurIntensity?: number;
  gradientColors?: string[];
  className?: string;
  floating?: boolean;
  transparent?: boolean;
  apiActions?: {
    [key: string]: () => Promise<unknown>;
  };
}

// Icon mapping
const getButtonIcon = (type: HeaderButtonType, customIcon?: React.ReactNode): React.ReactNode => {
  if (customIcon) return customIcon;

  const iconClasses = 'w-5 h-5';

  switch (type) {
    case 'back':
      return <ArrowLeftIcon className={iconClasses} />;
    case 'close':
      return <XMarkIcon className={iconClasses} />;
    case 'menu':
      return <Bars3Icon className={iconClasses} />;
    case 'search':
      return <MagnifyingGlassIcon className={iconClasses} />;
    case 'filter':
      return <FunnelIcon className={iconClasses} />;
    case 'settings':
      return <Cog6ToothIcon className={iconClasses} />;
    case 'profile':
      return <UserCircleIcon className={iconClasses} />;
    case 'add':
      return <PlusIcon className={iconClasses} />;
    case 'edit':
      return <PencilIcon className={iconClasses} />;
    case 'share':
      return <ShareIcon className={iconClasses} />;
    case 'more':
      return <EllipsisVerticalIcon className={iconClasses} />;
    default:
      return <EllipsisVerticalIcon className={iconClasses} />;
  }
};

// Haptic feedback (vibration API)
const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 8,
      medium: 15,
      heavy: [25, 10, 15],
    };
    navigator.vibrate(patterns[intensity]);
  }
};

export const AdvancedHeader: React.FC<AdvancedHeaderProps> = ({
  title,
  subtitle,
  variant = 'default',
  leftButtons = [],
  rightButtons = [],
  onBackPress,
  showBackButton = true,
  backgroundColor,
  textColor,
  blurIntensity = 20,
  gradientColors,
  className,
  floating = false,
  transparent = false,
  apiActions = {},
}) => {
  const theme = useTheme() as AppTheme;
  const [isLoading, setIsLoading] = useState(false);

  const resolvedBackgroundColor = backgroundColor ?? theme.colors.bg;
  const resolvedTextColor = textColor ?? theme.colors.onSurface;
  const resolvedGradientColors = gradientColors ?? theme.palette.gradients.primary;

  // Handle Back Press
  const handleBackPress = useCallback(async () => {
    if (onBackPress) {
      triggerHaptic('light');
      await onBackPress();
    } else if (typeof window !== 'undefined') {
      triggerHaptic('light');
      window.history.back();
    }
  }, [onBackPress]);

  // Handle Button Press
  const handleButtonPress = useCallback(
    async (button: HeaderButton) => {
      if (button.disabled || button.loading) return;

      setIsLoading(true);
      triggerHaptic(button.haptic || 'light');

      try {
        // Execute API action if provided
        if (button.apiAction) {
          await button.apiAction();
        }

        // Execute custom onPress
        if (button.onPress) {
          await button.onPress();
        }

        // Execute API action from props
        const action = apiActions?.[button.type];
        if (action) {
          await action();
        }
      } catch (error) {
        console.error('Header button action failed:', error);
        triggerHaptic('heavy');
      } finally {
        setIsLoading(false);
      }
    },
    [apiActions],
  );

  // Get Button Variant
  const getButtonVariant = (button: HeaderButton): 'primary' | 'secondary' | 'glass' | 'minimal' => {
    if (button.variant) return button.variant;

    switch (button.type) {
      case 'back':
      case 'close':
        return 'minimal';
      case 'search':
      case 'filter':
        return 'glass';
      case 'add':
      case 'edit':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  // Render Button
  const renderButton = (button: HeaderButton, isLeft = true) => {
    if (button.customComponent) {
      return button.customComponent;
    }

    const icon = getButtonIcon(button.type, button.icon);
    const variant = getButtonVariant(button);
    const isDisabled = button.disabled || button.loading || isLoading;

    const baseClasses = 'relative inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-primary text-on-primary hover:bg-primary/90 focus:ring-primary',
      secondary: 'bg-surface text-on-surface hover:bg-surface/80 focus:ring-on-muted border border-border',
      glass: 'bg-white/10 backdrop-blur-md text-on-surface border border-white/20 hover:bg-white/20 focus:ring-white/50',
      minimal: 'bg-transparent text-on-surface hover:bg-surface/50 focus:ring-on-muted',
    };

    const sizeClasses = 'w-10 h-10';

    return (
      <motion.button
        onClick={() => handleButtonPress(button)}
        disabled={isDisabled}
        className={cn(baseClasses, variantClasses[variant], sizeClasses)}
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
      >
        {button.loading || isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {button.title && (
          <span className="sr-only">{button.title}</span>
        )}
        {button.badge && button.badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold text-white bg-danger rounded-full border-2 border-surface">
            {button.badge > 99 ? '99+' : button.badge}
          </span>
        )}
      </motion.button>
    );
  };

  // Get Header Styles
  const getHeaderStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
      minHeight: 56,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: `blur(${blurIntensity}px)`,
          WebkitBackdropFilter: `blur(${blurIntensity}px)`,
        };
      case 'gradient':
        return {
          ...baseStyles,
          background: transparent
            ? 'transparent'
            : `linear-gradient(135deg, ${resolvedGradientColors[0]} 0%, ${resolvedGradientColors[1]} 100%)`,
        };
      case 'premium':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'rgba(139, 92, 246, 0.2)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        };
      case 'minimal':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: theme.colors.border,
        };
      case 'floating':
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : resolvedBackgroundColor,
          borderRadius: theme.radii.lg,
          marginLeft: theme.spacing.md,
          marginRight: theme.spacing.md,
          marginTop: theme.spacing.sm,
          boxShadow: typeof theme.shadows.elevation2 === 'string' 
            ? theme.shadows.elevation2 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: transparent ? 'transparent' : resolvedBackgroundColor,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: theme.colors.border,
        };
    }
  };

  // Render Background
  const renderBackground = () => {
    switch (variant) {
      case 'glass':
        return null; // Handled by CSS backdrop-filter in styles
      case 'gradient':
        return (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${resolvedGradientColors[0]} 0%, ${resolvedGradientColors[1]} 100%)`,
            }}
          />
        );
      case 'premium':
        return (
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            }}
          />
        );
      default:
        return null;
    }
  };

  const headerStyle = getHeaderStyles();

  return (
    <div
      className={cn(
        'relative',
        floating ? 'sticky top-4 z-50' : 'sticky top-0 z-50',
        className
      )}
      style={{
        backgroundColor: theme.colors.bg,
      }}
    >
      <motion.div
        style={headerStyle}
        className="relative flex flex-row items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderBackground()}

        {/* Left Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showBackButton && (
            <motion.button
              onClick={handleBackPress}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-transparent text-on-surface hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-on-muted transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Go back"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </motion.button>
          )}
          {leftButtons.map((button, index) => (
            <div key={index} className="flex items-center">
              {renderButton(button, true)}
            </div>
          ))}
        </div>

        {/* Center Section */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-4 absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <AnimatePresence mode="wait">
            {title && (
              <motion.h1
                key="title"
                className="text-lg font-semibold truncate w-full text-center"
                style={{ color: resolvedTextColor }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {title}
              </motion.h1>
            )}
            {subtitle && (
              <motion.p
                key="subtitle"
                className="text-sm text-on-muted truncate w-full text-center mt-0.5"
                style={{ color: resolvedTextColor }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {subtitle}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightButtons.map((button, index) => (
            <div key={index} className="flex items-center">
              {renderButton(button, false)}
            </div>
          ))}
          {/* Spacer to balance layout when center content is present */}
          {title && leftButtons.length === 0 && !showBackButton && <div className="w-10" />}
        </div>
      </motion.div>
    </div>
  );
};

// Predefined Header Configurations
export const HeaderConfigs = {
  // Default header with back button
  default: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'default' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Glass morphism header
  glass: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'glass' as HeaderVariant,
    showBackButton: true,
    blurIntensity: 20,
    ...props,
  }),

  // Gradient header
  gradient: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'gradient' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Premium header
  premium: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'premium' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Minimal header
  minimal: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'minimal' as HeaderVariant,
    showBackButton: true,
    ...props,
  }),

  // Floating header
  floating: (props: Partial<AdvancedHeaderProps>) => ({
    variant: 'floating' as HeaderVariant,
    showBackButton: true,
    floating: true,
    ...props,
  }),
};

