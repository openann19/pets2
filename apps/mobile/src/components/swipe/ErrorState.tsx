import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EliteContainer } from "../elite/containers";
import FXContainer from "../containers/FXContainer";
import { FXContainerPresets } from "../containers/FXContainer";
import { EliteButtonPresets } from "../buttons/EliteButton";
import { Heading2, Body } from "../typography/ModernTypography";
import { useTheme } from "@/theme";

interface ErrorStateProps {
  error: string;
  loadPets: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, loadPets }) => {
  const theme = useTheme();
  return (
    <EliteContainer gradient="primary">
      <View style={[styles.emptyContainer, { padding: theme.spacing.xl }]}>
        <FXContainer
          type="glow"
          hasGlow={true}
          glowColor={theme.colors.danger}
          style={[styles.errorCard, { padding: theme.spacing['4xl'] }]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={80}
            color={theme.colors.danger}
          />
          <Heading2 style={[styles.errorTitle, { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md, color: theme.colors.danger }]}>Error loading pets</Heading2>
          <Body style={[styles.errorMessage, { marginBottom: theme.spacing.xl, color: theme.colors.onMuted }]}>{error}</Body>
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

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorCard: {
    alignItems: "center",
  },
  errorTitle: {
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
  },
});
