import React, { type ComponentProps } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '../../../styles/GlobalStyles';

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
  icon = 'ellipse-outline',
  title,
  message,
}) => {
  // Use neutral colors from GlobalStyles
  const gray400 =
    typeof Colors.neutral === 'object' && Colors.neutral?.[400] ? Colors.neutral[400] : '#9ca3af';
  const gray600 =
    typeof Colors.neutral === 'object' && Colors.neutral?.[600] ? Colors.neutral[600] : '#4b5563';
  const gray700 =
    typeof Colors.neutral === 'object' && Colors.neutral?.[700] ? Colors.neutral[700] : '#374151';

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
      }}
    >
      <Ionicons
        name={icon}
        size={64}
        color={gray400}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: Spacing.lg,
          color: gray700,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: 14,
          marginTop: Spacing.sm,
          color: gray600,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default EliteEmptyState;
