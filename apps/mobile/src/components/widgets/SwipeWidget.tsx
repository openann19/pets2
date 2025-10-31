/**
 * SwipeWidget Component with FastImage Support
 * Fixes P-05: Use react-native-fast-image for caching
 * Enhanced with swipe limit warnings
 */

import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useDailySwipeStatus } from '../../hooks/domains/premium/useDailySwipeStatus';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../navigation/types';

interface SwipeWidgetProps {
  pet: {
    id: string;
    name: string;
    age: number;
    breed: string;
    photos: string[];
  };
  onSwipe: (direction: 'left' | 'right') => void;
  onViewProfile: () => void;
}

export function SwipeWidget({ pet, onSwipe, onViewProfile }: SwipeWidgetProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { t } = useTranslation('common');
  const navigation = useNavigation<RootStackScreenProps<'Swipe'>['navigation']>();
  const { status, shouldShowWarning, shouldShowUpgradePrompt } = useDailySwipeStatus();

  const handleUpgrade = () => {
    navigation.navigate('Premium');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Swipe</Text>
        <TouchableOpacity
          onPress={onViewProfile}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="open-outline"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Swipe Limit Warning */}
      {status && !status.isUnlimited && (
        <View
          style={[
            styles.limitWarning,
            shouldShowUpgradePrompt && styles.limitWarningCritical,
            shouldShowWarning && styles.limitWarningAlert,
          ]}
        >
          <Ionicons
            name={shouldShowUpgradePrompt ? 'warning' : 'information-circle'}
            size={16}
            color={shouldShowUpgradePrompt ? theme.colors.danger : theme.colors.warning}
          />
          <Text
            style={[
              styles.limitText,
              shouldShowUpgradePrompt && styles.limitTextCritical,
            ]}
          >
            {shouldShowUpgradePrompt
              ? t('swipe.limitReached', 'Daily limit reached! Upgrade for unlimited swipes.')
              : t('swipe.limitWarning', '{{remaining}}/{{limit}} swipes remaining today', {
                  remaining: status.remaining,
                  limit: status.limit,
                })}
          </Text>
          {shouldShowUpgradePrompt && (
            <TouchableOpacity
              onPress={handleUpgrade}
              style={styles.upgradeButton}
            >
              <Text style={styles.upgradeButtonText}>
                {t('swipe.upgrade', 'Upgrade')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.petCard}>
        {pet.photos[0] && (
          <FastImage
            source={{
              uri: pet.photos[0],
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.petImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petDetails}>
            {pet.age} • {pet.breed}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.passButton])}
          onPress={() => {
            onSwipe('left');
          }}
          disabled={shouldShowUpgradePrompt}
        >
          <Ionicons
            name="close"
            size={24}
            color={theme.colors.danger}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.likeButton])}
          onPress={() => {
            onSwipe('right');
          }}
          disabled={shouldShowUpgradePrompt}
        >
          <Ionicons
            name="heart"
            size={24}
            color={theme.colors.success}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      margin: theme.spacing.sm,
    },
    limitWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.warning + '20',
      borderRadius: theme.radii.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    limitWarningAlert: {
      backgroundColor: theme.colors.warning + '20',
    },
    limitWarningCritical: {
      backgroundColor: theme.colors.danger + '20',
    },
    limitText: {
      flex: 1,
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.warning,
      fontWeight: '500',
    },
    limitTextCritical: {
      color: theme.colors.danger,
    },
    upgradeButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    upgradeButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
    petCard: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
    },
    petImage: {
      width: '100%',
      height: 200,
    },
    petInfo: {
      padding: theme.spacing.sm,
    },
    petName: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    petDetails: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
    },
    passButton: {
      backgroundColor: theme.colors.danger + '20',
    },
    likeButton: {
      backgroundColor: theme.colors.success + '20',
    },
  });
}
