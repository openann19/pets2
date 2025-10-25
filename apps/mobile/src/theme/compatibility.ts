/**
 * Theme Helper Compatibility Layer
 * 
 * This file provides compatibility functions for the new theme helper structure
 * to support code that was written against the old API.
 */

import { getTextColor, getBackgroundColor } from './helpers';

/**
 * Compatibility wrapper for getTextColor
 * Supports both old and new API patterns
 */
export function compatGetTextColor(variant?: 'primary' | 'secondary' | 'tertiary' | 'inverse'): string {
  if (variant) {
    return getTextColorString(variant);
  }
  return getTextColor().primary;
}

/**
 * Compatibility wrapper for getBackgroundColor
 * Supports both old and new API patterns
 */
export function compatGetBackgroundColor(variant?: 'primary' | 'secondary' | 'tertiary' | 'inverse'): string {
  if (variant) {
    return getBackgroundColorString(variant);
  }
  return getBackgroundColor().primary;
}

/**
 * Legacy text color string helper
 * @export
 */
export function getTextColorString(variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return getTextColor().primary;
    case 'secondary':
      return 'rgba(107, 114, 128, 1)'; // Theme.colors.text.secondary
    case 'tertiary':
      return 'rgba(156, 163, 175, 1)'; // Theme.colors.text.tertiary
    case 'inverse':
      return getTextColor().inverse;
    default:
      return getTextColor().primary;
  }
}

/**
 * Legacy background color string helper
 * @export
 */
export function getBackgroundColorString(variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return getBackgroundColor().primary;
    case 'secondary':
      return 'rgba(249, 250, 251, 1)'; // Theme.colors.background.secondary
    case 'tertiary':
      return 'rgba(243, 244, 246, 1)'; // Theme.colors.background.tertiary
    case 'inverse':
      return getBackgroundColor().inverse;
    default:
      return getBackgroundColor().primary;
  }
}

/**
 * Status color helper
 */
export function getStatusColor(status: 'success' | 'warning' | 'error' | 'info'): string {
  const statusColors = {
    success: '#22c55e',  // Theme.colors.status.success
    warning: '#f59e0b',  // Theme.colors.status.warning
    error: '#ef4444',    // Theme.colors.status.error
    info: '#3b82f6',     // Theme.colors.status.info
  };
  return statusColors[status];
}
