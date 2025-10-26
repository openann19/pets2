import React, { useEffect, useState } from 'react';
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
import { useTheme } from '../theme/Provider';
import { getExtendedColors } from '../theme/adapters';
import { Theme } from '../theme/unified-theme';
import { logger } from '../services/logger';

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

export default function VerificationCenterScreen(): React.JSX.Element {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  const spacing = theme.spacing;
  const borderRadius = theme.radius;
  
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
      // TODO: Call API to get verification status
      // const response = await verificationService.getStatus();
      // setVerificationStatus(response);
    } catch (error) {
      logger.error('Error loading verification status', { error: error as Error });
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    const tierColors: Record<string, string> = {
      tier0: colors.textMuted,
      tier1: colors.primary,
      tier2: colors.secondary || colors.primary,
      tier3: '#4CAF50',
      tier4: '#FF9800',
    };
    return tierColors[tier] || colors.textMuted;
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

  const handleStartVerification = (tier: string) => {
    // TODO: Navigate to specific verification submission screen
    Alert.alert('Coming Soon', 'Verification submission will be available soon.');
  };

  const handleRetry = () => {
    // TODO: Restart verification process
    Alert.alert('Coming Soon', 'Verification retry will be available soon.');
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Verification Center</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Build trust with verified badges
        </Text>
      </View>

      {/* Current Status Card */}
      <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: getTierColor(verificationStatus.tier) }]}>
            <Ionicons name="shield-checkmark" size={24} color={colors.white} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTier, { color: colors.text }]}>{tierName}</Text>
            <Text style={[styles.statusText, { color: colors.textMuted }]}>{statusText}</Text>
          </View>
        </View>

        {verificationStatus.rejectionReason && (
          <View style={styles.rejectionContainer}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={[styles.rejectionText, { color: colors.error }]}>
              {verificationStatus.rejectionReason}
            </Text>
          </View>
        )}

        {verificationStatus.status === 'rejected' && (
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={handleRetry}>
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={[styles.retryButtonText, { color: colors.white }]}>Retry Verification</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification Tiers</Text>
        {['tier0', 'tier1', 'tier2', 'tier3', 'tier4'].map((tier, index) => {
          const isCompleted = ['tier0', 'tier1', 'tier2', 'tier3', 'tier4'].indexOf(verificationStatus.tier) >= index;
          return (
            <View key={tier} style={styles.tierRow}>
              <View style={[
                styles.tierBullet,
                isCompleted ? { backgroundColor: getTierColor(tier) } : { backgroundColor: colors.gray300 }
              ]}>
                {isCompleted && <Ionicons name="checkmark" size={12} color={colors.white} />}
              </View>
              <Text style={[styles.tierText, { color: isCompleted ? colors.text : colors.textMuted }]}>
                Tier {index}: {getStatusDisplay().tierName}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Available Badges */}
      <View style={styles.badgesContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Badges</Text>
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={[
              styles.badgeCard,
              { backgroundColor: badge.unlocked ? colors.surface : colors.gray100 },
            ]}
          >
            <View style={[
              styles.badgeIcon,
              { backgroundColor: badge.unlocked ? colors.primary : colors.gray300 }
            ]}>
              <Ionicons
                name={badge.icon}
                size={24}
                color={badge.unlocked ? colors.white : colors.gray600}
              />
            </View>
            <View style={styles.badgeInfo}>
              <Text style={[
                styles.badgeName,
                { color: badge.unlocked ? colors.text : colors.textMuted }
              ]}>
                {badge.name}
              </Text>
              <Text style={[styles.badgeDesc, { color: colors.textMuted }]}>
                {badge.description}
              </Text>
            </View>
            {badge.unlocked && (
              <Ionicons name="checkmark-circle" size={24} color={colors.feedback} />
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {verificationStatus.status === 'not_started' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleStartVerification('tier1')}
          >
            <Ionicons name="shield-checkmark" size={20} color={colors.white} />
            <Text style={[styles.actionButtonText, { color: colors.white }]}>
              Start Identity Verification
            </Text>
          </TouchableOpacity>
        )}

        {verificationStatus.status === 'approved' && verificationStatus.tier === 'tier1' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => handleStartVerification('tier2')}
          >
            <Ionicons name="paw" size={20} color={colors.white} />
            <Text style={[styles.actionButtonText, { color: colors.white }]}>
              Verify Pet Ownership
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          Verification helps build trust in the PawfectMatch community. All information is encrypted and processed securely in compliance with GDPR regulations.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTier: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4 / 2,
  },
  statusText: {
    fontSize: 14,
  },
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e53e3e10',
    borderRadius: 8,
  },
  rejectionText: {
    marginLeft: 4,
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tierText: {
    fontSize: 14,
  },
  badgesContainer: {
    margin: 16,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4 / 2,
  },
  badgeDesc: {
    fontSize: 14,
  },
  actionContainer: {
    margin: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
});

