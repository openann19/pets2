import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { logger } from '../services/logger';
import * as Haptics from 'expo-haptics';

interface VerificationBadge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string; // Ionicons name
}

interface VerificationStatus {
  tier: 'tier0' | 'tier1' | 'tier2' | 'tier3' | 'tier4';
  verified: boolean;
  badges: string[];
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
}

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    header: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: theme.spacing.xs,
      color: theme.colors.onSurface,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
    },
    statusCard: {
      margin: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.elevation1,
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    statusIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    statusInfo: {
      flex: 1,
    },
    statusTier: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: theme.spacing.xs / 2,
      color: theme.colors.onSurface,
    },
    statusText: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    rejectionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
      padding: theme.spacing.xs,
      backgroundColor: `${theme.colors.danger}20`,
      borderRadius: theme.radii.md,
    },
    rejectionText: {
      marginLeft: theme.spacing.xs,
      fontSize: 14,
      flex: 1,
      color: theme.colors.danger,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.primary,
    },
    retryButtonText: {
      marginLeft: theme.spacing.xs,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    progressContainer: {
      margin: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
      color: theme.colors.onSurface,
    },
    tierRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    tierBullet: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    tierText: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    badgesContainer: {
      margin: theme.spacing.md,
    },
    badgeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    badgeIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    badgeInfo: {
      flex: 1,
    },
    badgeName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: theme.spacing.xs / 2,
      color: theme.colors.onSurface,
    },
    badgeDesc: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    actionContainer: {
      margin: theme.spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      marginLeft: theme.spacing.xs,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    infoContainer: {
      flexDirection: 'row',
      margin: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
    },
    infoText: {
      flex: 1,
      marginLeft: theme.spacing.xs,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.onMuted,
    },
  });
}

export default function VerificationCenterScreen(): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    tier: 'tier0',
    verified: false,
    badges: [],
    status: 'not_started',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const { verificationService } = await import('../services/verificationService');
      const response = await verificationService.getStatus();
      setVerificationStatus(response);
    } catch (error) {
      logger.error('Error loading verification status', { error: error as Error });
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const tierColors: Record<string, string> = {
      tier0: colors.onMuted,
      tier1: colors.primary,
      tier2: colors.primary,
      tier3: colors.success,
      tier4: colors.warning,
    };
    return tierColors[tier] || colors.onMuted;
  };

  const badges: VerificationBadge[] = [
    {
      id: 'id-verified',
      name: 'ID Verified',
      description: 'Government-issued ID verified',
      unlocked: verificationStatus.badges.includes('ID Verified'),
      icon: 'card',
    },
    {
      id: 'pet-owner-verified',
      name: 'Pet Owner Verified',
      description: 'Pet ownership confirmed',
      unlocked: verificationStatus.badges.includes('Pet Owner Verified'),
      icon: 'paw',
    },
    {
      id: 'vet-verified',
      name: 'Vet Verified',
      description: 'Veterinary records verified',
      unlocked: verificationStatus.badges.includes('Vet Verified'),
      icon: 'medical',
    },
    {
      id: 'shelter-verified',
      name: 'Shelter Verified',
      description: 'Rescue organization verified',
      unlocked: verificationStatus.badges.includes('Shelter Verified'),
      icon: 'home',
    },
  ];

  const getStatusDisplay = () => {
    const tierNames: Record<string, string> = {
      tier0: 'Basic Account',
      tier1: 'ID Verified',
      tier2: 'Pet Owner Verified',
      tier3: 'Vet Verified',
      tier4: 'Organization Verified',
    };

    const statusText: Record<string, string> = {
      not_started: 'Get Started',
      in_progress: 'In Progress',
      pending_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };

    return {
      tierName: tierNames[verificationStatus.tier],
      statusText: statusText[verificationStatus.status],
    };
  };

  const handleStartVerification = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Determine next tier to verify
      const nextTier = verificationStatus.tier === 'tier0' ? 'tier1' : 
                       verificationStatus.tier === 'tier1' ? 'tier2' :
                       verificationStatus.tier === 'tier2' ? 'tier3' :
                       verificationStatus.tier === 'tier3' ? 'tier4' : null;
      
      if (!nextTier) {
        Alert.alert('Already Verified', 'You have completed all verification tiers.');
        return;
      }

      // Check if verification is already in progress
      if (verificationStatus.status === 'in_progress' || verificationStatus.status === 'pending_review') {
        Alert.alert(
          'Verification In Progress',
          'Your verification is currently being reviewed. Please wait for the review to complete.',
        );
        return;
      }

      // Show info about what's needed for the next tier
      const tierInfo: Record<string, string> = {
        tier1: 'ID Verification requires a government-issued ID and a selfie photo.',
        tier2: 'Pet Owner Verification requires proof of pet ownership such as registration papers or adoption documents.',
        tier3: 'Vet Verification requires veterinary records confirming your pet\'s health status.',
        tier4: 'Organization Verification requires proof of affiliation with a rescue organization or shelter.',
      };

      Alert.alert(
        `Start ${getStatusDisplay().tierName} Verification`,
        tierInfo[nextTier] || 'Please prepare the required documents.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              try {
                // For now, update status to in_progress and show that submission screen is needed
                // In a full implementation, this would navigate to a submission form screen
                Alert.alert(
                  'Verification Started',
                  'Please navigate to the verification submission screen to upload required documents. For Tier 1, you will need to upload ID documents and a selfie.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        // Reload status to reflect any changes
                        await loadVerificationStatus();
                      },
                    },
                  ],
                );
                logger.info('Verification start initiated', { tier: nextTier, currentTier: verificationStatus.tier });
              } catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                logger.error('Failed to start verification', { error: errorObj });
                Alert.alert('Error', 'Failed to start verification process. Please try again.');
              }
            },
          },
        ],
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Error starting verification', { error: errorObj });
      Alert.alert('Error', 'Failed to start verification. Please try again.');
    }
  };

  const handleRetry = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        'Retry Verification',
        'Are you sure you want to restart the verification process? This will reset your current verification status.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            style: 'destructive',
            onPress: async () => {
              try {
                // Reload verification status (in a real app, this would call an API to reset status)
                await loadVerificationStatus();
                
                Alert.alert(
                  'Verification Reset',
                  'Your verification has been reset. You can now start the verification process again.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Update status to not_started
                        setVerificationStatus((prev) => {
                          const updated = { ...prev, status: 'not_started' as const };
                          delete updated.rejectionReason;
                          return updated;
                        });
                      },
                    },
                  ],
                );
                logger.info('Verification retry initiated', { currentTier: verificationStatus.tier });
              } catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                logger.error('Failed to retry verification', { error: errorObj });
                Alert.alert('Error', 'Failed to reset verification. Please try again later.');
              }
            },
          },
        ],
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Error retrying verification', { error: errorObj });
      Alert.alert('Error', 'Failed to retry verification. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { tierName, statusText } = getStatusDisplay();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Verification Center</Text>
        <Text style={styles.subtitle}>
          Build trust with verified badges
        </Text>
      </View>

      {/* Current Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: getTierColor(verificationStatus.tier) }]}>
            <Ionicons name="shield-checkmark" size={24} color={colors.onPrimary} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTier}>{tierName}</Text>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {verificationStatus.rejectionReason && (
          <View style={styles.rejectionContainer}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.rejectionText}>
              {verificationStatus.rejectionReason}
            </Text>
          </View>
        )}

        {verificationStatus.status === 'rejected' && (
          <TouchableOpacity style={styles.retryButton} testID="VerificationCenterScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleRetry}>
            <Ionicons name="refresh" size={16} color={colors.onPrimary} />
            <Text style={styles.retryButtonText}>Retry Verification</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Verification Tiers</Text>
        {['tier0', 'tier1', 'tier2', 'tier3', 'tier4'].map((tier, index) => {
          const isCompleted = ['tier0', 'tier1', 'tier2', 'tier3', 'tier4'].indexOf(verificationStatus.tier) >= index;
          return (
            <View key={tier} style={styles.tierRow}>
              <View style={[
                styles.tierBullet,
                { backgroundColor: isCompleted ? getTierColor(tier) : colors.onMuted }
              ]}>
                {isCompleted && <Ionicons name="checkmark" size={12} color={colors.onPrimary} />}
              </View>
              <Text style={[styles.tierText, !isCompleted && { color: colors.onMuted }]}>
                Tier {index}: {getStatusDisplay().tierName}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Available Badges */}
      <View style={styles.badgesContainer}>
        <Text style={styles.sectionTitle}>Available Badges</Text>
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={[
              styles.badgeCard,
              !badge.unlocked && { opacity: 0.6 },
            ]}
          >
            <View style={[
              styles.badgeIcon,
              { backgroundColor: badge.unlocked ? colors.primary : colors.onMuted }
            ]}>
              <Ionicons
                name={badge.icon}
                size={24}
                color={badge.unlocked ? colors.onPrimary : colors.onSurface}
              />
            </View>
            <View style={styles.badgeInfo}>
              <Text style={[
                styles.badgeName,
                !badge.unlocked && { color: colors.onMuted }
              ]}>
                {badge.name}
              </Text>
              <Text style={styles.badgeDesc}>
                {badge.description}
              </Text>
            </View>
            {badge.unlocked && (
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {verificationStatus.status === 'not_started' && (
          <TouchableOpacity
            style={styles.actionButton}
             testID="VerificationCenterScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleStartVerification}
          >
            <Ionicons name="shield-checkmark" size={20} color={colors.onPrimary} />
            <Text style={styles.actionButtonText}>
              Start Identity Verification
            </Text>
          </TouchableOpacity>
        )}

        {verificationStatus.status === 'approved' && verificationStatus.tier === 'tier1' && (
          <TouchableOpacity
            style={styles.actionButton}
             testID="VerificationCenterScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleStartVerification}
          >
            <Ionicons name="paw" size={20} color={colors.onPrimary} />
            <Text style={styles.actionButtonText}>
              Verify Pet Ownership
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Verification helps build trust in the PawfectMatch community. All information is encrypted and processed securely in compliance with GDPR regulations.
        </Text>
      </View>
    </ScrollView>
  );
}

