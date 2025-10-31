/**
 * Elite Pet Listing Card Component
 * Elite-styled version for pet listings
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EliteButton, EliteCard } from '../../../components';
import { GlobalStyles } from '../../../animation';
import type { PetListing } from '../../../../hooks/screens/useAdoptionManagerScreen';

interface ElitePetListingCardProps {
  pet: PetListing;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  onViewDetails: (petId: string) => void;
  onReviewApps: (petId: string) => void;
  onChangeStatus: (pet: PetListing) => void;
}

export const ElitePetListingCard: React.FC<ElitePetListingCardProps> = ({
  pet,
  getStatusColor,
  getStatusIcon,
  onViewDetails,
  onReviewApps,
  onChangeStatus,
}) => {
  return (
    <EliteCard gradient blur style={GlobalStyles['mb4'] as ViewStyle}>
      <View style={styles.eliteListingHeader}>
        <View style={{ flex: 1 }}>
          <Text style={GlobalStyles['heading3'] as TextStyle}>{pet.name}</Text>
          <Text style={GlobalStyles['body'] as TextStyle}>
            {pet.breed} • {pet.age} years old
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.eliteStatusBadge, { backgroundColor: `${getStatusColor(pet.status)}20` }]}
          onPress={() => onChangeStatus(pet)}
          testID={`elite-status-badge-${pet.id}`}
          accessibilityLabel={`Change status for ${pet.name}`}
          accessibilityRole="button"
        >
          <Text style={[styles.eliteStatusText, { color: getStatusColor(pet.status) }]}>
            {getStatusIcon(pet.status)}{' '}
            {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.eliteStatsContainer}>
        <View style={styles.eliteStat}>
          <Text style={styles.eliteStatNumber}>{pet.applications}</Text>
          <Text style={styles.eliteStatLabel}>Applications</Text>
        </View>
        <View style={styles.eliteStat}>
          <Text style={styles.eliteStatNumber}>{pet.views}</Text>
          <Text style={styles.eliteStatLabel}>Views</Text>
        </View>
        <View style={styles.eliteStat}>
          <Text style={styles.eliteStatNumber}>{pet.featured ? '⭐' : '—'}</Text>
          <Text style={styles.eliteStatLabel}>Featured</Text>
        </View>
      </View>

      <View style={styles.eliteActionsContainer}>
        <EliteButton
          title="View Details"
          variant="secondary"
          size="sm"
          icon="eye"
          onPress={() => onViewDetails(pet.id)}
          style={{ flex: 1 }}
        />
        <View style={GlobalStyles['mx2'] as ViewStyle} />
        <EliteButton
          title={`Review (${pet.applications})`}
          variant="primary"
          size="sm"
          icon="document-text"
          onPress={() => onReviewApps(pet.id)}
          style={{ flex: 1 }}
        />
      </View>
    </EliteCard>
  );
};

const styles = StyleSheet.create({
  eliteListingHeader: {
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
  eliteStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  eliteStat: {
    alignItems: 'center',
  },
  eliteStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eliteStatLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  eliteActionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

