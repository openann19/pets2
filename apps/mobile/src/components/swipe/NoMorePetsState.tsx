import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EliteContainer } from "../elite/containers";
import { FXContainerPresets } from "../containers/FXContainer";
import { EliteButtonPresets } from "../buttons/EliteButton";
import { Heading2, Body } from "../typography/ModernTypography";
import { Theme } from "../../theme";

interface NoMorePetsStateProps {
  loadPets: () => void;
}

export const NoMorePetsState: React.FC<NoMorePetsStateProps> = ({ loadPets }) => {
  return (
    <EliteContainer gradient="primary">
      <View style={styles.emptyContainer}>
        <FXContainerPresets.glass style={styles.emptyCard}>
          <Ionicons
            name="heart-outline"
            size={80}
            color={Theme.colors.primary[500}]}
          />
          <Heading2 style={styles.emptyTitle}>No more pets!</Heading2>
          <Body style={styles.emptySubtitle}>
            Check back later for more matches
          </Body>
          <EliteButtonPresets.premium
            title="Refresh"
            leftIcon="refresh"
            onPress={loadPets}
          />
        </FXContainerPresets.glass>
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
  emptyCard: {
    padding: Theme.spacing["4xl"],
    alignItems: "center",
  },
  emptyTitle: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.text.secondary,
  },
});
