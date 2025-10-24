import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PawPullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  style?: any;
}

/**
 * Custom Pull-to-Refresh Component with Paw Animation
 * Implements U-02: Lottie pull-to-refresh (paw scratch)
 * Features:
 * - Custom paw scratch animation
 * - Haptic feedback on pull
 * - Smooth spring animations
 * - Accessibility support
 * - Theme-aware colors
 */
export const PawPullToRefresh: React.FC<PawPullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing,
  style,
}) => {
  const { colors } = useTheme();
  
  // Animation values
  const pawRotation = useRef(new Animated.Value(0)).current;
  const pawScale = useRef(new Animated.Value(1)).current;
  const pawOpacity = useRef(new Animated.Value(0.7)).current;
  const scratchOffset = useRef(new Animated.Value(0)).current;

  // Start paw animation when refreshing
  useEffect(() => {
    if (refreshing) {
      // Haptic feedback on refresh start
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Create scratch animation sequence
      const scratchAnimation = Animated.loop(
        Animated.sequence([
          // Paw moves down and rotates (scratching motion)
          Animated.parallel([
            Animated.timing(pawRotation, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scratchOffset, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(pawScale, {
              toValue: 1.1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
          
          // Paw moves back up
          Animated.parallel([
            Animated.timing(pawRotation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scratchOffset, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(pawScale, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
          
          // Brief pause
          Animated.delay(200),
        ])
      );

      scratchAnimation.start();

      return () => {
        scratchAnimation.stop();
      };
    } else {
      // Reset animations when not refreshing
      Animated.parallel([
        Animated.timing(pawRotation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scratchOffset, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pawScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [refreshing, pawRotation, pawScale, scratchOffset]);

  // Custom refresh control with paw animation
  const renderRefreshControl = () => {
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressBackgroundColor={colors.background}
        // Hide default spinner since we have custom animation
        style={{ opacity: 0 }}
      />
    );
  };

  // Calculate animation transforms
  const pawRotationInterpolate = pawRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const scratchTranslateY = scratchOffset.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  const scratchTranslateX = scratchOffset.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Custom Refresh Indicator */}
      {refreshing && (
        <View 
          style={styles.refreshIndicator}
          accessible={true}
          accessibilityLabel="Refreshing content"
          accessibilityRole="progressbar"
        >
          <Animated.View
            style={[
              styles.pawContainer,
              {
                transform: [
                  { rotate: pawRotationInterpolate },
                  { scale: pawScale },
                  { translateY: scratchTranslateY },
                  { translateX: scratchTranslateX },
                ],
                opacity: pawOpacity,
              },
            ]}
          >
            <Ionicons 
              name="paw" 
              size={24} 
              color={colors.primary}
              style={styles.pawIcon}
            />
          </Animated.View>
          
          {/* Scratch marks effect */}
          <View style={styles.scratchMarks}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.scratchMark,
                  {
                    backgroundColor: colors.primary,
                    opacity: pawOpacity,
                    transform: [
                      { 
                        translateY: scratchOffset.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (index + 1) * 3],
                        })
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={renderRefreshControl()}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pawContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pawIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scratchMarks: {
    position: 'absolute',
    top: 45,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 15,
    justifyContent: 'space-between',
  },
  scratchMark: {
    width: 2,
    height: 8,
    borderRadius: 1,
    marginLeft: 2,
  },
});

export default PawPullToRefresh;
