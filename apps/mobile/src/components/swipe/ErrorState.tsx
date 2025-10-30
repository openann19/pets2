import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EliteContainer } from "../elite/containers";
import FXContainer from "../containers/FXContainer";
import { EliteButtonPresets } from "../buttons/EliteButton";
import { Heading2, Body } from "../typography/ModernTypography";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";
import { getExtendedColors } from "../../theme/adapters";
import type { ExtendedColors } from "../../theme/adapters";

interface ErrorStateProps {
  error: string;
  loadPets: () => void;
}

const makeStyles = (theme: AppTheme, colors: ExtendedColors) => {
  const spacing = theme.spacing ?? {};
  return StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl ?? 24,
    },
    errorCard: {
      padding: spacing["3xl"] ?? spacing.xl ?? 24,
      alignItems: "center",
    },
    errorTitle: {
      textAlign: "center",
      marginTop: spacing.lg ?? 16,
      marginBottom: spacing.md ?? 12,
      color: colors.danger,
    },
    errorMessage: {
      textAlign: "center",
      marginBottom: spacing.xl ?? 24,
      color: colors.textSecondary,
    },
  });
};

export const ErrorState: React.FC<ErrorStateProps> = ({ error, loadPets }) => {
  const theme = useTheme();
  const colors = useMemo(() => getExtendedColors(theme), [theme]);
  const styles = useMemo(() => makeStyles(theme, colors), [theme, colors]);

  return (
    <EliteContainer gradient="primary">
      <View style={styles.emptyContainer}>
        <FXContainer
          type="glow"
          hasGlow={true}
          glowColor={colors.danger}
          style={styles.errorCard}
        >
          <Ionicons
            name="alert-circle-outline"
            size={80}
            color={colors.danger}
          />
          <Heading2 style={styles.errorTitle}>Error loading pets</Heading2>
          <Body style={styles.errorMessage}>{error}</Body>
          <EliteButtonPresets.premium
            title="Try Again"
            leftIcon="refresh"
            onPress={loadPets}
          />
        </FXContainer>
      </View>
    </EliteContainer>
  );
};
