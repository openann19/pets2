import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EliteContainer } from "../elite/containers";
import { FXContainerPresets } from "../containers/FXContainer";
import { EliteButtonPresets } from "../buttons/EliteButton";
import { Heading2, Body } from "../typography/ModernTypography";
import { useTheme } from "@/theme";

interface NoMorePetsStateProps {
  loadPets: () => void;
}

export const NoMorePetsState: React.FC<NoMorePetsStateProps> = ({ loadPets }) => {
  const theme = useTheme();
  return (
    <EliteContainer gradient="primary">
      <View style={[styles.emptyContainer, { padding: theme.spacing.xl }]}>
        <FXContainerPresets.glass style={[styles.emptyCard, { padding: theme.spacing['4xl'] }]}>
          <Ionicons
            name="heart-outline"
            size={80}
            color={theme.colors.primary}
          />
          <Heading2 style={[styles.emptyTitle, { marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }]}>No more pets!</Heading2>
          <Body style={[styles.emptySubtitle, { marginBottom: theme.spacing.xl, color: theme.colors.onMuted }] }>
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
  },
  emptyCard: {
    alignItems: "center",
  },
  emptyTitle: {
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
  },
});
