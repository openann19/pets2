import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  StyleSheet,
} from "react-native";

import {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  EliteCard,
  EliteButton,
  EliteLoading,
  EliteEmptyState,
} from "../../components";
import {
  GlobalStyles,
  Colors,
  Spacing,
  Shadows,
} from "../../animation";
import type { RootStackScreenProps } from "../../navigation/types";
import { Theme } from '../../theme/unified-theme';
import { useAdoptionManagerScreen } from "../../hooks/screens/useAdoptionManagerScreen";
import type { PetListing } from "../../hooks/screens/useAdoptionManagerScreen";

// Helper to convert rem spacing to pixels
const sp = (key: number): number => {
  const value = Spacing[key as keyof typeof Spacing];
  if (typeof value === 'string') {
    return Number.parseFloat(value.replace('rem', '')) * 16;
  }
  return value as number;
};

type AdoptionManagerScreenProps = RootStackScreenProps<"AdoptionManager">;

interface PetListing {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  status: "active" | "pending" | "adopted" | "paused";
  photos: string[];
  applications: number;
  views: number;
  featured: boolean;
  listedAt: string;
}

interface AdoptionApplication {
  id: string;
  petId: string;
  petName: string;
  applicantName: string;
  applicantEmail: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  submittedAt: string;
  experience: string;
  livingSpace: string;
  references: number;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const VALID_LISTING_STATUSES = new Set<PetListing["status"]>([
  "active",
  "pending",
  "adopted",
  "paused",
]);

const normalizeListing = (listing: unknown): PetListing => {
  const item = listing as Record<string, unknown>;
  const id = (item.id ?? item._id ?? "") as string;

  return {
    id,
    name: (item.name as string) ?? "Unknown Pet",
    species: (item.species as string) ?? "Unknown",
    breed: (item.breed as string) ?? "Unknown",
    age: typeof item.age === "number" ? item.age : 0,
    status: VALID_LISTING_STATUSES.has(item.status as PetListing["status"])
      ? (item.status as PetListing["status"])
      : "pending",
    photos: Array.isArray(item.photos)
      ? (item.photos as string[])
      : [],
    applications: typeof item.applications === "number" ? item.applications : 0,
    views: typeof item.views === "number" ? item.views : 0,
    featured: typeof item.featured === "boolean" ? item.featured : false,
    listedAt:
      typeof item.listedAt === "string"
        ? (item.listedAt as string)
        : new Date().toISOString(),
  };
};

const normalizeApplication = (application: unknown): AdoptionApplication => {
  const item = application as Record<string, unknown>;
  const status = item.status as AdoptionApplication["status"];

  return {
    id: (item.id ?? item._id ?? "") as string,
    petId: (item.petId ?? "") as string,
    petName:
      (item.petName as string) ?? ((item.pet as { name?: string })?.name ?? "Unknown"),
    applicantName:
      (item.applicantName as string) ??
      ((item.applicant as { name?: string })?.name ?? "Pending Applicant"),
    applicantEmail:
      (item.applicantEmail as string) ??
      ((item.applicant as { email?: string })?.email ?? "unknown@example.com"),
    status:
      status && ["pending", "approved", "rejected", "withdrawn"].includes(status)
        ? status
        : "pending",
    submittedAt:
      typeof item.submittedAt === "string"
        ? (item.submittedAt as string)
        : new Date().toISOString(),
    experience:
      (item.experience as string) ??
      ((item.applicationData as { experience?: string })?.experience ?? ""),
    livingSpace:
      (item.livingSpace as string) ??
      ((item.applicationData as { livingSituation?: string })?.livingSituation ?? ""),
    references:
      typeof item.references === "number"
        ? item.references
        : ((item.applicationData as { references?: number })?.references ?? 0),
  };
};

const AdoptionManagerScreen = ({ navigation }: AdoptionManagerScreenProps) => {
  // Use the extracted hook for all business logic
  const {
    activeTab,
    refreshing,
    showStatusModal,
    selectedPet,
    isLoading,
    error,
    petListings,
    applications,
    setActiveTab,
    setShowStatusModal,
    setSelectedPet,
    onRefresh,
    handleTabPress,
    handleStatusChange,
    handleApplicationAction,
    getStatusColor,
    getStatusIcon,
    tabAnimatedStyle1,
    tabAnimatedStyle2,
    tabScale1,
    tabScale2,
  } = useAdoptionManagerScreen();

  const renderListings = () => (
    <View style={styles.tabContent}>
      {petListings.map((pet) => (
        <View key={pet.id} style={styles.listingCard}>
          <View style={styles.listingHeader}>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>
                {pet.breed} • {pet.age} years old
              </Text>
            </View>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(pet.status)}20` },
              ])}
              onPress={() => {
                setSelectedPet(pet);
                setShowStatusModal(true);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.statusText,
                  { color: getStatusColor(pet.status) },
                ])}
              >
                {getStatusIcon(pet.status)}{" "}
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listingStats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{pet.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{pet.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{pet.featured ? "⭐" : "—"}</Text>
              <Text style={styles.statLabel}>Featured</Text>
            </View>
          </View>

          <View style={styles.listingActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate("PetDetails", { petId: pet.id })
              }
            >
              <Text style={styles.actionButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.primaryButton,
              ])}
              onPress={() =>
                navigation.navigate("ApplicationReview", {
                  applicationId: pet.id,
                })
              }
            >
              <Text
                style={StyleSheet.flatten([
                  styles.actionButtonText,
                  styles.primaryButtonText,
                ])}
              >
                Review Apps ({pet.applications})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderEliteListings = () => (
    <View style={GlobalStyles.py4}>
      {petListings.map((pet) => (
        <EliteCard key={pet.id} gradient blur style={GlobalStyles.mb4}>
          <View style={styles.eliteListingHeader}>
            <View style={{ flex: 1 }}>
              <Text style={GlobalStyles.heading3}>{pet.name}</Text>
              <Text style={GlobalStyles.body}>
                {pet.breed} • {pet.age} years old
              </Text>
            </View>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.eliteStatusBadge,
                { backgroundColor: `${getStatusColor(pet.status)}20` },
              ])}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPet(pet);
                setShowStatusModal(true);
              }}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.eliteStatusText,
                  { color: getStatusColor(pet.status) },
                ])}
              >
                {getStatusIcon(pet.status)}{" "}
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
              <Text style={styles.eliteStatNumber}>
                {pet.featured ? "⭐" : "—"}
              </Text>
              <Text style={styles.eliteStatLabel}>Featured</Text>
            </View>
          </View>

          <View style={styles.eliteActionsContainer}>
            <EliteButton
              title="View Details"
              variant="secondary"
              size="sm"
              icon="eye"
              onPress={() =>
                navigation.navigate("PetDetails", { petId: pet.id })
              }
              style={{ flex: 1 }}
            />
            <View style={GlobalStyles.mx2} />
            <EliteButton
              title={`Review (${pet.applications})`}
              variant="primary"
              size="sm"
              icon="document-text"
              onPress={() =>
                navigation.navigate("ApplicationReview", {
                  applicationId: pet.id,
                })
              }
              style={{ flex: 1 }}
            />
          </View>
        </EliteCard>
      ))}
    </View>
  );

  const renderEliteApplications = () => (
    <View style={GlobalStyles.py4}>
      {applications.map((app) => (
        <EliteCard key={app.id} gradient blur style={GlobalStyles.mb4}>
          <View style={styles.eliteApplicationHeader}>
            <View style={{ flex: 1 }}>
              <Text style={GlobalStyles.heading3}>{app.applicantName}</Text>
              <Text style={GlobalStyles.body}>Applying for: {app.petName}</Text>
            </View>
            <View
              style={StyleSheet.flatten([
                styles.eliteStatusBadge,
                { backgroundColor: `${getStatusColor(app.status)}20` },
              ])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.eliteStatusText,
                  { color: getStatusColor(app.status) },
                ])}
              >
                {getStatusIcon(app.status)}{" "}
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.eliteApplicationDetails}>
            <View style={styles.eliteDetailRow}>
              <Ionicons name="mail" size={16} color={Colors.gray500} />
              <Text style={styles.eliteDetailText}>{app.applicantEmail}</Text>
            </View>
            <View style={styles.eliteDetailRow}>
              <Ionicons name="home" size={16} color={Colors.gray500} />
              <Text style={styles.eliteDetailText}>{app.livingSpace}</Text>
            </View>
            <View style={styles.eliteDetailRow}>
              <Ionicons name="star" size={16} color={Colors.gray500} />
              <Text style={styles.eliteDetailText}>{app.experience}</Text>
            </View>
            <View style={styles.eliteDetailRow}>
              <Ionicons name="people" size={16} color={Colors.gray500} />
              <Text style={styles.eliteDetailText}>
                {app.references} references
              </Text>
            </View>
          </View>

          {app.status === "pending" && (
            <View style={styles.eliteActionsContainer}>
              <EliteButton
                title="Reject"
                variant="ghost"
                size="sm"
                icon="close"
                onPress={() => {
                  handleApplicationAction(app.id, "reject");
                }}
                style={StyleSheet.flatten([
                  { flex: 1 },
                  { borderColor: Colors.error },
                ])}
              />
              <View style={GlobalStyles.mx2} />
              <EliteButton
                title="Approve"
                variant="primary"
                size="sm"
                icon="checkmark"
                onPress={() => {
                  handleApplicationAction(app.id, "approve");
                }}
                style={{ flex: 1 }}
                gradient={[Colors.success, "Theme.colors.status.success"]}
              />
            </View>
          )}
        </EliteCard>
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <EliteContainer>
        <EliteLoading size="large" />
      </EliteContainer>
    );
  }

  return (
    <EliteContainer gradient="gradientPrimary">
      {/* Elite Header */}
      <EliteHeader
        title="Adoption Manager"
        rightComponent={
          <EliteButton
            title="Add Pet"
            icon="add"
            size="sm"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("CreateListing");
            }}
          />
        }
      />

      {/* Elite Tab System */}
      <View style={styles.tabContainer}>
        <Animated.View style={tabAnimatedStyle1}>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.eliteTab,
              activeTab === "listings" && styles.eliteActiveTab,
            ])}
            onPress={() => {
              handleTabPress("listings", tabScale1);
            }}
          >
            <Ionicons
              name="list"
              size={20}
              color={activeTab === "listings" ? Colors.white : Colors.gray500}
            />
            <Text
              style={StyleSheet.flatten([
                styles.eliteTabText,
                activeTab === "listings" && styles.eliteActiveTabText,
              ])}
            >
              My Listings ({petListings.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={tabAnimatedStyle2}>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.eliteTab,
              activeTab === "applications" && styles.eliteActiveTab,
            ])}
            onPress={() => {
              handleTabPress("applications", tabScale2);
            }}
          >
            <Ionicons
              name="document-text"
              size={20}
              color={
                activeTab === "applications" ? Colors.white : Colors.gray500
              }
            />
            <Text
              style={StyleSheet.flatten([
                styles.eliteTabText,
                activeTab === "applications" && styles.eliteActiveTabText,
              ])}
            >
              Applications ({applications.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Elite Content */}
      <EliteScrollContainer
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {petListings.length === 0 && activeTab === "listings" ? (
          <EliteEmptyState
            icon="paw"
            title="No pets listed yet"
            message="Start by adding your first pet for adoption. It's easy and helps pets find loving homes!"
          />
        ) : applications.length === 0 && activeTab === "applications" ? (
          <EliteEmptyState
            icon="document-text"
            title="No applications yet"
            message="Once people start applying for your pets, you'll see all applications here."
          />
        ) : activeTab === "listings" ? (
          renderEliteListings()
        ) : (
          renderEliteApplications()
        )}
      </EliteScrollContainer>

      {/* Elite Status Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowStatusModal(false);
        }}
      >
        <View style={GlobalStyles.modalOverlay}>
          <View style={GlobalStyles.modalContent}>
            <Text style={GlobalStyles.heading2}>
              Change Status for {selectedPet?.name}
            </Text>

            <View style={styles.statusOptions}>
              {["active", "pending", "adopted", "paused"].map((status) => (
                <EliteButton
                  key={status}
                  title={`${getStatusIcon(status)} ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  variant="ghost"
                  onPress={() =>
                    selectedPet && handleStatusChange(selectedPet, status)
                  }
                  style={styles.statusOptionButton}
                />
              ))}
            </View>

            <EliteButton
              title="Cancel"
              variant="secondary"
              onPress={() => {
                setShowStatusModal(false);
              }}
              style={GlobalStyles.mt4}
            />
          </View>
        </View>
      </Modal>
    </EliteContainer>
  );
};

const styles = {
  // === BASIC STYLES ===
  tabContent: {
    flex: 1,
    padding: sp(6),
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: sp(6),
    marginBottom: sp(4),
    borderWidth: 1,
    borderColor: Colors.gray200,
    ...Shadows.sm,
  },
  listingHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: sp(4),
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.gray900,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: Colors.gray600,
  },
  statusBadge: {
    paddingHorizontal: sp(4),
    paddingVertical: sp(3),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  listingStats: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    paddingVertical: sp(4),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray200,
    marginVertical: sp(4),
  },
  stat: {
    alignItems: "center" as const,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray600,
    textAlign: "center" as const,
  },
  listingActions: {
    flexDirection: "row" as const,
    gap: sp(4),
  },
  actionButton: {
    flex: 1,
    paddingVertical: sp(4),
    paddingHorizontal: sp(6),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
    alignItems: "center" as const,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.gray700,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.white,
  },

  // === ELITE TAB SYSTEM ===
  tabContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: sp(12),
    paddingVertical: sp(6),
    gap: sp(4),
  },
  eliteTab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: sp(6),
    paddingHorizontal: sp(8),
    borderRadius: 16,
    backgroundColor: Colors.glassWhite,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
    gap: sp(2),
  },
  eliteActiveTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
    ...Shadows.md,
  },
  eliteTabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.gray500,
  },
  eliteActiveTabText: {
    color: Colors.white,
  },

  // === ELITE LISTING STYLES ===
  eliteListingHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: sp(6),
  },
  eliteStatusBadge: {
    paddingHorizontal: sp(4),
    paddingVertical: sp(3),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
  },
  eliteStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  eliteStatsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    paddingVertical: sp(6),
    marginVertical: sp(6),
    backgroundColor: Colors.glassWhiteLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
  },
  eliteStat: {
    alignItems: "center" as const,
  },
  eliteStatNumber: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.primary,
    marginBottom: sp(1),
  },
  eliteStatLabel: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: "500" as const,
  },
  eliteActionsContainer: {
    flexDirection: "row" as const,
    marginTop: sp(6),
    gap: sp(4),
  },

  // === ELITE APPLICATION STYLES ===
  eliteApplicationHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: sp(6),
  },
  eliteApplicationDetails: {
    gap: sp(4),
    marginBottom: sp(6),
  },
  eliteDetailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: sp(4),
    paddingVertical: sp(3),
    paddingHorizontal: sp(4),
    backgroundColor: Colors.glassWhiteLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
  },
  eliteDetailText: {
    fontSize: 14,
    color: Colors.gray600,
    fontWeight: "500" as const,
    flex: 1,
  },

  // === MODAL STYLES ===
  statusOptions: {
    gap: sp(4),
    marginVertical: sp(6),
  },
  statusOptionButton: {
    marginBottom: sp(3),
  },
};

export default AdoptionManagerScreen;
