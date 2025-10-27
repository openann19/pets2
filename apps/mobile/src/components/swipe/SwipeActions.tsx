/**
 * SwipeActions Component
 * 
 * Presentational component for swipe action buttons.
 * Displays pass, superlike, and like buttons.
 * 
 * @example
 * ```typescript
 * <SwipeActions
 *   onPass={() => handleSwipe("pass")}
 *   onSuperlike={() => handleSwipe("superlike")}
 *   onLike={() => handleSwipe("like")}
 * />
 * ```
 */

import React from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

export interface SwipeActionsProps {
  /**
   * Callback when pass button is pressed
   */
  onPass: () => void;
  
  /**
   * Callback when like button is pressed
   */
  onLike: () => void;
  
  /**
   * Callback when superlike button is pressed
   */
  onSuperlike: () => void;
  
  /**
   * Container style override
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Disable all buttons
   */
  disabled?: boolean;
}

/**
 * SwipeActions - Action buttons for swipe card interactions
 */
export const SwipeActions: React.FC<SwipeActionsProps> = ({
  onPass,
  onLike,
  onSuperlike,
  style,
  disabled = false,
}) => {
  return (
    <View style={[styles.actions, style]}>
      <TouchableOpacity
        style={[styles.actionButton, styles.passButton]}
        onPress={onPass}
        disabled={disabled}
        testID="swipe-pass-button"
      >
        <Text style={styles.actionButtonText}>Pass</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.superLikeButton]}
        onPress={onSuperlike}
        disabled={disabled}
        testID="swipe-superlike-button"
      >
        <Text style={styles.actionButtonText}>★</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.likeButton]}
        onPress={onLike}
        disabled={disabled}
        testID="swipe-like-button"
      >
        <Text style={styles.actionButtonText}>Like</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: "white",
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  passButton: {
    backgroundColor: "#ff4458",
  },
  likeButton: {
    backgroundColor: "#42c767",
  },
  superLikeButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
