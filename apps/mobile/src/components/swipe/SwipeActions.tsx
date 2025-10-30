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

import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

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
        accessibilityRole="button"
        accessibilityLabel="Pass on this pet"
        accessibilityHint="Double tap to pass on this pet and move to the next one"
      >
        <Text style={styles.actionButtonText}>Pass</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.superLikeButton]}
        onPress={onSuperlike}
        disabled={disabled}
        testID="swipe-superlike-button"
        accessibilityRole="button"
        accessibilityLabel="Super like this pet"
        accessibilityHint="Double tap to super like this pet and show them you're really interested"
      >
        <Text style={styles.actionButtonText}>★</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.likeButton]}
        onPress={onLike}
        disabled={disabled}
        testID="swipe-like-button"
        accessibilityRole="button"
        accessibilityLabel="Like this pet"
        accessibilityHint="Double tap to like this pet and see if they like you back"
      >
        <Text style={styles.actionButtonText}>Like</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: 'white',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: '#ff4458',
  },
  likeButton: {
    backgroundColor: '#42c767',
  },
  superLikeButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
