import React from "react";
import { View, ActivityIndicator } from "react-native";

import { Colors } from "../../../styles/GlobalStyles";

/**
 * EliteLoading Component
 * Simple loading indicator with size and color customization
 */

interface EliteLoadingProps {
  size?: "small" | "large";
  color?: string;
}

export const EliteLoading: React.FC<EliteLoadingProps> = ({
  size = "large",
  color = Colors.primary,
}) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default EliteLoading;

