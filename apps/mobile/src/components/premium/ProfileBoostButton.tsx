/**
 * ProfileBoostButton Component
 * Premium feature button for activating profile boost
 * Includes feature gate check and boost status display
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { useFeatureGate } from '../../hooks/domains/premium/useFeatureGate';
import { swipePremiumService } from '../../services/swipePremiumService';
import { usePremiumGate } from '../Premium/PremiumGate';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../navigation/types';
import * as Haptics from 'expo-haptics';

type NavigationProp = RootStackScreenProps<'Profile'>['navigation'];

interface ProfileBoostButtonProps {
  style?: object;
  showLabel?: boolean;
}

export const ProfileBoostButton: React.FC<ProfileBoostButtonProps> = ({
  style,
  showLabel = true,
}) => {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const navigation = useNavigation<NavigationProp>();
  const { PremiumGateComponent } = usePremiumGate();

  const [isActivating, setIsActivating] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [boostEndsAt, setBoostEndsAt] = useState<Date | null>(null);

  // Feature gate for profile boost
  const boostGate = useFeatureGate({
    feature: 'canBoostProfile',
    showGateOnDeny: true,
    navigation,
  });

  // Check boost status on mount
  React.useEffect(() => {
    const checkBoostStatus = async () => {
      try {
        // TODO: Add API endpoint to check current boost status
        // For now, assume boost is not active
        setBoostActive(false);
      } catch (error) {
        // Silently fail - boost status is not critical
      }
    };
    void checkBoostStatus();
  }, []);

  const handleBoostPress = useCallback(async () => {
    // Check access first
    const hasAccess = await boostGate.checkAccess();

    if (!hasAccess) {
      await boostGate.requestAccess();
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Activate Profile Boost?',
      'Boost your profile for 30 minutes to get more visibility. This will make your profile appear at the top of the swipe stack.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Boost Now',
          style: 'default',
          onPress: async () => {
            try {
              setIsActivating(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              const result = await swipePremiumService.activateBoost();

              if (result.success) {
                setBoostActive(true);
                // Boost lasts 30 minutes
                const endTime = new Date();
                endTime.setMinutes(endTime.getMinutes() + 30);
                setBoostEndsAt(endTime);

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Boost Activated!',
                  'Your profile is now being boosted for 30 minutes. You\'ll appear at the top of more swipe stacks!',
                );
              } else {
                throw new Error(result.error || 'Failed to activate boost');
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to activate boost';
              Alert.alert('Error', errorMessage);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setIsActivating(false);
            }
          },
        },
      ],
    );
  }, [boostGate]);

  // Calculate remaining time
  const getRemainingTime = useCallback((): string | null => {
    if (!boostActive || !boostEndsAt) return null;

    const now = new Date();
    const diff = boostEndsAt.getTime() - now.getTime();

    if (diff <= 0) {
      setBoostActive(false);
      setBoostEndsAt(null);
      return null;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [boostActive, boostEndsAt]);

  const [remainingTime, setRemainingTime] = useState<string | null>(null);

  // Update remaining time every second when boost is active
  React.useEffect(() => {
    if (!boostActive) return;

    const interval = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [boostActive, getRemainingTime]);

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style, boostActive && styles.buttonActive]}
        onPress={handleBoostPress}
        disabled={isActivating || boostGate.isLoading || boostActive}
        accessibilityRole="button"
        accessibilityLabel={boostActive ? 'Boost active' : 'Activate profile boost'}
        accessibilityHint={
          boostActive
            ? 'Profile boost is currently active'
            : 'Double tap to boost your profile for 30 minutes'
        }
      >
        <LinearGradient
          colors={
            boostActive
              ? theme.palette.gradients.success
              : theme.palette.gradients.primary
          }
          style={styles.gradient}
        >
          {isActivating ? (
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          ) : (
            <>
              <Ionicons
                name={boostActive ? 'rocket' : 'rocket-outline'}
                size={20}
                color={theme.colors.onPrimary}
              />
              {showLabel && (
                <Text style={styles.buttonText}>
                  {boostActive ? 'Boosted' : 'Boost Profile'}
                </Text>
              )}
              {remainingTime && (
                <Text style={styles.timerText}>{remainingTime}</Text>
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <PremiumGateComponent />
    </>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    button: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      minWidth: 120,
      opacity: 1,
    },
    buttonActive: {
      opacity: 0.8,
    },
    gradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    timerText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.body.weight,
      opacity: 0.9,
    },
  });
}

