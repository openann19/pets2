/**
 * Accessibility Service for PawfectMatch Mobile App
 * Provides WCAG 2.1 AA compliant accessibility features
 */
import { AccessibilityInfo, Platform } from 'react-native';
import React from 'react';
import type { AppTheme } from '@/theme';
import { getLightTheme } from '@/theme/resolve';
import type { NeutralStep } from '@/theme/contracts';

import { logger } from './logger';

interface AccessibilityConfig {
  isScreenReaderEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  preferredContentSizeCategory: string;
}

export interface AccessibleColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
}

const FALLBACK_SCHEME: AccessibleColorScheme = {
  primary: '#2563EB',
  secondary: '#64748B',
  background: '#FFFFFF',
  surface: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
};

const MIN_CONTRAST_RATIO = 4.5;

type RGB = [number, number, number];

type AccessibilitySubscription = { remove: () => void };

export class AccessibilityService {
  private static instance: AccessibilityService | undefined;
  private themeResolver: () => AppTheme;
  private subscriptions: AccessibilitySubscription[] = [];
  private config: AccessibilityConfig = {
    isScreenReaderEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    preferredContentSizeCategory: 'normal',
  };

  private constructor() {
    // Use getLightTheme from resolve.ts to get actual AppTheme (no cast needed)
    this.themeResolver = () => getLightTheme();
    void this.initializeAccessibility();
  }

  static getInstance(): AccessibilityService {
    if (AccessibilityService.instance === undefined) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  setThemeResolver(resolver: () => AppTheme): void {
    this.themeResolver = resolver;
  }

  /**
   * Initialize accessibility monitoring
   */
  private async initializeAccessibility(): Promise<void> {
    try {
      // Get initial accessibility settings
      const [
        screenReaderEnabled,
        boldTextEnabled,
        grayscaleEnabled,
        invertColorsEnabled,
        reduceMotionEnabled,
        reduceTransparencyEnabled,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isBoldTextEnabled(),
        AccessibilityInfo.isGrayscaleEnabled(),
        AccessibilityInfo.isInvertColorsEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isReduceTransparencyEnabled(),
      ]);

      this.config = {
        isScreenReaderEnabled: screenReaderEnabled,
        isBoldTextEnabled: boldTextEnabled,
        isGrayscaleEnabled: grayscaleEnabled,
        isInvertColorsEnabled: invertColorsEnabled,
        isReduceMotionEnabled: reduceMotionEnabled,
        isReduceTransparencyEnabled: reduceTransparencyEnabled,
        preferredContentSizeCategory: 'normal', // Would need native implementation
      };

      // Set up change listeners
      this.setupAccessibilityListeners();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('Failed to initialize accessibility', {
        component: 'AccessibilityService',
        context: 'initializeAccessibility',
        error: err,
      });
    }
  }

  /**
   * Setup accessibility change listeners
   * Stores subscriptions for cleanup to prevent memory leaks
   */
  private setupAccessibilityListeners(): void {
    // Clear any existing subscriptions before setting up new ones
    this.cleanup();

    this.subscriptions.push(
      AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
        this.config.isScreenReaderEnabled = enabled;
        this.notifyListeners();
      }),
    );

    this.subscriptions.push(
      AccessibilityInfo.addEventListener('boldTextChanged', (enabled) => {
        this.config.isBoldTextEnabled = enabled;
        this.notifyListeners();
      }),
    );

    this.subscriptions.push(
      AccessibilityInfo.addEventListener('grayscaleChanged', (enabled) => {
        this.config.isGrayscaleEnabled = enabled;
        this.notifyListeners();
      }),
    );

    this.subscriptions.push(
      AccessibilityInfo.addEventListener('invertColorsChanged', (enabled) => {
        this.config.isInvertColorsEnabled = enabled;
        this.notifyListeners();
      }),
    );

    this.subscriptions.push(
      AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        this.config.isReduceMotionEnabled = enabled;
        this.notifyListeners();
      }),
    );

    this.subscriptions.push(
      AccessibilityInfo.addEventListener('reduceTransparencyChanged', (enabled) => {
        this.config.isReduceTransparencyEnabled = enabled;
        this.notifyListeners();
      }),
    );
  }

  /**
   * Cleanup all accessibility event listeners
   * Prevents memory leaks across app reloads
   */
  cleanup(): void {
    this.subscriptions.forEach((subscription) => {
      try {
        subscription.remove();
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.warn('Failed to remove accessibility listener subscription', {
          component: 'AccessibilityService',
          context: 'cleanup',
          error: err,
        });
      }
    });
    this.subscriptions = [];
  }

  /**
   * Get current accessibility configuration
   */
  getAccessibilityConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Check if screen reader is enabled
   */
  isScreenReaderEnabled(): boolean {
    return this.config.isScreenReaderEnabled;
  }

  /**
   * Check if bold text is enabled
   */
  isBoldTextEnabled(): boolean {
    return this.config.isBoldTextEnabled;
  }

  /**
   * Check if reduce motion is enabled
   */
  isReduceMotionEnabled(): boolean {
    return this.config.isReduceMotionEnabled;
  }

  /**
   * Check if high contrast is enabled
   */
  isHighContrastEnabled(): boolean {
    return this.config.isGrayscaleEnabled || this.config.isInvertColorsEnabled;
  }

  /**
   * Get minimum touch target size (WCAG requirement: 44x44 points)
   */
  getMinimumTouchTargetSize(): { width: number; height: number } {
    return { width: 44, height: 44 };
  }

  /**
   * Announce content to screen readers
   */
  announceForAccessibility(message: string): void {
    try {
      AccessibilityInfo.announceForAccessibility(message);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('Failed to announce for accessibility', {
        component: 'AccessibilityService',
        context: 'announceForAccessibility',
        message,
        error: err,
      });
    }
  }

  /**
   * Set accessibility focus
   */
  setAccessibilityFocus(ref: React.RefObject<any> | null): void {
    try {
      if (Platform.OS === 'ios') {
        // iOS specific focus
        // React Native AccessibilityInfo doesn't expose setAccessibilityFocus
        // This would require a native module implementation
        if (ref?.current) {
          // Attempt to set focus if native module is available
          const accessibilityModule = AccessibilityInfo as AccessibilityInfo & {
            setAccessibilityFocus?: (ref: React.RefObject<any>) => void;
          };
          if (accessibilityModule.setAccessibilityFocus) {
            accessibilityModule.setAccessibilityFocus(ref);
          }
        }
      } else {
        // Android specific focus
        // Would need additional implementation
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('Failed to set accessibility focus', {
        component: 'AccessibilityService',
        context: 'setAccessibilityFocus',
        platform: Platform.OS,
        error: err,
      });
    }
  }

  /**
   * Get accessible text size multiplier
   */
  getTextSizeMultiplier(): number {
    // Map content size categories to multipliers
    const multipliers: Record<string, number> = {
      extraSmall: 0.8,
      small: 0.9,
      normal: 1.0,
      large: 1.1,
      extraLarge: 1.2,
      extraExtraLarge: 1.3,
      extraExtraExtraLarge: 1.4,
      accessibilityMedium: 1.5,
      accessibilityLarge: 1.6,
      accessibilityExtraLarge: 1.7,
      accessibilityExtraExtraLarge: 1.8,
      accessibilityExtraExtraExtraLarge: 2.0,
    };

    const multiplier = multipliers[this.config.preferredContentSizeCategory] ?? 1.0;

    logger.info('Calculated text size multiplier', {
      component: 'AccessibilityService',
      context: 'getTextSizeMultiplier',
      category: this.config.preferredContentSizeCategory,
      multiplier,
    });

    return multiplier;
  }

  /**
   * Check if content meets contrast requirements
   */
  meetsContrastRequirement(
    foregroundColor: string,
    backgroundColor: string,
    minimumRatio: number = MIN_CONTRAST_RATIO,
  ): boolean {
    const fg = AccessibilityService.parseColor(foregroundColor);
    const bg = AccessibilityService.parseColor(backgroundColor);

    if (!fg || !bg) {
      return true;
    }

    const ratio = AccessibilityService.contrastRatio(fg, bg);
    return ratio >= minimumRatio;
  }

  /**
   * Get accessibility-friendly color scheme
   * Uses structured logging for theme resolution failures
   */
  getAccessibleColorScheme(): AccessibleColorScheme {
    let theme: AppTheme | undefined;
    let themeResolutionError: Error | undefined;

    try {
      theme = this.themeResolver();
      logger.debug('Successfully resolved theme for accessible colors', {
        component: 'AccessibilityService',
        context: 'getAccessibleColorScheme',
        themeScheme: theme.scheme,
        isDark: theme.isDark,
        hasPalette: !!theme.palette,
        spacingKeys: Object.keys(theme.spacing),
      });
    } catch (error: unknown) {
      themeResolutionError = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to resolve theme for accessible colors', {
        component: 'AccessibilityService',
        context: 'getAccessibleColorScheme',
        error: themeResolutionError,
        fallback: 'using fallback colors',
        impact: 'accessibility color scheme may not match app theme',
      });
    }

    if (!theme) {
      logger.warn('No theme available, using fallback color scheme', {
        component: 'AccessibilityService',
        context: 'getAccessibleColorScheme',
        reason: themeResolutionError?.message || 'theme resolver failed',
        fallbackColors: FALLBACK_SCHEME,
      });
      return FALLBACK_SCHEME;
    }

    const colors = theme.colors;
    const palette = theme.palette;

    const getNeutral = (step: NeutralStep, fallback: string): string => {
      const candidate = palette.neutral?.[step];
      return typeof candidate === 'string' && candidate.length > 0 ? candidate : fallback;
    };

    const getBrand = (step: NeutralStep, fallback: string): string => {
      const candidate = palette.brand?.[step];
      return typeof candidate === 'string' && candidate.length > 0 ? candidate : fallback;
    };

    if (this.isHighContrastEnabled()) {
      const highContrastBackground = getNeutral(900, '#000000');
      const highContrastSurface = getNeutral(950, highContrastBackground);
      const highContrastText = getNeutral(50, '#FFFFFF');
      const highContrastTextSecondary = getNeutral(200, '#E5E5E5');

      return {
        primary: colors.onPrimary ?? highContrastText,
        secondary: highContrastTextSecondary,
        background: highContrastBackground,
        surface: highContrastSurface,
        text: highContrastText,
        textSecondary: highContrastTextSecondary,
        error: colors.danger ?? FALLBACK_SCHEME.error,
        success: colors.success ?? FALLBACK_SCHEME.success,
        warning: colors.warning ?? FALLBACK_SCHEME.warning,
      };
    }

    return {
      primary: colors.primary ?? FALLBACK_SCHEME.primary,
      secondary: getBrand(500, getNeutral(500, FALLBACK_SCHEME.secondary)),
      background: colors.bg ?? FALLBACK_SCHEME.background,
      surface: colors.surface ?? colors.bg ?? FALLBACK_SCHEME.surface,
      text: colors.onBg ?? colors.onSurface ?? FALLBACK_SCHEME.text,
      textSecondary: colors.onSurface ?? colors.onMuted ?? FALLBACK_SCHEME.textSecondary,
      error: colors.danger ?? FALLBACK_SCHEME.error,
      success: colors.success ?? FALLBACK_SCHEME.success,
      warning: colors.warning ?? FALLBACK_SCHEME.warning,
    };
  }

  // Event listeners
  private listeners: ((config: AccessibilityConfig) => void)[] = [];

  /**
   * Add accessibility change listener
   */
  addChangeListener(listener: (config: AccessibilityConfig) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of accessibility changes
   */
  private notifyListeners(): void {
    const config = this.getAccessibilityConfig();
    this.listeners.forEach((listener) => {
      try {
        listener(config);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.warn('Error notifying accessibility listener', {
          component: 'AccessibilityService',
          context: 'notifyListeners',
          listenerCount: this.listeners.length,
          error: err,
        });
      }
    });
  }

  private static parseColor(value: string): RGB | null {
    const normalized = value.trim();

    if (normalized.startsWith('#')) {
      const hex = normalized.slice(1);
      if (hex.length === 3) {
        const r = Number.parseInt(hex[0] + hex[0], 16);
        const g = Number.parseInt(hex[1] + hex[1], 16);
        const b = Number.parseInt(hex[2] + hex[2], 16);
        return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : [r, g, b] as RGB;
      }

      if (hex.length === 6) {
        const r = Number.parseInt(hex.substring(0, 2), 16);
        const g = Number.parseInt(hex.substring(2, 4), 16);
        const b = Number.parseInt(hex.substring(4, 6), 16);
        return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : [r, g, b] as RGB;
      }
    }

    const rgbMatch = normalized.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parsed = rgbMatch[1]
        .split(',')
        .slice(0, 3)
        .map((part) => Number.parseFloat(part.trim()));

      if (parsed.length === 3 && parsed.every((part) => Number.isFinite(part))) {
        const [red, green, blue] = parsed as [number, number, number];
        return [red, green, blue] as RGB;
      }
    }

    return null;
  }

  private static contrastRatio(foreground: RGB, background: RGB): number {
    const fgLuminance = AccessibilityService.relativeLuminance(foreground);
    const bgLuminance = AccessibilityService.relativeLuminance(background);
    const [lighter, darker] = fgLuminance > bgLuminance ? [fgLuminance, bgLuminance] : [bgLuminance, fgLuminance];
    return (lighter + 0.05) / (darker + 0.05);
  }

  private static relativeLuminance([red, green, blue]: RGB): number {
    const [r, g, b] = ([red, green, blue] as const).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Get comprehensive accessibility labels for common UI elements
   */
  getAccessibilityLabels(): {
    screens: Record<string, Record<string, { label: string; hint?: string; role?: string }>>;
    actions: Record<string, { label: string; hint?: string; role?: string }>;
    forms: Record<string, { label: string; hint?: string }>;
    feedback: Record<string, string>;
  } {
    return {
      screens: {
        login: {
          emailInput: {
            label: 'Email address input',
            hint: 'Enter your email address to sign in to your account',
            role: 'textbox',
          },
          passwordInput: {
            label: 'Password input',
            hint: 'Enter your password to sign in to your account',
            role: 'textbox',
          },
          signInButton: {
            label: 'Sign in button',
            hint: 'Tap to sign in to your PawfectMatch account',
            role: 'button',
          },
          forgotPasswordLink: {
            label: 'Forgot password link',
            hint: 'Tap to reset your password if you forgot it',
            role: 'link',
          },
          signUpLink: {
            label: 'Create account link',
            hint: 'Tap to create a new PawfectMatch account',
            role: 'link',
          },
        },
        swipe: {
          likeButton: {
            label: 'Like button',
            hint: 'Like this pet profile to potentially match',
            role: 'button',
          },
          superLikeButton: {
            label: 'Super like button',
            hint: 'Send a super like to this pet profile',
            role: 'button',
          },
          passButton: {
            label: 'Pass button',
            hint: 'Skip this pet profile',
            role: 'button',
          },
          rewindButton: {
            label: 'Rewind button',
            hint: 'Go back to the previous profile',
            role: 'button',
          },
          profileCard: {
            label: 'Pet profile card',
            hint: 'Swipe right to like, left to pass, or tap buttons for more options',
            role: 'image',
          },
        },
        matches: {
          matchItem: {
            label: 'Pet match',
            hint: 'Tap to view match details and start a conversation',
            role: 'button',
          },
          filterButton: {
            label: 'Filter matches',
            hint: 'Filter your matches by various criteria',
            role: 'button',
          },
          searchInput: {
            label: 'Search matches',
            hint: 'Search for specific pets or owners in your matches',
            role: 'searchbox',
          },
        },
        chat: {
          messageInput: {
            label: 'Message input',
            hint: 'Type your message to send',
            role: 'textbox',
          },
          sendButton: {
            label: 'Send message',
            hint: 'Tap to send your message',
            role: 'button',
          },
          attachmentButton: {
            label: 'Add attachment',
            hint: 'Add a photo or file to your message',
            role: 'button',
          },
          voiceButton: {
            label: 'Voice message',
            hint: 'Record and send a voice message',
            role: 'button',
          },
        },
        premium: {
          subscribeButton: {
            label: 'Subscribe to premium',
            hint: 'Start your premium subscription',
            role: 'button',
          },
          planCard: {
            label: 'Subscription plan',
            hint: 'Tap to select this subscription plan',
            role: 'button',
          },
          restoreButton: {
            label: 'Restore purchases',
            hint: 'Restore your previous purchases and subscriptions',
            role: 'button',
          },
          cancelButton: {
            label: 'Cancel subscription',
            hint: 'Cancel your premium subscription',
            role: 'button',
          },
        },
        settings: {
          deleteAccountButton: {
            label: 'Delete account',
            hint: 'Permanently delete your account and data',
            role: 'button',
          },
          signOutButton: {
            label: 'Sign out',
            hint: 'Sign out of your account',
            role: 'button',
          },
        },
      },
      actions: {
        like: {
          label: 'Like',
          hint: 'Like this pet profile',
          role: 'button',
        },
        pass: {
          label: 'Pass',
          hint: 'Skip this pet profile',
          role: 'button',
        },
        superLike: {
          label: 'Super like',
          hint: 'Send a super like to this pet profile',
          role: 'button',
        },
        rewind: {
          label: 'Rewind',
          hint: 'Go back to the previous profile',
          role: 'button',
        },
        sendMessage: {
          label: 'Send message',
          hint: 'Send your message to the match',
          role: 'button',
        },
        addPhoto: {
          label: 'Add photo',
          hint: 'Add a photo to your profile or message',
          role: 'button',
        },
        editProfile: {
          label: 'Edit profile',
          hint: 'Edit your profile information and pet details',
          role: 'button',
        },
        subscribe: {
          label: 'Subscribe',
          hint: 'Subscribe to premium features',
          role: 'button',
        },
        cancel: {
          label: 'Cancel',
          hint: 'Cancel the current action',
          role: 'button',
        },
        confirm: {
          label: 'Confirm',
          hint: 'Confirm the current action',
          role: 'button',
        },
      },
      forms: {
        email: {
          label: 'Email address',
          hint: 'Enter a valid email address',
        },
        password: {
          label: 'Password',
          hint: 'Enter a secure password',
        },
        confirmPassword: {
          label: 'Confirm password',
          hint: 'Re-enter your password to confirm',
        },
        petName: {
          label: 'Pet name',
          hint: 'Enter your pet\'s name',
        },
        petAge: {
          label: 'Pet age',
          hint: 'Enter your pet\'s age',
        },
        petBreed: {
          label: 'Pet breed',
          hint: 'Select or enter your pet\'s breed',
        },
        bio: {
          label: 'Bio',
          hint: 'Tell us about yourself and your pet',
        },
        location: {
          label: 'Location',
          hint: 'Enter your location or allow location access',
        },
      },
      feedback: {
        loading: 'Loading, please wait',
        success: 'Action completed successfully',
        error: 'An error occurred. Please try again',
        networkError: 'Network error. Please check your connection',
        noResults: 'No results found',
        emptyState: 'Nothing to show here',
        pullToRefresh: 'Pull down to refresh',
        loadingMore: 'Loading more items',
        endOfList: 'End of list reached',
      },
    };
  }

  /**
   * Generate accessibility label for dynamic content
   */
  generateDynamicLabel(type: 'listItem' | 'progress' | 'notification', params: {
    itemType?: string;
    itemName?: string;
    position?: number;
    total?: number;
    currentStep?: number;
    totalSteps?: number;
    stepName?: string;
    notificationType?: 'message' | 'match' | 'like' | 'system';
    count?: number;
  }): string {
    switch (type) {
      case 'listItem':
        if (params.position !== undefined && params.total !== undefined) {
          return `${params.itemType} ${params.itemName}, position ${params.position} of ${params.total}`;
        }
        return `${params.itemType} ${params.itemName}`;

      case 'progress':
        const base = `Step ${params.currentStep} of ${params.totalSteps}`;
        return params.stepName ? `${base}, ${params.stepName}` : base;

      case 'notification':
        if (params.count && params.count > 1) {
          return `${params.count} new ${params.notificationType}s`;
        }
        return `New ${params.notificationType}`;

      default:
        return 'Unknown item';
    }
  }

  /**
   * Validate accessibility compliance for an element
   */
  validateAccessibilityProps(props: {
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: string;
    accessible?: boolean;
  }): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required accessibilityLabel on interactive elements
    if (props.accessible !== false && 
        (props.accessibilityRole === 'button' || props.accessibilityRole === 'link') && 
        !props.accessibilityLabel) {
      errors.push('Interactive elements must have accessibilityLabel');
    }

    // Check for accessibilityHint on complex interactions
    if (props.accessibilityRole === 'adjustable' && !props.accessibilityHint) {
      warnings.push('Adjustable elements should have accessibilityHint');
    }

    // Check for proper role usage
    if (props.accessibilityRole && 
        !['button', 'link', 'search', 'image', 'text', 'adjustable', 'header', 'summary', 'none'].includes(props.accessibilityRole)) {
      warnings.push(`Unknown accessibilityRole: ${props.accessibilityRole}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// Export types
export type { AccessibilityConfig };
export default accessibilityService;
