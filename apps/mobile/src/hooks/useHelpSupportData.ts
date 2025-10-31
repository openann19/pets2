import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { logger } from '@pawfectmatch/core';
import { springs } from '@/foundation/motion';

export interface HelpOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export interface UseHelpSupportDataReturn {
  helpOptions: HelpOption[];
  animatedStyles: Array<ReturnType<typeof useAnimatedStyle>>;
  handleHelpOption: (option: HelpOption) => void;
  handleEmailSupport: () => void;
}

export function useHelpSupportData(): UseHelpSupportDataReturn {
  // Create help options with navigation action
  const helpOptions: HelpOption[] = [
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: 'help-circle-outline',
      action: async () => {
        try {
          const url = 'https://pawfectmatch.com/faq';
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            logger.info('FAQ opened', { url });
          } else {
            Alert.alert('FAQ', `Visit ${url} to view frequently asked questions.`);
          }
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          logger.error('Failed to open FAQ', { error: errorObj });
          Alert.alert('Error', 'Unable to open FAQ page.');
        }
      },
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'chatbubble-outline',
      action: async () => {
        try {
          const email = 'support@pawfectmatch.com';
          const subject = 'Support Request';
          const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            logger.info('Contact support opened', { email });
          } else {
            Alert.alert('Contact Support', `Please email us at ${email}`);
          }
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          logger.error('Failed to open contact support', { error: errorObj });
          Alert.alert(
            'Error',
            'Unable to open email app. Please contact support@pawfectmatch.com manually.',
          );
        }
      },
    },
    {
      id: 'report-bug',
      title: 'Report a Bug',
      description: 'Help us improve by reporting issues',
      icon: 'bug-outline',
      action: async () => {
        try {
          const email = 'support@pawfectmatch.com';
          const subject = 'Bug Report';
          const body = 'Please describe the bug you encountered:';
          const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            logger.info('Bug report email opened', { email });
          } else {
            Alert.alert('Report Bug', `Please email us at ${email} with details about the bug.`);
          }
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          logger.error('Failed to open bug report', { error: errorObj });
          Alert.alert(
            'Error',
            'Unable to open email app. Please email support@pawfectmatch.com with bug details.',
          );
        }
      },
    },
    {
      id: 'safety',
      title: 'Safety Center',
      description: 'Safety tips and reporting tools',
      icon: 'shield-checkmark-outline',
      action: () => {
        // This would navigate to Safety Center screen
        logger.info('Navigate to Safety Center');
        Alert.alert('Safety Center', 'Please navigate to Safety Center from Settings screen.');
      },
    },
  ];

  // Staggered entrance animations for help options
  const optionAnim1 = useSharedValue(0);
  const optionAnim2 = useSharedValue(0);
  const optionAnim3 = useSharedValue(0);
  const optionAnim4 = useSharedValue(0);

  // Trigger staggered animations on mount
  React.useEffect(() => {
    optionAnim1.value = withDelay(0, withSpring(1, springs.standard));
    optionAnim2.value = withDelay(150, withSpring(1, springs.standard));
    optionAnim3.value = withDelay(300, withSpring(1, springs.standard));
    optionAnim4.value = withDelay(450, withSpring(1, springs.standard));
  }, [optionAnim1, optionAnim2, optionAnim3, optionAnim4]);

  // Create animated styles for each option
  const animatedStyles = [
    useAnimatedStyle(() => ({
      opacity: optionAnim1.value,
      transform: [{ translateY: interpolate(optionAnim1.value, [0, 1], [20, 0]) }],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim2.value,
      transform: [{ translateY: interpolate(optionAnim2.value, [0, 1], [20, 0]) }],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim3.value,
      transform: [{ translateY: interpolate(optionAnim3.value, [0, 1], [20, 0]) }],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim4.value,
      transform: [{ translateY: interpolate(optionAnim4.value, [0, 1], [20, 0]) }],
    })),
  ];

  const handleHelpOption = useCallback((option: HelpOption) => {
    Haptics.selectionAsync().catch(() => {});
    option.action();
  }, []);

  const handleEmailSupport = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    const email = 'support@pawfectmatch.com';
    const subject = 'PawfectMatch Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Email Support', `Please email us at ${email}`);
      }
    });
  }, []);

  return {
    helpOptions,
    animatedStyles,
    handleHelpOption,
    handleEmailSupport,
  };
}
