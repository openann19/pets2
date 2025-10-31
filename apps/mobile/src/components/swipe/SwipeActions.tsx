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
import { useFeatureGate } from '../../hooks/domains/premium/useFeatureGate';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../navigation/types';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

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

type NavigationProp = RootStackScreenProps<'Swipe'>['navigation'];

/**
 * SwipeActions - Action buttons for swipe card interactions
 * Includes feature gates for premium features (Super Like)
 */
export const SwipeActions: React.FC<SwipeActionsProps> = ({
  onPass,
  onLike,
  onSuperlike,
  style,
  disabled = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme() as AppTheme;
  const styles = makeStyles(theme);
  
  // Use standardized feature gate for Super Likes
  const superLikeGate = useFeatureGate({
    feature: 'superLikesPerDay',
    showGateOnDeny: true,
    navigation,
  });
  
  const handleSuperLikePress = async () => {
    // Check access and show gate if needed
    const hasAccess = await superLikeGate.checkAccess();
    
    if (!hasAccess) {
      await superLikeGate.requestAccess();
      return;
    }
    
    // User has access, proceed with Super Like
    onSuperlike();
  };

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
        style={[
          styles.actionButton,
          styles.superLikeButton,
          !superLikeGate.canUse && styles.disabledButton,
        ]}
        onPress={handleSuperLikePress}
        disabled={disabled || superLikeGate.isLoading || !superLikeGate.canUse}
        testID="swipe-superlike-button"
        accessibilityRole="button"
        accessibilityLabel={superLikeGate.canUse ? "Super like this pet" : "Super like unavailable - Premium required"}
        accessibilityHint={superLikeGate.canUse ? "Double tap to super like this pet and show them you're really interested" : "Purchase Super Likes from Premium screen"}
      >
        <Text style={styles.actionButtonText}>★</Text>
        {superLikeGate.remaining !== undefined && superLikeGate.remaining > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{superLikeGate.remaining}</Text>
          </View>
        )}
        {!superLikeGate.canUse && (
          <View style={styles.lockIcon}>
            <Text style={styles.lockIconText}>🔒</Text>
          </View>
        )}
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

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 40,
      paddingVertical: 30,
      backgroundColor: theme.colors.bg,
    },
    actionButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    passButton: {
      backgroundColor: theme.colors.danger,
    },
    likeButton: {
      backgroundColor: theme.colors.success,
    },
    superLikeButton: {
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    disabledButton: {
      opacity: 0.5,
    },
    lockIcon: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.6),
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lockIconText: {
      fontSize: 10,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.danger,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: theme.colors.onPrimary,
      fontSize: 10,
      fontWeight: 'bold',
    },
  });
