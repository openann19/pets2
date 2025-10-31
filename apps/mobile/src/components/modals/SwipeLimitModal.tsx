/**
 * Swipe Limit Modal
 * Shown when user exceeds daily swipe limit (5 for free users)
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import type { RootStackScreenProps } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeLimitModalProps {
  visible: boolean;
  usedToday: number;
  limit: number;
  onClose: () => void;
  onUpgrade?: () => void;
  navigation?: RootStackScreenProps<'Premium'>['navigation'];
}

export function SwipeLimitModal({
  visible,
  usedToday,
  limit,
  onClose,
  onUpgrade,
  navigation,
}: SwipeLimitModalProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { t } = useTranslation('common');

  const handleUpgrade = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    if (onUpgrade) {
      onUpgrade();
    } else if (navigation) {
      navigation.navigate('Premium');
    }
  };

  const handleClose = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <BlurView
        intensity={20}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />

          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.onMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={theme.palette.gradients.primary}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name="time-outline"
                    size={40}
                    color={theme.colors.onPrimary}
                  />
                </LinearGradient>
              </View>

              {/* Title */}
              <Text style={styles.title}>
                {t('swipe.limitReached', 'Daily Swipe Limit Reached')}
              </Text>

              {/* Description */}
              <Text style={styles.description}>
                {t(
                  'swipe.limitMessage',
                  `You've used all ${limit} of your daily swipes. Upgrade to Premium for unlimited swipes!`,
                  { limit },
                )}
              </Text>

              {/* Usage Info */}
              <View style={styles.usageCard}>
                <View style={styles.usageRow}>
                  <Text style={styles.usageLabel}>
                    {t('swipe.usedToday', 'Used Today')}
                  </Text>
                  <Text style={styles.usageValue}>{usedToday}/{limit}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(usedToday / limit) * 100}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Benefits List */}
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.success}
                  />
                  <Text style={styles.benefitText}>
                    {t('swipe.unlimitedSwipes', 'Unlimited daily swipes')}
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.success}
                  />
                  <Text style={styles.benefitText}>
                    {t('swipe.seeWhoLiked', 'See who liked you')}
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.success}
                  />
                  <Text style={styles.benefitText}>
                    {t('swipe.advancedFilters', 'Advanced filters')}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.8}
                  accessibilityLabel="Upgrade to Premium"
                  accessibilityRole="button"
                >
                  <LinearGradient
                    colors={theme.palette.gradients.primary}
                    style={styles.upgradeButtonGradient}
                  >
                    <Ionicons
                      name="star"
                      size={20}
                      color={theme.colors.onPrimary}
                    />
                    <Text style={styles.upgradeButtonText}>
                      {t('swipe.upgradeToPremium', 'Upgrade to Premium')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={handleClose}
                  activeOpacity={0.8}
                  accessibilityLabel="Maybe Later"
                  accessibilityRole="button"
                >
                  <Text style={styles.laterButtonText}>
                    {t('swipe.maybeLater', 'Maybe Later')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modal: {
      width: SCREEN_WIDTH - 40,
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      ...theme.shadows.elevation4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: theme.spacing.lg,
      paddingBottom: 0,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    content: {
      padding: theme.spacing.lg,
      paddingTop: 0,
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: theme.spacing.md,
    },
    iconGradient: {
      width: 80,
      height: 80,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    description: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: theme.spacing.lg,
    },
    usageCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    usageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    usageLabel: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    usageValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.primary,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radii.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
    },
    benefitsList: {
      width: '100%',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    benefitText: {
      flex: 1,
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
    },
    actions: {
      width: '100%',
      gap: theme.spacing.md,
    },
    upgradeButton: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
    },
    upgradeButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    upgradeButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    laterButton: {
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    laterButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      color: theme.colors.onMuted,
    },
  });
}

