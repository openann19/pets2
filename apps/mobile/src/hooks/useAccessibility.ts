/**
 * useAccessibility Hook
 * 
 * Provides easy access to accessibility labels and utilities
 * for React Native components
 */

import { useMemo } from 'react';
import { accessibilityService } from '@/services/AccessibilityService';

export interface UseAccessibilityReturn {
  // Screen-specific labels
  getScreenLabels: (screenName: string) => Record<string, { label: string; hint?: string; role?: string }>;
  
  // Action labels
  getActionLabels: () => Record<string, { label: string; hint?: string; role?: string }>;
  
  // Form labels
  getFormLabels: () => Record<string, { label: string; hint?: string }>;
  
  // Feedback messages
  getFeedbackLabels: () => Record<string, string>;
  
  // Dynamic label generation
  generateListItemLabel: (itemType: string, itemName: string, position?: number, total?: number) => string;
  generateProgressLabel: (currentStep: number, totalSteps: number, stepName?: string) => string;
  generateNotificationLabel: (type: 'message' | 'match' | 'like' | 'system', count?: number) => string;
  
  // Validation
  validateProps: (props: {
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: string;
    accessible?: boolean;
  }) => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  
  // Accessibility state
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const accessibilityLabels = useMemo(() => {
    return accessibilityService.getAccessibilityLabels();
  }, []);

  const getScreenLabels = useMemo(() => {
    return (screenName: string) => {
      return accessibilityLabels.screens[screenName] || {};
    };
  }, [accessibilityLabels]);

  const getActionLabels = useMemo(() => {
    return () => accessibilityLabels.actions;
  }, [accessibilityLabels]);

  const getFormLabels = useMemo(() => {
    return () => accessibilityLabels.forms;
  }, [accessibilityLabels]);

  const getFeedbackLabels = useMemo(() => {
    return () => accessibilityLabels.feedback;
  }, [accessibilityLabels]);

  const generateListItemLabel = useMemo(() => {
    return (itemType: string, itemName: string, position?: number, total?: number) => {
      return accessibilityService.generateDynamicLabel('listItem', {
        itemType,
        itemName,
        position,
        total,
      });
    };
  }, []);

  const generateProgressLabel = useMemo(() => {
    return (currentStep: number, totalSteps: number, stepName?: string) => {
      return accessibilityService.generateDynamicLabel('progress', {
        currentStep,
        totalSteps,
        stepName,
      });
    };
  }, []);

  const generateNotificationLabel = useMemo(() => {
    return (type: 'message' | 'match' | 'like' | 'system', count?: number) => {
      return accessibilityService.generateDynamicLabel('notification', {
        notificationType: type,
        count,
      });
    };
  }, []);

  const validateProps = useMemo(() => {
    return (props: {
      accessibilityLabel?: string;
      accessibilityHint?: string;
      accessibilityRole?: string;
      accessible?: boolean;
    }) => {
      return accessibilityService.validateAccessibilityProps(props);
    };
  }, []);

  const isScreenReaderEnabled = useMemo(() => {
    return accessibilityService.isScreenReaderEnabled();
  }, []);

  const isReduceMotionEnabled = useMemo(() => {
    return accessibilityService.isReduceMotionEnabled();
  }, []);

  const isHighContrastEnabled = useMemo(() => {
    return accessibilityService.isHighContrastEnabled();
  }, []);

  return {
    getScreenLabels,
    getActionLabels,
    getFormLabels,
    getFeedbackLabels,
    generateListItemLabel,
    generateProgressLabel,
    generateNotificationLabel,
    validateProps,
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isHighContrastEnabled,
  };
};

export default useAccessibility;
