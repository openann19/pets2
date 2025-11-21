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
  const [faqData, setFaqData] = useState<
    Array<{
      id: string;
      category: string;
      question: string;
      answer: string;
    }>
  >([]);
  const [isLoadingFAQ, setIsLoadingFAQ] = useState(false);

  // Load FAQ data
  const loadFAQ = useCallback(async () => {
    setIsLoadingFAQ(true);
    try {
      const faq = await matchesAPI.getFAQ();
      setFaqData(faq);
    } catch (error) {
      logger.error("Failed to load FAQ", { error });
    } finally {
      setIsLoadingFAQ(false);
    }
  }, []);

  // Load FAQ on mount
  useEffect(() => {
    loadFAQ();
  }, [loadFAQ]);

  // Create help options with real functionality
  const helpOptions: HelpOption[] = [
    {
      id: "faq",
      title: "FAQ",
      description: "Frequently asked questions",
      icon: "help-circle-outline",
      action: () => {
        if (faqData.length > 0) {
          // Show FAQ data
          const faqText = faqData
            .map((item) => `${item.question}\n${item.answer}\n`)
            .join("\n");
          Alert.alert("FAQ", faqText);
        } else {
          Alert.alert("FAQ", "Loading FAQ data...");
        }
      },
    },
    {
      id: "contact",
      title: "Contact Support",
      description: "Get help from our support team",
      icon: "chatbubble-outline",
      action: () => {
        Alert.prompt(
          "Contact Support",
          "Please describe your issue:",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Send",
              onPress: async (message) => {
                if (message && message.trim()) {
                  try {
                    await matchesAPI.createSupportTicket({
                      subject: "Support Request",
                      message: message.trim(),
                      category: "other",
                      priority: "normal",
                    });
                    Alert.alert(
                      "Success",
                      "Your support request has been submitted. We'll get back to you within 24 hours.",
                    );
                  } catch (error) {
                    logger.error("Failed to create support ticket", { error });
                    Alert.alert(
                      "Error",
                      "Failed to submit support request. Please try again.",
                    );
                  }
                }
              },
            },
          ],
          "plain-text",
        );
      },
    },
    {
      id: "report-bug",
      title: "Report a Bug",
      description: "Help us improve by reporting issues",
      icon: "bug-outline",
      action: () => {
        Alert.prompt(
          "Report Bug",
          "Please describe the bug:",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Report",
              onPress: async (description) => {
                if (description && description.trim()) {
                  try {
                    await matchesAPI.submitBugReport({
                      title: "Bug Report",
                      description: description.trim(),
                      deviceInfo: "Mobile App",
                      appVersion: "1.0.0",
                    });
                    Alert.alert(
                      "Success",
                      "Thank you for reporting this bug! We'll investigate and fix it.",
                    );
                  } catch (error) {
                    logger.error("Failed to submit bug report", { error });
                    Alert.alert(
                      "Error",
                      "Failed to submit bug report. Please try again.",
                    );
                  }
                }
              },
            },
          ],
          "plain-text",
        );
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
