import React, { type ReactNode } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

import { EliteContainer } from "./EliteContainer";
import { GlobalStyles } from "../../../styles/GlobalStyles";
import { Colors } from "../../../styles/GlobalStyles";

/**
 * EliteScrollContainer Component
 * Scrollable elite container with gradient background
 */

interface EliteScrollContainerProps extends ScrollViewProps {
  children: ReactNode;
  gradient?: keyof typeof Colors;
}

export const EliteScrollContainer: React.FC<EliteScrollContainerProps> = ({
  children,
  gradient = "gradientPrimary",
  ...props
}) => {
  return (
    <EliteContainer gradient={gradient}>
      <ScrollView
        contentContainerStyle={GlobalStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        {...props}
      >
        {children}
      </ScrollView>
    </EliteContainer>
  );
};

export default EliteScrollContainer;
