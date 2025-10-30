/**
 * Pet Listing Card Component
 * Displays a single pet listing in adoption manager
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PetListing } from "../../../../hooks/screens/useAdoptionManagerScreen";
import { useTheme } from "@mobile/theme";
import type { AppTheme } from "@mobile/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  listingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  petInfo: {
    flex: 1,
    marginRight: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listingStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  listingActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "#fff",
  },
});
}


interface PetListingCardProps {
  pet: PetListing;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  onViewDetails: (petId: string) => void;
  onReviewApps: (petId: string) => void;
  onChangeStatus: (pet: PetListing) => void;
}

export const PetListingCard: React.FC<PetListingCardProps> = ({
  pet,
  getStatusColor,
  getStatusIcon,
  onViewDetails,
  onReviewApps,
  onChangeStatus,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={[styles.listingCard, { backgroundColor: colors.surface }]}>
      <View style={styles.listingHeader}>
        <View style={styles.petInfo}>
          <Text style={[styles.petName, { color: colors.onSurface }]}>{pet.name}</Text>
          <Text style={[styles.petBreed, { color: colors.onMuted }]}>
            {pet.breed} • {pet.age} years old
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: `${getStatusColor(pet.status)}20` }]}
          onPress={() => onChangeStatus(pet)}
          testID={`status-badge-${pet.id}`}
          accessibilityLabel={`Change status for ${pet.name}`}
          accessibilityRole="button"
        >
          <Text style={[styles.statusText, { color: getStatusColor(pet.status) }]}>
            {getStatusIcon(pet.status)} {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listingStats}>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.onSurface }]}>{pet.applications}</Text>
          <Text style={[styles.statLabel, { color: colors.onMuted }]}>Applications</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.onSurface }]}>{pet.views}</Text>
          <Text style={[styles.statLabel, { color: colors.onMuted }]}>Views</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: colors.onSurface }]}>{pet.featured ? "⭐" : "—"}</Text>
          <Text style={[styles.statLabel, { color: colors.onMuted }]}>Featured</Text>
        </View>
      </View>

      <View style={styles.listingActions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.border }]}
          onPress={() => onViewDetails(pet.id)}
          testID={`view-details-${pet.id}`}
          accessibilityLabel="View pet details"
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, { color: colors.onSurface }]}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => onReviewApps(pet.id)}
          testID={`review-apps-${pet.id}`}
          accessibilityLabel={`Review ${pet.applications} applications`}
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, styles.primaryButtonText]}>Review Apps ({pet.applications})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
