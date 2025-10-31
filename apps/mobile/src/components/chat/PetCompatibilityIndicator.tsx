import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { durations } from '@/foundation/motion';
import { Text as ThemeText } from '../ui/v2/Text';

interface PetCompatibilityIndicatorProps {
  score: number;
  onClose: () => void;
}

export const PetCompatibilityIndicator: React.FC<PetCompatibilityIndicatorProps> = ({
  score,
  onClose,
}) => {
  const theme = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: durations.md,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: durations.md,
        useNativeDriver: true,
      }).start(onClose);
    }, 5000);

    return () => clearTimeout(timer);
  }, [fadeAnim, onClose]);

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return theme.colors.success;
    if (score >= 70) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getCompatibilityText = (score: number) => {
    if (score >= 85) return 'Excellent Match! 🐕❤️🐱';
    if (score >= 70) return 'Good Match! 👍';
    return 'May Need Time ⌛';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: getCompatibilityColor(score),
          borderRadius: theme.radii.lg,
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            }),
          }],
        },
      ]}
    >
      <View style={[styles.content, { padding: theme.spacing.md }]}>
        <View style={styles.scoreContainer}>
          <ThemeText
            variant="h3"
            tone="text"
            style={{ color: getCompatibilityColor(score), marginBottom: theme.spacing.xs }}
          >
            {score}%
          </ThemeText>
          <ThemeText variant="body" tone="text">
            {getCompatibilityText(score)}
          </ThemeText>
        </View>

        <TouchableOpacity
          style={[
            styles.closeButton,
            {
              backgroundColor: theme.colors.surface,
              width: theme.spacing.xl,
              height: theme.spacing.xl,
              borderRadius: theme.radii.full,
            },
          ]}
          onPress={onClose}
        >
          <Ionicons name="close" size={16} color={theme.colors.onMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreContainer: {
    flex: 1,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
