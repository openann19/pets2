/**
 * Accessibility Labels and Hints System
 * 
 * Provides comprehensive accessibility labels, hints, and roles
 * for screen readers across the PawfectMatch mobile app
 */

import { Platform } from 'react-native';

// Base accessibility interface
export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'search' | 'image' | 'text' | 'adjustable' | 'header' | 'summary' | 'none';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    busy?: boolean;
    checked?: boolean;
    expanded?: boolean;
  };
  accessible?: boolean;
}

// Screen-specific accessibility labels
export const SCREEN_LABELS = {
  // Authentication screens
  LOGIN: {
    emailInput: {
      accessibilityLabel: 'Email address input',
      accessibilityHint: 'Enter your email address to sign in to your account',
    },
    passwordInput: {
      accessibilityLabel: 'Password input',
      accessibilityHint: 'Enter your password to sign in to your account',
    },
    loginButton: {
      accessibilityLabel: 'Sign in button',
      accessibilityHint: 'Tap to sign in to your PawfectMatch account',
      accessibilityRole: 'button' as const,
    },
    forgotPasswordLink: {
      accessibilityLabel: 'Forgot password link',
      accessibilityHint: 'Tap to reset your password if you forgot it',
      accessibilityRole: 'link' as const,
    },
    signUpLink: {
      accessibilityLabel: 'Create account link',
      accessibilityHint: 'Tap to create a new PawfectMatch account',
      accessibilityRole: 'link' as const,
    },
  },

  REGISTER: {
    emailInput: {
      accessibilityLabel: 'Email address input',
      accessibilityHint: 'Enter your email address to create a new account',
    },
    passwordInput: {
      accessibilityLabel: 'Password input',
      accessibilityHint: 'Enter a secure password for your new account',
    },
    confirmPasswordInput: {
      accessibilityLabel: 'Confirm password input',
      accessibilityHint: 'Re-enter your password to confirm it',
    },
    createAccountButton: {
      accessibilityLabel: 'Create account button',
      accessibilityHint: 'Tap to create your new PawfectMatch account',
      accessibilityRole: 'button' as const,
    },
    termsCheckbox: {
      accessibilityLabel: 'Terms and conditions checkbox',
      accessibilityHint: 'You must agree to the terms to create an account',
      accessibilityRole: 'checkbox' as const,
    },
  },

  // Main navigation
  HOME: {
    profileTab: {
      accessibilityLabel: 'Profile tab',
      accessibilityHint: 'View and edit your profile information',
      accessibilityRole: 'tab' as const,
    },
    matchesTab: {
      accessibilityLabel: 'Matches tab',
      accessibilityHint: 'View your pet matches and compatibility scores',
      accessibilityRole: 'tab' as const,
    },
    messagesTab: {
      accessibilityLabel: 'Messages tab',
      accessibilityHint: 'View your conversations with other pet owners',
      accessibilityRole: 'tab' as const,
    },
    discoverTab: {
      accessibilityLabel: 'Discover tab',
      accessibilityHint: 'Find new pet matches in your area',
      accessibilityRole: 'tab' as const,
    },
    settingsTab: {
      accessibilityLabel: 'Settings tab',
      accessibilityHint: 'Manage your app settings and preferences',
      accessibilityRole: 'tab' as const,
    },
  },

  // Swipe screen
  SWIPE: {
    likeButton: {
      accessibilityLabel: 'Like button',
      accessibilityHint: 'Like this pet profile to potentially match',
      accessibilityRole: 'button' as const,
    },
    superLikeButton: {
      accessibilityLabel: 'Super like button',
      accessibilityHint: 'Send a super like to this pet profile',
      accessibilityRole: 'button' as const,
    },
    passButton: {
      accessibilityLabel: 'Pass button',
      accessibilityHint: 'Skip this pet profile',
      accessibilityRole: 'button' as const,
    },
    rewindButton: {
      accessibilityLabel: 'Rewind button',
      accessibilityHint: 'Go back to the previous profile',
      accessibilityRole: 'button' as const,
    },
    profileCard: {
      accessibilityLabel: 'Pet profile card',
      accessibilityHint: 'Swipe right to like, left to pass, or tap buttons for more options',
      accessibilityRole: 'image' as const,
    },
  },

  // Matches screen
  MATCHES: {
    matchItem: {
      accessibilityLabel: 'Pet match',
      accessibilityHint: 'Tap to view match details and start a conversation',
      accessibilityRole: 'button' as const,
    },
    filterButton: {
      accessibilityLabel: 'Filter matches',
      accessibilityHint: 'Filter your matches by various criteria',
      accessibilityRole: 'button' as const,
    },
    searchInput: {
      accessibilityLabel: 'Search matches',
      accessibilityHint: 'Search for specific pets or owners in your matches',
      accessibilityRole: 'search' as const,
    },
  },

  // Chat screen
  CHAT: {
    messageInput: {
      accessibilityLabel: 'Message input',
      accessibilityHint: 'Type your message to send',
      accessibilityRole: 'text' as const,
    },
    sendButton: {
      accessibilityLabel: 'Send message',
      accessibilityHint: 'Tap to send your message',
      accessibilityRole: 'button' as const,
    },
    attachmentButton: {
      accessibilityLabel: 'Add attachment',
      accessibilityHint: 'Add a photo or file to your message',
      accessibilityRole: 'button' as const,
    },
    voiceButton: {
      accessibilityLabel: 'Voice message',
      accessibilityHint: 'Record and send a voice message',
      accessibilityRole: 'button' as const,
    },
    messageItem: {
      accessibilityLabel: 'Message',
      accessibilityHint: 'Double tap to hear message details',
      accessibilityRole: 'text' as const,
    },
  },

  // Profile screen
  PROFILE: {
    editProfileButton: {
      accessibilityLabel: 'Edit profile',
      accessibilityHint: 'Edit your profile information and pet details',
      accessibilityRole: 'button' as const,
    },
    settingsButton: {
      accessibilityLabel: 'Settings',
      accessibilityHint: 'Open app settings and preferences',
      accessibilityRole: 'button' as const,
    },
    premiumButton: {
      accessibilityLabel: 'Upgrade to premium',
      accessibilityHint: 'View premium subscription options and benefits',
      accessibilityRole: 'button' as const,
    },
    photoGallery: {
      accessibilityLabel: 'Photo gallery',
      accessibilityHint: 'Swipe through photos, tap to view full screen',
      accessibilityRole: 'image' as const,
    },
  },

  // Settings screen
  SETTINGS: {
    notificationsSection: {
      accessibilityLabel: 'Notification settings',
      accessibilityHint: 'Manage your notification preferences',
      accessibilityRole: 'summary' as const,
    },
    privacySection: {
      accessibilityLabel: 'Privacy settings',
      accessibilityHint: 'Manage your privacy and data preferences',
      accessibilityRole: 'summary' as const,
    },
    accountSection: {
      accessibilityLabel: 'Account settings',
      accessibilityHint: 'Manage your account and subscription',
      accessibilityRole: 'summary' as const,
    },
    deleteAccountButton: {
      accessibilityLabel: 'Delete account',
      accessibilityHint: 'Permanently delete your account and data',
      accessibilityRole: 'button' as const,
    },
    signOutButton: {
      accessibilityLabel: 'Sign out',
      accessibilityHint: 'Sign out of your account',
      accessibilityRole: 'button' as const,
    },
  },

  // Premium/Subscription screens
  PREMIUM: {
    subscribeButton: {
      accessibilityLabel: 'Subscribe to premium',
      accessibilityHint: 'Start your premium subscription',
      accessibilityRole: 'button' as const,
    },
    planCard: {
      accessibilityLabel: 'Subscription plan',
      accessibilityHint: 'Tap to select this subscription plan',
      accessibilityRole: 'button' as const,
    },
    restoreButton: {
      accessibilityLabel: 'Restore purchases',
      accessibilityHint: 'Restore your previous purchases and subscriptions',
      accessibilityRole: 'button' as const,
    },
    cancelButton: {
      accessibilityLabel: 'Cancel subscription',
      accessibilityHint: 'Cancel your premium subscription',
      accessibilityRole: 'button' as const,
    },
  },

  // Payment screens
  PAYMENT: {
    cardNumberInput: {
      accessibilityLabel: 'Card number input',
      accessibilityHint: 'Enter your credit or debit card number',
    },
    expiryInput: {
      accessibilityLabel: 'Expiry date input',
      accessibilityHint: 'Enter your card expiry date in MMYY format',
    },
    cvvInput: {
      accessibilityLabel: 'CVV input',
      accessibilityHint: 'Enter your card security code',
    },
    payButton: {
      accessibilityLabel: 'Pay now button',
      accessibilityHint: 'Complete your payment and subscription',
      accessibilityRole: 'button' as const,
    },
  },

  // Map screen
  MAP: {
    searchInput: {
      accessibilityLabel: 'Search location',
      accessibilityHint: 'Search for a specific location or address',
      accessibilityRole: 'search' as const,
    },
    filterButton: {
      accessibilityLabel: 'Filter map results',
      accessibilityHint: 'Filter pets shown on the map',
      accessibilityRole: 'button' as const,
    },
    locationButton: {
      accessibilityLabel: 'Current location',
      accessibilityHint: 'Center the map on your current location',
      accessibilityRole: 'button' as const,
    },
    mapMarker: {
      accessibilityLabel: 'Pet location',
      accessibilityHint: 'Tap to view pet details at this location',
      accessibilityRole: 'button' as const,
    },
  },

  // Community screen
  COMMUNITY: {
    createPostButton: {
      accessibilityLabel: 'Create new post',
      accessibilityHint: 'Share a post with the community',
      accessibilityRole: 'button' as const,
    },
    postItem: {
      accessibilityLabel: 'Community post',
      accessibilityHint: 'Tap to view post details and comments',
      accessibilityRole: 'button' as const,
    },
    likeButton: {
      accessibilityLabel: 'Like post',
      accessibilityHint: 'Like this community post',
      accessibilityRole: 'button' as const,
    },
    commentButton: {
      accessibilityLabel: 'Comment on post',
      accessibilityHint: 'Add a comment to this post',
      accessibilityRole: 'button' as const,
    },
    shareButton: {
      accessibilityLabel: 'Share post',
      accessibilityHint: 'Share this post with others',
      accessibilityRole: 'button' as const,
    },
  },

  // Admin screens
  ADMIN: {
    dashboardSection: {
      accessibilityLabel: 'Admin dashboard',
      accessibilityHint: 'Overview of app statistics and user activity',
      accessibilityRole: 'summary' as const,
    },
    usersSection: {
      accessibilityLabel: 'User management',
      accessibilityHint: 'Manage user accounts and permissions',
      accessibilityRole: 'summary' as const,
    },
    analyticsSection: {
      accessibilityLabel: 'Analytics',
      accessibilityHint: 'View detailed app analytics and reports',
      accessibilityRole: 'summary' as const,
    },
    settingsSection: {
      accessibilityLabel: 'Admin settings',
      accessibilityHint: 'Configure admin and app settings',
      accessibilityRole: 'summary' as const,
    },
  },
} as const;

// Dynamic label generators
export class AccessibilityLabelGenerator {
  /**
   * Generate accessibility labels for lists with counts
   */
  static listItemLabel(itemType: string, itemName: string, position?: number, total?: number): string {
    if (position !== undefined && total !== undefined) {
      return `${itemType} ${itemName}, position ${position} of ${total}`;
    }
    return `${itemType} ${itemName}`;
  }

  /**
   * Generate accessibility labels for buttons with states
   */
  static buttonLabel(baseLabel: string, state?: 'selected' | 'disabled' | 'active'): string {
    switch (state) {
      case 'selected':
        return `${baseLabel}, selected`;
      case 'disabled':
        return `${baseLabel}, disabled`;
      case 'active':
        return `${baseLabel}, active`;
      default:
        return baseLabel;
    }
  }

  /**
   * Generate accessibility labels for form inputs with validation
   */
  static inputLabel(fieldName: string, isValid?: boolean, errorMessage?: string): {
    accessibilityLabel: string;
    accessibilityHint?: string;
    accessibilityState?: { disabled?: boolean; invalid?: boolean };
  } {
    const label = `${fieldName} input`;
    let hint: string | undefined;
    let state: { disabled?: boolean; invalid?: boolean } | undefined;

    if (!isValid && errorMessage) {
      hint = `Error: ${errorMessage}`;
      state = { invalid: true };
    }

    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityState: state,
    };
  }

  /**
   * Generate accessibility labels for image galleries
   */
  static imageLabel(imageType: string, currentIndex: number, totalImages: number): string {
    return `${imageType} ${currentIndex} of ${totalImages}`;
  }

  /**
   * Generate accessibility labels for progress indicators
   */
  static progressLabel(currentStep: number, totalSteps: number, stepName?: string): string {
    const base = `Step ${currentStep} of ${totalSteps}`;
    return stepName ? `${base}, ${stepName}` : base;
  }

  /**
   * Generate accessibility labels for notifications
   */
  static notificationLabel(type: 'message' | 'match' | 'like' | 'system', count?: number): string {
    if (count && count > 1) {
      return `${count} new ${type}s`;
    }
    return `New ${type}`;
  }
}

// Platform-specific accessibility helpers
export class PlatformAccessibility {
  /**
   * Get platform-specific accessibility hints
   */
  static getPlatformHint(baseHint: string): string {
    if (Platform.OS === 'ios') {
      return `${baseHint}. Double tap to activate.`;
    } else {
      return `${baseHint}. Double tap to select.`;
    }
  }

  /**
   * Get platform-specific role for interactive elements
   */
  static getPlatformRole(elementType: 'button' | 'link' | 'tab'): 'button' | 'link' | 'tab' {
    return elementType;
  }

  /**
   * Check if screen reader is active
   */
  static isScreenReaderActive(): Promise<boolean> {
    // This would integrate with Expo's AccessibilityInfo
    // For now, return false as placeholder
    return Promise.resolve(false);
  }
}

// Accessibility validation utilities
export class AccessibilityValidator {
  /**
   * Validate that an element has proper accessibility props
   */
  static validateAccessibilityProps(props: AccessibilityProps): {
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
    if (props.accessibilityRole && !['button', 'link', 'search', 'image', 'text', 'adjustable', 'header', 'summary', 'none'].includes(props.accessibilityRole)) {
      warnings.push(`Unknown accessibilityRole: ${props.accessibilityRole}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate accessibility audit report for a component
   */
  static generateAuditReport(componentName: string, elements: Array<{
    id: string;
    props: AccessibilityProps;
  }>): {
    component: string;
    totalElements: number;
    validElements: number;
    errors: Array<{ elementId: string; error: string }>;
    warnings: Array<{ elementId: string; warning: string }>;
    score: number;
  } {
    let validElements = 0;
    const errors: Array<{ elementId: string; error: string }> = [];
    const warnings: Array<{ elementId: string; warning: string }> = [];

    elements.forEach(element => {
      const validation = this.validateAccessibilityProps(element.props);
      if (validation.isValid) {
        validElements++;
      } else {
        validation.errors.forEach(error => {
          errors.push({ elementId: element.id, error });
        });
      }
      validation.warnings.forEach(warning => {
        warnings.push({ elementId: element.id, warning });
      });
    });

    const score = elements.length > 0 ? Math.round((validElements / elements.length) * 100) : 0;

    return {
      component: componentName,
      totalElements: elements.length,
      validElements,
      errors,
      warnings,
      score,
    };
  }
}

export default {
  SCREEN_LABELS,
  AccessibilityLabelGenerator,
  PlatformAccessibility,
  AccessibilityValidator,
};
