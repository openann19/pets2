import React, { type ComponentProps } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Spacing } from "../../../animation";

/**
 * EliteEmptyState Component
 * Empty state indicator with icon, title, and message
 */

interface EliteEmptyStateProps {
  icon?: string;
  title: string;
  message: string;
}

export const EliteEmptyState: React.FC<EliteEmptyStateProps> = ({
  icon = "ellipse-outline",
  title,
  message,
}) => {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: Spacing.xl,
      }}
    >
      <Ionicons
        name={icon as ComponentProps<typeof Ionicons>["name"]}
        size={64}
        color={Colors.gray400}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginTop: Spacing.lg,
          color: Colors.gray700,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          marginTop: Spacing.sm,
          color: Colors.gray600,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default EliteEmptyState;
