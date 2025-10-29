/**
 * Swipe Gesture Hint Overlay
 * Shows first-time users how to use swipe gestures
 */

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../../services/logger";

const STORAGE_KEY = "@PawfectMatch:swipe_hints_shown";

interface SwipeGestureHintOverlayProps {
  onDismiss?: () => void;
}

export function SwipeGestureHintOverlay({
  onDismiss,
}: SwipeGestureHintOverlayProps): React.JSX.Element | null {
  const [showHints, setShowHints] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    checkIfShown();
  }, []);

  useEffect(() => {
    if (showHints) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 90,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showHints, fadeAnim, slideAnim]);

  const checkIfShown = async () => {
    try {
      const shown = await AsyncStorage.getItem(STORAGE_KEY);
      if (!shown) {
        setShowHints(true);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error checking hints status", { error: err });
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHints(false);
        onDismiss?.();
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error dismissing hints", { error: err });
    }
  };

  if (!showHints) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss} />
      <Animated.View
        style={[
          styles.hintCard,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Swipe to Connect</Text>
          <Pressable onPress={handleDismiss}>
            <Ionicons name="close" size={24} color={Theme.colors.neutral[600}]}} />
          </Pressable>
        </View>

        <View style={styles.hints}>
          {/* Like */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: Theme.colors.status.success }]}>
              <Ionicons name="heart" size={24} color={Theme.colors.neutral[0}]}} />
            </View>
            <Text style={styles.hintText}>
              Swipe <Text style={styles.bold}>RIGHT</Text> to like
            </Text>
          </View>

          {/* Pass */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: Theme.colors.status.error }]}>
              <Ionicons name="close" size={24} color={Theme.colors.neutral[0}]}} />
            </View>
            <Text style={styles.hintText}>
              Swipe <Text style={styles.bold}>LEFT</Text> to pass
            </Text>
          </View>

          {/* Super Like */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: Theme.colors.status.warning }]}>
              <Ionicons name="star" size={24} color={Theme.colors.neutral[0}]}} />
            </View>
            <Text style={styles.hintText}>
              Swipe <Text style={styles.bold}>UP</Text> to super like
            </Text>
          </View>

          {/* Double Tap */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: Theme.colors.primary[500] }]}>
              <Ionicons name="heart-circle" size={24} color={Theme.colors.neutral[0}]}} />
            </View>
            <Text style={styles.hintText}>
              <Text style={styles.bold}>DOUBLE TAP</Text> to like instantly
            </Text>
          </View>
        </View>

        <Pressable style={styles.gotItButton} onPress={handleDismiss}>
          <Text style={styles.gotItText}>Got it!</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  hintCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.neutral[0],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    ...Theme.shadows.depth.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Theme.colors.neutral[900],
  },
  hints: {
    gap: 16,
  },
  hintItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  hintText: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.neutral[700],
  },
  bold: {
    fontWeight: "bold",
    color: Theme.colors.neutral[900],
  },
  gotItButton: {
    marginTop: 24,
    backgroundColor: Theme.colors.primary[500],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  gotItText: {
    color: Theme.colors.neutral[0],
    fontSize: 16,
    fontWeight: "600",
  },
});

