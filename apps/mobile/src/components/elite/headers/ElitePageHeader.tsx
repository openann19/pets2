import React from 'react';
import { Text, type TextStyle, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { GlobalStyles } from '../../../styles/GlobalStyles';

/**
 * ElitePageHeader Component
 * Full-page header with logo and title for landing pages
 */

interface ElitePageHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const ElitePageHeader: React.FC<ElitePageHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
}) => {
  return (
    <Animated.View style={GlobalStyles.header as never}>
      {showLogo && (
        <BlurView
          intensity={20}
          style={GlobalStyles.logoContainer}
        >
          <Text style={GlobalStyles.logo}>🐾 PawfectMatch</Text>
        </BlurView>
      )}
      <Text style={GlobalStyles.title as never}>{title}</Text>
      {subtitle != null && subtitle.length > 0 && (
        <Text style={GlobalStyles.subtitle as never}>{subtitle}</Text>
      )}
    </Animated.View>
  );
};

export default ElitePageHeader;
