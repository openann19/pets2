import { LinearGradient } from 'expo-linear-gradient';
import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@mobile/src/theme';
import { GlobalStyles } from '../../../styles/GlobalStyles';

/**
 * EliteContainer Component
 * Premium container with gradient background and safe area handling
 */

interface EliteContainerProps {
  children: ReactNode;
  gradient?: string;
  style?: ViewStyle;
}

export const EliteContainer: React.FC<EliteContainerProps> = ({
  children,
  gradient = 'gradientPrimary',
  style,
}) => {
  const { colors } = useTheme();

  const gradientColors =
    (colors[gradient as keyof typeof colors] as string[]) ?? colors.gradientPrimary;

  return (
    <View style={[GlobalStyles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        style={GlobalStyles.backgroundGradient}
      />
      <SafeAreaView style={GlobalStyles.safeArea}>{children}</SafeAreaView>
    </View>
  );
};

export default EliteContainer;
