import React from 'react';
import { View, ActivityIndicator, type ColorValue } from 'react-native';

import { Colors } from '../../../styles/GlobalStyles';

/**
 * EliteLoading Component
 * Simple loading indicator with size and color customization
 */

interface EliteLoadingProps {
  size?: 'small' | 'large';
  color?: ColorValue;
}

export const EliteLoading: React.FC<EliteLoadingProps> = ({ size = 'large', color }) => {
  // Default to primary color as a string
  const defaultColor = typeof Colors.primary === 'string' ? Colors.primary : '#ec4899';
  const indicatorColor = color || defaultColor;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator
        size={size}
        color={indicatorColor}
      />
    </View>
  );
};

export default EliteLoading;
