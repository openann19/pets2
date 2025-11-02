/**
 * Type definitions for @expo/vector-icons
 * Adds missing properties to fix TypeScript errors
 */

import { ComponentType } from "react";
import { TextStyle } from "react-native";

// Original IconProps interface from @expo/vector-icons
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

// Extend the Ionicons type to include glyphMap
declare module "@expo/vector-icons" {
  export const Ionicons: ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
    font: string;
    getFontFamily: () => string;
  };

  export const MaterialIcons: ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
  };

  export const FontAwesome: ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
  };

  export const MaterialCommunityIcons: ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
  };
}
