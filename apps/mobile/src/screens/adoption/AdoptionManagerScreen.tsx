import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  EliteCard,
  EliteButton,
  EliteLoading,
  EliteEmptyState,
} from "../../components/EliteComponents";
import { adoptionAPI } from "../../services/api";
import {
  GlobalStyles,
  Colors,
  Spacing,
  Shadows,
} from "../../styles/GlobalStyles";
import type { RootStackScreenProps } from "../../navigation/types";

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

const AdoptionManagerScreen = ({ navigation }: AdoptionManagerScreenProps) => {
  const [activeTab, setActiveTab] = useState<"listings" | "applications">(
    "listings",
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ REAL DATA - Fetched from backend API
  const [petListings, setPetListings] = useState<PetListing[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);

  // ✅ Load real data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === "listings") {
        const listingsData = await adoptionAPI.getListings();
        setPetListings(listingsData as PetListing[]);
      } else {
        const applicationsData = await adoptionAPI.getApplications();
        setApplications(applicationsData as AdoptionApplication[]);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load data. Please try again.";
      logger.error("Failed to load adoption data:", { error: err });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabScale1 = useSharedValue(1);
  const tabScale2 = useSharedValue(1);

  const tabAnimatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale1.value }],
  }));

  const tabAnimatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: tabScale2.value }],
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTabPress = (
    tab: "listings" | "applications",
    scaleValue: import("react-native-reanimated").SharedValue<number>,
  ) => {
    setActiveTab(tab);
    scaleValue.value = withSpring(0.95, SPRING_CONFIG, () => {
      scaleValue.value = withSpring(1, SPRING_CONFIG);
    });
  };

  const handleStatusChange = (pet: PetListing, newStatus: string) => {
    setPetListings((prev) =>
      prev.map((p) =>
        p.id === pet.id
          ? { ...p, status: newStatus as PetListing["status"] }
          : p,
      ),
    );
    setShowStatusModal(false);
    setSelectedPet(null);
  };

  const handleApplicationAction = (
    applicationId: string,
    action: "approve" | "reject",
  ) => {
    Alert.alert(
      `${action === "approve" ? "Approve" : "Reject"} Application`,
      `Are you sure you want to ${action} this application?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "approve" ? "Approve" : "Reject",
          style: action === "approve" ? "default" : "destructive",
          onPress: () => {
            setApplications((prev) =>
              prev.map((app) =>
                app.id === applicationId
                  ? {
                      ...app,
                      status: action === "approve" ? "approved" : "rejected",
                    }
                  : app,
              ),
            );
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "adopted":
        return "#8b5cf6";
      case "paused":
        return "#6b7280";
      case "approved":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "✅";
      case "pending":
        return "⏳";
      case "adopted":
        return "🏠";
      case "paused":
        return "⏸️";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  };

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
                gradient={[Colors.success, "#10b981"]}
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
        <EliteLoading
          title="Loading your pets..."
          subtitle="Getting your adoption listings and applications ready"
        />
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
            size="small"
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
    padding: Spacing.lg,
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    ...Shadows.sm,
  },
  listingHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: Spacing.md,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray200,
    marginVertical: Spacing.md,
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
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
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
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  eliteTab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    backgroundColor: Colors.glassWhite,
    borderWidth: 1,
    borderColor: Colors.glassWhiteDark,
    gap: Spacing.sm,
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
    marginBottom: Spacing.lg,
  },
  eliteStatusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
    paddingVertical: Spacing.lg,
    marginVertical: Spacing.lg,
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
    marginBottom: Spacing.xs,
  },
  eliteStatLabel: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: "500" as const,
  },
  eliteActionsContainer: {
    flexDirection: "row" as const,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  // === ELITE APPLICATION STYLES ===
  eliteApplicationHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    marginBottom: Spacing.lg,
  },
  eliteApplicationDetails: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  eliteDetailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  statusOptionButton: {
    marginBottom: Spacing.sm,
  },
};

export default AdoptionManagerScreen;
