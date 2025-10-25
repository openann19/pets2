import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { hapticFeedback } from "../../services/HapticFeedbackService";
import type { CallData } from "../../services/WebRTCService";
import { useIncomingCallAccessibility } from "./hooks/useIncomingCallAccessibility";
import { useColors, useTheme } from "../../theme";
import type { ColorPalette, Theme as ThemeType } from "../../theme";

interface IncomingCallScreenProps {
  callData: CallData;
  onAnswer: () => void;
  onReject: () => void;
}

const DEFAULT_ANIMATION_RANGE = [0, 1] as const;

const createNumericInterpolation = (
  value: Animated.Value,
  outputRange: readonly [number, number],
  inputRange: readonly [number, number] = DEFAULT_ANIMATION_RANGE,
): Animated.AnimatedInterpolation<number> =>
  value.interpolate({
    inputRange: [...inputRange],
    outputRange: [...outputRange],
  });

export default function IncomingCallScreen({
  callData,
  onAnswer,
  onReject,
}: IncomingCallScreenProps) {
  const colors = useColors();
  const theme = useTheme();
  const {
    isReduceMotionEnabled,
    containerAccessibility,
    answerButtonAccessibility,
    rejectButtonAccessibility,
    messageButtonAccessibility,
    profileButtonAccessibility,
  } = useIncomingCallAccessibility(callData);

  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const slideAnim = useMemo(() => new Animated.Value(0), []);

  const styles = useMemo(
    () => createStyles({ colors, theme }),
    [colors, theme],
  );

  const backgroundGradient = useMemo(
    () => theme.gradients.holographic ?? theme.gradients.primary,
    [theme.gradients.holographic, theme.gradients.primary],
  );

  const headerTranslateY = useMemo(
    () => createNumericInterpolation(slideAnim, [-50, 0] as const),
    [slideAnim],
  );

  const callerInfoScale = useMemo(
    () => createNumericInterpolation(slideAnim, [0.8, 1] as const),
    [slideAnim],
  );

  const actionsTranslateY = useMemo(
    () => createNumericInterpolation(slideAnim, [100, 0] as const),
    [slideAnim],
  );

  const headerAnimatedStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [{ translateY: headerTranslateY }],
    }),
    [headerTranslateY],
  );

  const callerInfoAnimatedStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [{ scale: callerInfoScale }],
    }),
    [callerInfoScale],
  );

  const avatarPulseStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [{ scale: pulseAnim }],
    }),
    [pulseAnim],
  );

  const actionsAnimatedStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [{ translateY: actionsTranslateY }],
    }),
    [actionsTranslateY],
  );

  const additionalActionsAnimatedStyle = useMemo<
    Animated.WithAnimatedObject<ViewStyle>
  >(
    () => ({
      opacity: slideAnim,
    }),
    [slideAnim],
  );

  useEffect(() => {
    if (isReduceMotionEnabled) {
      pulseAnim.stopAnimation();
      slideAnim.stopAnimation();
      pulseAnim.setValue(1);
      slideAnim.setValue(1);

      return () => {
        void hapticFeedback.stop();
      };
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    const slideAnimation = Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });

    pulseAnimation.start();
    slideAnimation.start();

    void hapticFeedback.triggerCustomPattern();

    return () => {
      pulseAnimation.stop();
      slideAnimation.stop();
      void hapticFeedback.stop();
    };
  }, [isReduceMotionEnabled, pulseAnim, slideAnim]);

  const handleAnswer = () => {
    void hapticFeedback.triggerSuccess();
    onAnswer();
  };

  const handleReject = () => {
    void hapticFeedback.triggerError();
    onReject();
  };

  const formatCallType = (type: CallData["callType"]) => {
    return type === "video" ? "Video Call" : "Voice Call";
  };

  return (
    <View
      style={styles.container}
      testID="incoming-call-container"
      {...containerAccessibility}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={backgroundGradient}
        style={styles.backgroundGradient}
      />

      {/* Blur Overlay */}
      <BlurView intensity={20} style={styles.blurOverlay} />

      <SafeAreaView style={styles.content}>
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.incomingCallText}>Incoming Call</Text>
          <Text style={styles.callTypeText}>
            {formatCallType(callData.callType)}
          </Text>
        </Animated.View>

        {/* Caller Info */}
        <Animated.View style={[styles.callerInfo, callerInfoAnimatedStyle]}>
          {/* Avatar with pulsing effect */}
          <Animated.View style={[styles.avatarContainer, avatarPulseStyle]}>
            <View style={styles.avatarRing}>
              <Image
                source={
                  callData.callerAvatar != null && callData.callerAvatar !== ""
                    ? { uri: callData.callerAvatar }
                    : require("../../assets/default-avatar.png")
                }
                style={styles.avatar}
                testID="caller-avatar"
              />
            </View>
          </Animated.View>

          <Text style={styles.callerName}>{callData.callerName}</Text>
          <Text style={styles.callerSubtext}>PawfectMatch</Text>
        </Animated.View>

        {/* Call Actions */}
        <Animated.View style={[styles.actionsContainer, actionsAnimatedStyle]}>
          {/* Reject Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            activeOpacity={0.8}
            testID="reject-button"
            {...rejectButtonAccessibility}
          >
            <LinearGradient
              colors={theme.gradients.error}
              style={styles.buttonGradient}
            >
              <Ionicons
                name="call"
                size={32}
                color={colors.textInverse}
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </LinearGradient>
          </TouchableOpacity>

          {/* Answer Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.answerButton]}
            onPress={handleAnswer}
            activeOpacity={0.8}
            testID="answer-button"
            {...answerButtonAccessibility}
          >
            <LinearGradient
              colors={theme.gradients.success}
              style={styles.buttonGradient}
            >
              <Ionicons name="call" size={32} color={colors.textInverse} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Additional Actions */}
        <Animated.View
          style={[styles.additionalActions, additionalActionsAnimatedStyle]}
        >
          <TouchableOpacity
            style={styles.additionalButton}
            {...messageButtonAccessibility}
          >
            <Ionicons name="chatbubble" size={24} color={colors.textInverse} />
            <Text style={styles.additionalButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.additionalButton}
            {...profileButtonAccessibility}
          >
            <Ionicons name="person" size={24} color={colors.textInverse} />
            <Text style={styles.additionalButtonText}>Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

interface CreateStylesParams {
  colors: ColorPalette;
  theme: ThemeType;
}

const createStyles = ({ colors, theme }: CreateStylesParams) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backgroundGradient: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    blurOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    content: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
    },
    header: {
      alignItems: "center",
      marginTop: theme.spacing["3xl"],
    },
    incomingCallText: {
      fontSize: theme.typography.fontSize.lg,
      color: colors.text,
      opacity: 0.8,
      marginBottom: theme.spacing.xs,
    },
    callTypeText: {
      fontSize: theme.typography.fontSize.base,
      color: colors.textSecondary,
      opacity: 0.8,
    },
    callerInfo: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    avatarContainer: {
      marginBottom: theme.spacing.xl,
    },
    avatarRing: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 4,
      borderColor: colors.borderLight,
      padding: theme.spacing.sm,
      backgroundColor: theme.glass.light.backgroundColor,
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 92,
      backgroundColor: colors.surface,
    },
    callerName: {
      fontSize: theme.typography.fontSize["3xl"],
      fontWeight: theme.typography.fontWeight.bold,
      color: colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: "center",
    },
    callerSubtext: {
      fontSize: theme.typography.fontSize.lg,
      color: colors.textSecondary,
      opacity: 0.8,
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginBottom: theme.spacing["2xl"],
    },
    actionButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      elevation: theme.shadows.depth.lg.elevation,
      shadowColor: theme.shadows.depth.lg.shadowColor,
      shadowOffset: theme.shadows.depth.lg.shadowOffset,
      shadowOpacity: theme.shadows.depth.lg.shadowOpacity,
      shadowRadius: theme.shadows.depth.lg.shadowRadius,
    },
    rejectButton: {},
    answerButton: {},
    buttonGradient: {
      width: "100%",
      height: "100%",
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    additionalActions: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: theme.spacing.xl,
    },
    additionalButton: {
      alignItems: "center",
      padding: theme.spacing.sm,
    },
    additionalButtonText: {
      color: colors.textInverse,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
      opacity: 0.8,
    },
  });
