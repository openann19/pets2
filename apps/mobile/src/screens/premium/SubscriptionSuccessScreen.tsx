import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../../navigation/types';

type SubscriptionSuccessNavigationProp = NavigationProp<RootStackParamList>;

const AnimatedCheckmark = ({
  styles,
  theme,
}: {
  styles: ReturnType<typeof makeStyles>;
  theme: AppTheme;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run the animation when component mounts
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: 200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Provide haptic feedback when animation completes
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });
  }, [animatedValue]);

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0.9, 1],
  });

  const gradientColors = theme.palette.gradients.primary;

  return (
    <View style={styles.checkmarkContainer}>
      {/* React Native Animated API type compatibility issue - runtime works correctly */}
      <Animated.View
        style={[
          styles.checkmarkCircle,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name="checkmark"
            size={64}
            color={theme.colors.onPrimary}
          />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export function SubscriptionSuccessScreen(): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { t } = useTranslation('premium');
  const navigation = useNavigation<SubscriptionSuccessNavigationProp>();
  const route = useRoute();
  const { sessionId } = (route.params as { sessionId?: string }) || {};

  // Track the success event with session ID
  useEffect(() => {
    const trackSubscriptionSuccess = async () => {
      try {
        const { track } = await import('../../services/analyticsService');
        await track('premium.subscribed', {
          sessionId,
          timestamp: new Date().toISOString(),
        });
        logger.info('Subscription success tracked', {
          sessionId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to track subscription success:', { error });
      }
    };

    if (sessionId) {
      trackSubscriptionSuccess();
    }
  }, [sessionId]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <AnimatedCheckmark
          styles={styles}
          theme={theme}
        />

        <Text style={styles.title}>{t('success_title')}</Text>

        <Text style={styles.message}>{t('success_message')}</Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons
              name="infinite-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.featureText}>{t('unlimited_swipes')}</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name="eye-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.featureText}>{t('see_who_liked')}</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name="videocam-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.featureText}>{t('video_calls')}</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons
              name="options-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.featureText}>{t('advanced_filters')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          testID="SubscriptionSuccessScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={() => {
            navigation.navigate('SubscriptionManager');
          }}
        >
          <Text style={styles.buttonText}>{t('manage_subscription')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          testID="SubscriptionSuccessScreen-button-2"
          accessibilityLabel="Interactive element"
          accessibilityRole="button"
          onPress={() => {
            navigation.navigate('Home');
          }}
        >
          <Text style={styles.secondaryButtonText}>{t('go_to_home')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkContainer: {
      marginBottom: theme.spacing['2xl'],
    },
    checkmarkCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    gradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: theme.typography.h1.size * 0.875,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: theme.spacing['2xl'],
      lineHeight: theme.typography.body.lineHeight,
    },
    featuresContainer: {
      width: '100%',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      marginVertical: theme.spacing.lg,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    featureText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      marginLeft: theme.spacing.sm,
    },
    buttonContainer: {
      width: '100%',
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.sm,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surface,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
  });
}
