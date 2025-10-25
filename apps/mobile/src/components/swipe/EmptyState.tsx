import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import EliteButton from "../buttons/EliteButton";
import {
  GlowContainer,
  PremiumHeading,
  PremiumBody,
} from "../PremiumComponents";

interface EmptyStateProps {
  type: "error" | "empty";
  title: string;
  subtitle: string;
  buttonTitle: string;
  onButtonPress: () => void;
}

export function EmptyState({
  type,
  title,
  subtitle,
  buttonTitle,
  onButtonPress,
}: EmptyStateProps) {
  const isError = type === "error";

  return (
    <View style={styles.emptyContainer}>
      <GlowContainer
        color={isError ? "error" : "primary"}
        intensity={isError ? "medium" : "light"}
        animated={true}
      >
        <Ionicons
          name={isError ? "alert-circle-outline" : "heart-outline"}
          size={80}
          color={isError ? "#ff6b6b" : "#ec4899"}
        />
      </GlowContainer>
      <PremiumHeading level={2} gradient="primary" animated={true}>
        {title}
      </PremiumHeading>
      <PremiumBody size="base" weight="regular">
        {subtitle}
      </PremiumBody>
      <EliteButton
        title={buttonTitle}
        variant={isError ? "primary" : "premium"}
        size="lg"
        leftIcon="refresh"
        magneticEffect={true}
        rippleEffect={true}
        glowEffect={true}
        onPress={onButtonPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
});
