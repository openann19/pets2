import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EliteContainer } from "../elite/containers";
import { FXContainerPresets } from "../containers/FXContainer";
import { EliteButtonPresets } from "../buttons/EliteButton";
import { Heading2, Body } from "../typography/ModernTypography";
import { useTheme } from "../../theme";
import type { AppTheme } from "../../theme";
import { getExtendedColors } from "../../theme/adapters";

interface NoMorePetsStateProps {
  loadPets: () => void;
}

const makeStyles = (theme: AppTheme) => {
  const spacing = theme.spacing ?? {};
  return StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl ?? 24,
    },
    emptyCard: {
      padding: spacing["3xl"] ?? spacing["4xl"] ?? 32,
      alignItems: "center",
      gap: spacing.md ?? 16,
    },
    emptyTitle: {
      textAlign: "center",
      marginTop: spacing.lg ?? 16,
      marginBottom: spacing.md ?? 12,
    },
    emptySubtitle: {
      textAlign: "center",
      marginBottom: spacing.xl ?? 24,
    },
  });
};

export const NoMorePetsState: React.FC<NoMorePetsStateProps> = ({ loadPets }) => {
  const theme = useTheme();
  const colors = useMemo(() => getExtendedColors(theme), [theme]);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <EliteContainer gradient="primary">
      <View style={styles.emptyContainer}>
        <FXContainerPresets.glass style={styles.emptyCard}>
          <Ionicons name="heart-outline" size={80} color={colors.primary} />
          <Heading2 style={[styles.emptyTitle, { color: colors.onSurface }]}>No more pets!</Heading2>
          <Body style={[styles.emptySubtitle, { color: colors.onMuted }]}>Check back later for more matches</Body>
          <EliteButtonPresets.premium title="Refresh" leftIcon="refresh" onPress={loadPets} />
        </FXContainerPresets.glass>
      </View>
    </EliteContainer>
  );
};
