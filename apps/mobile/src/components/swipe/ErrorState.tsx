import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EliteContainer } from "../elite/containers";
import FXContainer from "../containers/FXContainer";
import { FXContainerPresets } from "../containers/FXContainer";
import { EliteButtonPresets } from "../buttons/EliteButton";
import { Heading2, Body } from "../typography/ModernTypography";
import { Theme } from "../../theme";

interface ErrorStateProps {
  error: string;
  loadPets: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, loadPets }) => {
  return (
    <EliteContainer gradient="primary">
      <View style={styles.emptyContainer}>
        <FXContainer
          type="glow"
          hasGlow={true}
          glowColor={Theme.colors.status.error}
          style={styles.errorCard}
        >
          <Ionicons
            name="alert-circle-outline"
            size={80}
            color={Theme.colors.status.erro}r}}
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

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  errorCard: {
    padding: Theme.spacing["4xl"],
    alignItems: "center",
  },
  errorTitle: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    color: Theme.colors.status.error,
  },
  errorMessage: {
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.text.secondary,
  },
});
