import React, { type ReactNode } from "react";
import { View } from "react-native";

/**
 * GestureWrapper Component
 * Placeholder for gesture wrapper component
 * Note: Full implementation would integrate with gesture-handler
 */

interface GestureWrapperProps {
  children: ReactNode;
  onSwipe?: (direction: string) => void;
}

export const GestureWrapper: React.FC<GestureWrapperProps> = ({ 
  children, 
  onSwipe 
}) => {
  return <View>{children}</View>;
};

export default GestureWrapper;

