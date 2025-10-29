import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { Body, Heading2, EliteButtonPresets } from "@/components";
import { ShimmerPlaceholder } from "@/components/ShimmerPlaceholder";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing["4xl"],
      backgroundColor: theme.colors.layer1,
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.lg,
    },
    skeletonImage: {
      width: "100%",
      height: 320,
      borderRadius: theme.radii["3xl"],
    },
    skeletonRow: {
      flexDirection: "row",
      width: "100%",
      gap: theme.spacing.md,
    },
    skeletonBlock: {
      flex: 1,
      height: 80,
      borderRadius: theme.radii.xl,
    },
    textBlock: {
      width: "100%",
      height: 20,
      borderRadius: theme.radii.lg,
    },
    actions: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
  });

export const PetDetailsSkeleton: React.FC = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const imageRadius = theme.radii["3xl"];

  return (
    <View style={styles.container}>
      <ShimmerPlaceholder
        style={[styles.skeletonImage, { borderRadius: imageRadius }]}
        borderRadius={imageRadius}
        height={320}
      />
      <ShimmerPlaceholder style={styles.textBlock} height={28} />
      <ShimmerPlaceholder style={[styles.textBlock, { width: "60%" }]} />
      <View style={styles.skeletonRow}>
        <ShimmerPlaceholder style={styles.skeletonBlock} />
        <ShimmerPlaceholder style={styles.skeletonBlock} />
      </View>
      <ShimmerPlaceholder style={[styles.textBlock, { height: 120 }]} />
    </View>
  );
};

type ErrorStateProps = {
  error: string;
  onRetry: () => void;
};

export const PetDetailsErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Heading2 accessibilityRole="header">Unable to load pet</Heading2>
      <Body accessibilityRole="text">{error}</Body>
      <EliteButtonPresets.premium title="Retry" leftIcon="refresh" onPress={onRetry} />
    </View>
  );
};

type EmptyStateProps = {
  onDismiss: () => void;
};

export const PetDetailsEmptyState: React.FC<EmptyStateProps> = ({ onDismiss }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Heading2 accessibilityRole="header">Pet not found</Heading2>
      <Body accessibilityRole="text">
        This pet profile may have been removed or is no longer available for adoption.
      </Body>
      <EliteButtonPresets.glass
        title="Go back"
        leftIcon="arrow-back"
        onPress={onDismiss}
      />
    </View>
  );
};


