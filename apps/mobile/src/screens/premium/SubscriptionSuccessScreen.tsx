import { Ionicons } from '@expo/vector-icons'
import { logger } from '@pawfectmatch/core';
;
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RootStackParamList = {
  Home: undefined;
  SubscriptionManager: undefined;
  [key: string]: undefined | object;
};

const AnimatedCheckmark = () => {
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

  return (
    <View style={styles.checkmarkContainer}>
      {/* React Native Animated API type compatibility issue - runtime works correctly */}
      <Animated.View
        style={[
          styles.checkmarkCircle,
          {
            transform: [{ scale }],
            opacity,
          } as any,
        ]}
      >
        <LinearGradient
          colors={['#6D28D9', '#7C3AED', '#8B5CF6']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="checkmark" size={64} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export function SubscriptionSuccessScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { sessionId } = (route.params as { sessionId?: string }) || {};

  // Track the success event with session ID
  useEffect(() => {
    const trackSubscriptionSuccess = async () => {
      try {
        const { analyticsAPI } = await import('../../services/api');
        await analyticsAPI.trackUserEvent('subscription_success', {
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
        <AnimatedCheckmark />

        <Text style={styles.title}>Subscription Successful!</Text>

        <Text style={styles.message}>
          Thank you for your purchase. Your premium subscription is now active, and you can enjoy all the exclusive features.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="infinite-outline" size={24} color="#6D28D9" />
            <Text style={styles.featureText}>Unlimited Swipes</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="eye-outline" size={24} color="#6D28D9" />
            <Text style={styles.featureText}>See Who Liked You</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="videocam-outline" size={24} color="#6D28D9" />
            <Text style={styles.featureText}>Video Calls</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="options-outline" size={24} color="#6D28D9" />
            <Text style={styles.featureText}>Advanced Filters</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => { navigation.navigate('SubscriptionManager'); }}
        >
          <Text style={styles.buttonText}>Manage Subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => { navigation.navigate('Home'); }}
        >
          <Text style={styles.secondaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginBottom: 32,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginVertical: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#6D28D9',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#6D28D9',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubscriptionSuccessScreen;