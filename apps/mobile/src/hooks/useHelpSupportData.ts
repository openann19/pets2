import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { matchesAPI } from "../services/api";
import { logger } from "@pawfectmatch/core";

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
      id: "faq",
      title: "FAQ",
      description: "Frequently asked questions",
      icon: "help-circle-outline",
      action: () => {
        Alert.alert("FAQ", "FAQ section coming soon!");
      },
    },
    {
      id: "contact",
      title: "Contact Support",
      description: "Get help from our support team",
      icon: "chatbubble-outline",
      action: () => {
        Alert.alert("Contact Support", "Support chat coming soon!");
      },
    },
    {
      id: "report-bug",
      title: "Report a Bug",
      description: "Help us improve by reporting issues",
      icon: "bug-outline",
      action: () => {
        Alert.alert("Report Bug", "Bug reporting feature coming soon!");
      },
    },
    {
      id: "safety",
      title: "Safety Center",
      description: "Safety tips and reporting tools",
      icon: "shield-checkmark-outline",
      action: () => {
        Alert.alert("Safety Center", "Navigate back to safety center");
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
    optionAnim1.value = withDelay(
      0,
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    optionAnim2.value = withDelay(
      150,
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    optionAnim3.value = withDelay(
      300,
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
    optionAnim4.value = withDelay(
      450,
      withSpring(1, { damping: 15, stiffness: 200 }),
    );
  }, [optionAnim1, optionAnim2, optionAnim3, optionAnim4]);

  // Create animated styles for each option
  const animatedStyles = [
    useAnimatedStyle(() => ({
      opacity: optionAnim1.value,
      transform: [
        { translateY: interpolate(optionAnim1.value, [0, 1], [20, 0]) },
      ],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim2.value,
      transform: [
        { translateY: interpolate(optionAnim2.value, [0, 1], [20, 0]) },
      ],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim3.value,
      transform: [
        { translateY: interpolate(optionAnim3.value, [0, 1], [20, 0]) },
      ],
    })),
    useAnimatedStyle(() => ({
      opacity: optionAnim4.value,
      transform: [
        { translateY: interpolate(optionAnim4.value, [0, 1], [20, 0]) },
      ],
    })),
  ];

  const handleHelpOption = useCallback((option: HelpOption) => {
    Haptics.selectionAsync().catch(() => {});
    option.action();
  }, []);

  const handleEmailSupport = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    const email = "support@pawfectmatch.com";
    const subject = "PawfectMatch Support Request";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Email Support", `Please email us at ${email}`);
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
