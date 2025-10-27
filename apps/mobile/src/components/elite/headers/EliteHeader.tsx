import React, { type ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Colors, Spacing, Shadows } from "../../../styles/GlobalStyles";

/**
 * EliteHeader Component
 * Premium header with blur effect, back button, and optional right component
 */

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  headerContainer: {
    backgroundColor: Colors.neutral[0],
    ...Shadows.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center" as const,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end" as const,
  },
  headerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.neutral[900],
    textAlign: "center" as const,
  },
  bodySmall: {
    fontSize: 12,
    color: Colors.neutral[600],
    textAlign: "center" as const,
    marginTop: 2,
  },
  headerBlur: {
    backgroundColor: Colors.neutral[0],
  },
  headerSolid: {
    backgroundColor: Colors.neutral[0],
  },
});

interface EliteHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  onBack?: () => void;
  rightComponent?: ReactNode;
  blur?: boolean;
}

export const EliteHeader: React.FC<EliteHeaderProps> = ({
  title,
  subtitle,
  showLogo: _showLogo = false,
  onBack,
  rightComponent,
  blur = true,
}) => {
  const triggerHaptic = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBackPress = () => {
    runOnJS(triggerHaptic)();
    onBack?.();
  };

  const HeaderContent = (
    <View style={styles.headerContent}>
      {onBack && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
      )}

      <View style={styles.headerTitleContainer}>
        <Text style={styles.heading2}>{title}</Text>
        {subtitle != null && subtitle.length > 0 && (
          <Text style={styles.bodySmall}>{subtitle}</Text>
        )}
      </View>

      <View style={styles.headerRight}>{rightComponent}</View>
    </View>
  );

  if (blur) {
    return (
      <View style={styles.headerSolid}>
        <BlurView intensity={95} style={{ flex: 1 }}>
          {HeaderContent}
        </BlurView>
      </View>
    );
  }

  return <View style={styles.headerContainer}>{HeaderContent}</View>;
};

export default EliteHeader;
