import React, { forwardRef, type ReactNode } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";
import type { ScrollView as ScrollViewType } from "react-native";

import { EliteContainer } from "./EliteContainer";
import { GlobalStyles } from "../../../animation";
import { Colors } from "../../../animation";

/**
 * EliteScrollContainer Component
 * Scrollable elite container with gradient background
 */

interface EliteScrollContainerProps extends ScrollViewProps {
  children: ReactNode;
  gradient?: string;
}

export const EliteScrollContainer = forwardRef<ScrollViewType, EliteScrollContainerProps>(({
  children,
  gradient = "gradientPrimary",
  ...props
}, ref) => {
  return (
    <EliteContainer gradient={gradient}>
      <ScrollView
        ref={ref}
        contentContainerStyle={GlobalStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        {...props}
      >
        {children}
      </ScrollView>
    </EliteContainer>
  );
});

EliteScrollContainer.displayName = "EliteScrollContainer";

export default EliteScrollContainer;
