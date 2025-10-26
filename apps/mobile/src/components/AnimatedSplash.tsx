import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AnimatedSplashProps {
  onAnimationComplete?: () => void;
  duration?: number;
}

/**
 * Animated Splash Screen Component
 * Implements U-01: Animated splash screen with pet paw fade-in
 * Features:
 * - Smooth paw animation with spring physics
 * - Brand gradient background
 * - Haptic feedback on animation complete
 * - Accessibility support
 * - Performance optimized
 */
export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({
  onAnimationComplete,
  duration = 2500,
}) => {
  // Animation values
  const pawScale = useRef(new Animated.Value(0)).current;
  const pawOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animation sequence
    const animationSequence = Animated.sequence([
      // Background fade in
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Paw animation with spring effect
      Animated.parallel([
        Animated.spring(pawScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(pawOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // Text fade in with slide up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // Hold for a moment
      Animated.delay(800),
    ]);

    animationSequence.start(() => {
      // Haptic feedback on completion
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Call completion callback
      onAnimationComplete?.();
    });

    // Cleanup
    return () => {
      animationSequence.stop();
    };
  }, [
    pawScale,
    pawOpacity,
    textOpacity,
    textTranslateY,
    backgroundOpacity,
    onAnimationComplete,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ec4899" />

      <Animated.View
        style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}
      >
        <LinearGradient
          colors={["#ec4899", "#f97316", "#eab308"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      <View
        style={styles.contentContainer}
        accessible={true}
        accessibilityLabel="PawfectMatch app is loading"
        accessibilityRole="none"
      >
        {/* Animated Paw Icon */}
        <Animated.View
          style={[
            styles.pawContainer,
            {
              transform: [{ scale: pawScale }],
              opacity: pawOpacity,
            },
          ]}
        >
          <View style={styles.pawIconContainer}>
            <Ionicons
              name="paw"
              size={80}
              color="#ffffff"
            />
          </View>
        </Animated.View>

        {/* Animated Text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.brandText}>PawfectMatch</Text>
          <Text style={styles.taglineText}>
            Find Your Perfect Pet Companion
          </Text>
        </Animated.View>

        {/* Loading indicator dots */}
        <View style={styles.loadingContainer}>
          <LoadingDots />
        </View>
      </View>
    </View>
  );
};

/**
 * Animated loading dots component
 */
const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const animations = [
      createDotAnimation(dot1, 0),
      createDotAnimation(dot2, 200),
      createDotAnimation(dot3, 400),
    ];

    animations.forEach((animation) => {
      animation.start();
    });

    return () => {
      animations.forEach((animation) => {
        animation.stop();
      });
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsContainer}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: dot,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ec4899",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  pawContainer: {
    marginBottom: 40,
  },
  pawIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  brandText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    marginHorizontal: 4,
  },
});

export default AnimatedSplash;
