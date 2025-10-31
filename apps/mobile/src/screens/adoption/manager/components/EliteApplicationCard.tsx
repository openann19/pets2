/**
 * Elite Application Card Component
 * Elite-styled version for adoption applications
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EliteButton, EliteCard } from '../../../components';
import { GlobalStyles, Colors } from '../../../animation';
import type { AdoptionApplication } from '../../../../hooks/screens/useAdoptionManagerScreen';
import { useTheme } from '@mobile/theme';

interface EliteApplicationCardProps {
  application: AdoptionApplication;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  onApprove: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
}

export const EliteApplicationCard: React.FC<EliteApplicationCardProps> = ({
  application,
  getStatusColor,
  getStatusIcon,
  onApprove,
  onReject,
}) => {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <EliteCard gradient blur style={GlobalStyles['mb4'] as ViewStyle}>
      <View style={styles.eliteApplicationHeader}>
        <View style={{ flex: 1 }}>
          <Text style={GlobalStyles['heading3'] as TextStyle}>{application.applicantName}</Text>
          <Text style={GlobalStyles['body'] as TextStyle}>Applying for: {application.petName}</Text>
        </View>
        <View style={[styles.eliteStatusBadge, { backgroundColor: `${getStatusColor(application.status)}20` }]}>
          <Text style={[styles.eliteStatusText, { color: getStatusColor(application.status) }]}>
            {getStatusIcon(application.status)}{' '}
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.eliteApplicationDetails}>
        <View style={styles.eliteDetailRow}>
          <Ionicons name="mail" size={16} color={colors.onMuted} />
          <Text style={[styles.eliteDetailText, { color: colors.onSurface }]}>
            {application.applicantEmail}
          </Text>
        </View>
        <View style={styles.eliteDetailRow}>
          <Ionicons name="home" size={16} color={colors.onMuted} />
          <Text style={[styles.eliteDetailText, { color: colors.onSurface }]}>
            {application.livingSpace}
          </Text>
        </View>
        <View style={styles.eliteDetailRow}>
          <Ionicons name="star" size={16} color={colors.onMuted} />
          <Text style={[styles.eliteDetailText, { color: colors.onSurface }]}>
            {application.experience}
          </Text>
        </View>
        <View style={styles.eliteDetailRow}>
          <Ionicons name="people" size={16} color={colors.onMuted} />
          <Text style={[styles.eliteDetailText, { color: colors.onSurface }]}>
            {application.references} references
          </Text>
        </View>
      </View>

      {application.status === 'pending' && (
        <View style={styles.eliteActionsContainer}>
          <EliteButton
            title="Reject"
            variant="ghost"
            size="sm"
            icon="close"
            onPress={() => onReject(application.id)}
            style={StyleSheet.flatten([{ flex: 1 }, { borderColor: Colors.error[500] }])}
          />
          <View style={GlobalStyles['mx2'] as ViewStyle} />
          <EliteButton
            title="Approve"
            variant="primary"
            size="sm"
            icon="checkmark"
            onPress={() => onApprove(application.id)}
            style={{ flex: 1 }}
            gradientEffect
            gradientColors={[Colors.success, theme.colors.success]}
          />
        </View>
      )}
    </EliteCard>
  );
};

const styles = StyleSheet.create({
  eliteApplicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eliteStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eliteStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eliteApplicationDetails: {
    marginBottom: 16,
    gap: 12,
  },
  eliteDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eliteDetailText: {
    fontSize: 14,
    flex: 1,
  },
  eliteActionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

