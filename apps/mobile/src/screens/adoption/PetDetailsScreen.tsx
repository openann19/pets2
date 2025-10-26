import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { request } from "../../services/api";

type AdoptionStackParamList = {
  PetDetails: { petId: string };
};

type PetDetailsScreenProps = NativeStackScreenProps<
  AdoptionStackParamList,
  "PetDetails"
>;

interface PetDetails {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  description: string;
  photos: string[];
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  status: "active" | "pending" | "adopted" | "paused";
  applications: number;
  views: number;
  featured: boolean;
  listedAt: string;
}

const PetDetailsScreen = ({ navigation, route }: PetDetailsScreenProps) => {
  const { petId } = route.params;
  const [pet, setPet] = useState<PetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - would fetch from API
  React.useEffect(() => {
    const loadPetDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch pet details from API
        const petData = await request<PetDetails>(
          `/api/adoption/pets/${petId}`,
          {
            method: "GET",
          },
        );

        setPet(petData);
      } catch (error) {
        logger.error("Failed to load pet details:", { error });
        Alert.alert("Error", "Failed to load pet details");
      } finally {
        setIsLoading(false);
      }
    };

    loadPetDetails();
  }, [petId]);

  const handleStatusChange = (newStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Change Status",
      `Change ${pet?.name}'s status to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            if (pet) {
              setPet({ ...pet, status: newStatus as PetDetails['status'] });
              Alert.alert("Success", `Status updated to ${newStatus}`);
            }
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
      default:
        return "❓";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading pet details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
          <Text style={styles.emptyTitle}>Pet Not Found</Text>
          <Text style={styles.emptySubtitle}>Unable to load pet details</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pet Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Photo */}
        <View style={styles.photoSection}>
          <Image source={{ uri: pet.photos[0] }} style={styles.mainPhoto} />
          {pet.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Pet Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(pet.status)}20` },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(pet.status) },
                ]}
              >
                {getStatusIcon(pet.status)}{" "}
                {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
              </Text>
            </View>
          </View>

          <Text style={styles.petBreed}>{pet.breed}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pet.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pet.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pet.featured ? "⭐" : "—"}</Text>
              <Text style={styles.statLabel}>Featured</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {pet.name}</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <Text style={styles.description}>{pet.description}</Text>
          </BlurView>
        </View>

        {/* Personality Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.tagsContainer}>
              {pet.personalityTags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Health Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.healthInfo}>
              <View style={styles.healthItem}>
                <Ionicons
                  name={
                    pet.healthInfo.vaccinated
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={20}
                  color={pet.healthInfo.vaccinated ? "#10b981" : "#ef4444"}
                />
                <Text style={styles.healthText}>Vaccinated</Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons
                  name={
                    pet.healthInfo.spayedNeutered
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={20}
                  color={pet.healthInfo.spayedNeutered ? "#10b981" : "#ef4444"}
                />
                <Text style={styles.healthText}>Spayed/Neutered</Text>
              </View>
              <View style={styles.healthItem}>
                <Ionicons
                  name={
                    pet.healthInfo.microchipped
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={20}
                  color={pet.healthInfo.microchipped ? "#10b981" : "#ef4444"}
                />
                <Text style={styles.healthText}>Microchipped</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  "Coming Soon",
                  "Application review feature coming soon!",
                );
              }}
            >
              <LinearGradient
                colors={["#3b82f6", "#1d4ed8"]}
                style={styles.actionGradient}
              >
                <Ionicons name="document-text" size={24} color="#fff" />
                <Text style={styles.actionText}>Review Applications</Text>
                <Text style={styles.actionCount}>({pet.applications})</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert("Edit", "Edit pet details coming soon!");
              }}
            >
              <LinearGradient
                colors={["#10b981", "#047857"]}
                style={styles.actionGradient}
              >
                <Ionicons name="create" size={24} color="#fff" />
                <Text style={styles.actionText}>Edit Details</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Status</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.statusOptions}>
              {["active", "pending", "adopted", "paused"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    pet.status === status && styles.statusOptionActive,
                  ]}
                  onPress={() => {
                    handleStatusChange(status);
                  }}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      pet.status === status && styles.statusOptionTextActive,
                    ]}
                  >
                    {getStatusIcon(status)}{" "}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  photoSection: {
    position: "relative",
  },
  mainPhoto: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  featuredBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbbf24",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  featuredText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  infoSection: {
    padding: 20,
    backgroundColor: "#fff",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  petName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  petBreed: {
    fontSize: 18,
    color: "#6b7280",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ec4899",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4b5563",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  healthInfo: {
    gap: 12,
  },
  healthItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  healthText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  actionCount: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  statusOptions: {
    gap: 8,
  },
  statusOption: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  statusOptionActive: {
    backgroundColor: "#fdf2f8",
    borderColor: "#ec4899",
  },
  statusOptionText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  statusOptionTextActive: {
    color: "#ec4899",
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#ec4899",
    fontWeight: "600",
  },
});
