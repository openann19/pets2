import React from "react";
import { View } from "react-native";
import { useTheme } from "../../theme/useTheme";
import type { SpacingScale } from "../../theme/theme";

type SpacingKey = keyof SpacingScale;

interface SpacerProps {
  size?: SpacingKey;
  axis?: "vertical" | "horizontal";
}

export function Spacer({
  size = "md",
  axis = "vertical",
}: SpacerProps): React.ReactElement {
  const { spacing } = useTheme();
  const length = spacing[size];

  if (axis === "horizontal") {
    return <View style={{ width: length }} />;
  }

  return <View style={{ height: length }} />;
}
