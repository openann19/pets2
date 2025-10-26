import React from "react";
import { StyleSheet, View } from "react-native";

import { EliteButton, StaggeredContainer, FadeInUp } from "../EliteComponents";

interface SwipeActionsProps {
  onPass: () => void;
  onSuperLike: () => void;
  onLike: () => void;
}

export function SwipeActions({
  onPass,
  onSuperLike,
  onLike,
}: SwipeActionsProps) {
  return (
    <StaggeredContainer delay={100}>
      <View style={styles.actionButtons}>
        <FadeInUp delay={0}>
          <EliteButton
            title=""
            variant="glass"
            size="xl"
            icon="close"
            magnetic={true}
            ripple={true}
            glow={true}
            onPress={onPass}
            style={styles.actionButton}
          />
        </FadeInUp>

        <FadeInUp delay={100}>
          <EliteButton
            title=""
            variant="holographic"
            size="lg"
            icon="star"
            magnetic={true}
            ripple={true}
            glow={true}
            shimmer={true}
            onPress={onSuperLike}
            style={styles.actionButton}
          />
        </FadeInUp>

        <FadeInUp delay={200}>
          <EliteButton
            title=""
            variant="primary"
            size="xl"
            icon="heart"
            magnetic={true}
            ripple={true}
            glow={true}
            onPress={onLike}
            style={styles.actionButton}
          />
        </FadeInUp>
      </View>
    </StaggeredContainer>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
