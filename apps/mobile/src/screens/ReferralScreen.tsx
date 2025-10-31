/**
 * Referral Screen
 * View referral code, stats, and apply referral codes
 * Business Model: 1 month free Premium for successful referrals
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { referralService } from '../services/ReferralService';
import type { ReferralCodeResponse, ReferralStatsResponse } from '../services/ReferralService';
import type { RootStackScreenProps } from '../navigation/types';

type ReferralScreenProps = RootStackScreenProps<'Referral'>;

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing['4xl'],
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      position: 'absolute',
      top: theme.spacing['4xl'],
      left: theme.spacing.lg,
      zIndex: 10,
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.elevation2,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    codeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    codeText: {
      flex: 1,
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.primary,
      fontFamily: 'monospace',
      letterSpacing: 2,
    },
    copyButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.primary,
    },
    linkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.md,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    linkText: {
      flex: 1,
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
      fontFamily: 'monospace',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    statValue: {
      fontSize: theme.typography.h1.size * 1.5,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
    applySection: {
      marginTop: theme.spacing.md,
    },
    input: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
      fontFamily: 'monospace',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    applyButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onPrimary,
    },
    applyButtonDisabled: {
      opacity: 0.5,
    },
    infoBox: {
      backgroundColor: theme.colors.info + '20',
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    infoText: {
      flex: 1,
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    errorText: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.danger,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    successText: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.success,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
  });
}

export default function ReferralScreen({ navigation, route }: ReferralScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { t } = useTranslation('common');

  const [referralCode, setReferralCode] = useState<ReferralCodeResponse | null>(null);
  const [stats, setStats] = useState<ReferralStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyCode, setApplyCode] = useState(route.params?.code || '');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Load referral data
  const loadReferralData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [codeData, statsData] = await Promise.all([
        referralService.getReferralCode(),
        referralService.getReferralStats(),
      ]);
      setReferralCode(codeData);
      setStats(statsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(t('settings.error'), `${t('referral.errors.loadFailed')}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadReferralData();
  }, [loadReferralData]);

  // Auto-apply referral code from deep link
  useEffect(() => {
    if (route.params?.code) {
      const code = route.params.code.toUpperCase();
      if (applyCode !== code) {
        setApplyCode(code);
        // Auto-apply after a short delay to ensure screen is ready
        const timeoutId = setTimeout(() => {
          void handleApplyCode();
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.code]);

  // Copy referral code to clipboard
  const handleCopyCode = useCallback(async () => {
    if (!referralCode) return;
    try {
      await Clipboard.setStringAsync(referralCode.referralCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('referral.copied'), t('referral.codeCopied'));
    } catch (error) {
      Alert.alert(t('settings.error'), t('settings.failed_update'));
    }
  }, [referralCode, t]);

  // Copy referral link to clipboard
  const handleCopyLink = useCallback(async () => {
    if (!referralCode) return;
    try {
      await Clipboard.setStringAsync(referralCode.referralLink);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('referral.copied'), t('referral.linkCopied'));
    } catch (error) {
      Alert.alert(t('settings.error'), t('settings.failed_update'));
    }
  }, [referralCode, t]);

  // Apply referral code
  const handleApplyCode = useCallback(async () => {
    if (!applyCode.trim()) {
      setApplyError(t('referral.errors.enterCode'));
      return;
    }

    setIsApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    try {
      const response = await referralService.applyReferralCode(applyCode.trim().toUpperCase());
      if (response.success) {
        setApplySuccess(response.message || t('referral.errors.applySuccess'));
        setApplyCode('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Reload data to get updated stats
        await loadReferralData();
        Alert.alert(
          t('referral.success.title'),
          response.message || t('referral.success.message'),
        );
      } else {
        setApplyError(response.message || t('referral.errors.applyFailed'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setApplyError(errorMessage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsApplying(false);
    }
  }, [applyCode, loadReferralData, t]);

  const gradientColors = theme.palette.gradients.primary;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            testID="referral-back-button"
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
            {t('referral.title', 'Referral Program')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onPrimary, opacity: 0.9 }]}>
            {t('referral.subtitle', 'Share and earn Premium rewards!')}
          </Text>
        </View>

        {isLoading ? (
          <View style={{ padding: theme.spacing['4xl'], alignItems: 'center' }}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <>
            {/* Your Referral Code */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('referral.yourCode', 'Your Referral Code')}
              </Text>
              {referralCode && (
                <>
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeText}>{referralCode.referralCode}</Text>
                    <TouchableOpacity
                      onPress={handleCopyCode}
                      style={styles.copyButton}
                      accessibilityLabel="Copy referral code"
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name="copy-outline"
                        size={20}
                        color={theme.colors.onPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={handleCopyLink}
                    style={styles.linkContainer}
                    accessibilityLabel="Copy referral link"
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="link-outline"
                      size={16}
                      color={theme.colors.onMuted}
                    />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {referralCode.referralLink}
                    </Text>
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={theme.colors.onMuted}
                    />
                  </TouchableOpacity>
                </>
              )}

              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={theme.colors.info}
                />
                <Text style={styles.infoText}>
                  {t(
                    'referral.howItWorks',
                    'Share your code or link with friends. When they sign up and use your code, you both get 1 month free Premium!',
                  )}
                </Text>
              </View>
            </View>

            {/* Stats */}
            {stats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t('referral.stats', 'Your Referral Stats')}
                </Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.stats.totalReferrals}</Text>
                    <Text style={styles.statLabel}>
                      {t('referral.totalReferrals', 'Total Referrals')}
                    </Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.stats.activeReferrals}</Text>
                    <Text style={styles.statLabel}>
                      {t('referral.activeReferrals', 'Active Referrals')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Apply Referral Code */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('referral.applyCode', 'Apply a Referral Code')}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t('referral.enterCode', 'Enter referral code')}
                placeholderTextColor={theme.colors.onMuted}
                value={applyCode}
                onChangeText={(text) => {
                  setApplyCode(text.toUpperCase());
                  setApplyError(null);
                  setApplySuccess(null);
                }}
                autoCapitalize="characters"
                maxLength={12}
                testID="referral-code-input"
              />
              {applyError && <Text style={styles.errorText}>{applyError}</Text>}
              {applySuccess && <Text style={styles.successText}>{applySuccess}</Text>}
              <TouchableOpacity
                style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
                onPress={handleApplyCode}
                disabled={isApplying || !applyCode.trim()}
                accessibilityLabel="Apply referral code"
                accessibilityRole="button"
              >
                {isApplying ? (
                  <ActivityIndicator
                    color={theme.colors.onPrimary}
                    size="small"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="gift"
                      size={20}
                      color={theme.colors.onPrimary}
                    />
                    <Text style={styles.applyButtonText}>
                      {t('referral.apply', 'Apply Code')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

