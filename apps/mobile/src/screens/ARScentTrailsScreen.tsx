import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { matchesAPI } from "../services/api";
import { logger } from "@pawfectmatch/core";

type MapStackParamList = {
  ARScentTrails: undefined;
};

type ARScentTrailsScreenProps = NativeStackScreenProps<
  MapStackParamList,
  "ARScentTrails"
>;

const ARScentTrailsScreen = ({ navigation }: ARScentTrailsScreenProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scentTrails, setScentTrails] = useState<
    Array<{
      id: string;
      petName: string;
      petBreed: string;
      distance: string;
      direction: string;
      intensity: string;
      lastSeen: string;
      petPhoto: string;
    }>
  >([]);

  const startScanning = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsScanning(true);

    try {
      // Get user's current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to scan for scent trails.",
        );
        setIsScanning(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch nearby pets using geolocation API
      const nearbyPets = await matchesAPI.getNearbyPets(
        latitude,
        longitude,
        1000,
      ); // 1km radius

      // Convert pets to scent trail format
      const newScentTrails = nearbyPets.map((pet, index) => ({
        id: pet._id,
        petName: pet.name,
        petBreed: pet.breed || "Unknown",
        distance: `${Math.floor(Math.random() * 500) + 50}m`, // Mock distance calculation
        direction: [
          "north",
          "east",
          "south",
          "west",
          "northeast",
          "northwest",
          "southeast",
          "southwest",
        ][index % 8],
        intensity: ["strong", "medium", "weak"][index % 3],
        lastSeen: `${Math.floor(Math.random() * 30) + 1} minutes ago`,
        petPhoto:
          pet.photos?.[0] ||
          "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200",
      }));

      setScentTrails(newScentTrails);
      Alert.alert(
        "Scan Complete",
        `Found ${newScentTrails.length} scent trails nearby!`,
      );
    } catch (error) {
      logger.error("Scent trail scanning failed:", { error });
      Alert.alert(
        "Scan Failed",
        "Unable to scan for scent trails. Please try again.",
      );
    } finally {
      setIsScanning(false);
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "strong":
        return "#10b981";
      case "medium":
        return "#f59e0b";
      case "weak":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "north":
        return "↑";
      case "south":
        return "↓";
      case "east":
        return "→";
      case "west":
        return "←";
      case "northeast":
        return "↗";
      case "northwest":
        return "↖";
      case "southeast":
        return "↘";
      case "southwest":
        return "↙";
      default:
        return "•";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AR Scent Trails</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* AR View Container */}
      <View style={styles.arContainer}>
        <BlurView intensity={30} style={styles.arView}>
          <View style={styles.arContent}>
            <Ionicons name="camera" size={80} color="#fff" />
            <Text style={styles.arTitle}>Augmented Reality</Text>
            <Text style={styles.arSubtitle}>
              Point your camera to detect scent trails in your area
            </Text>

            {isScanning ? (
              <View style={styles.scanningContainer}>
                <View style={styles.scanningAnimation}>
                  <Ionicons name="scan" size={40} color="#ec4899" />
                </View>
                <Text style={styles.scanningText}>
                  Scanning for scent trails...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.scanButton}
                onPress={startScanning}
              >
                <LinearGradient
                  colors={["#ec4899", "#db2777"]}
                  style={styles.scanButtonGradient}
                >
                  <Ionicons name="search" size={24} color="#fff" />
                  <Text style={styles.scanButtonText}>Start Scanning</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>

      {/* Scent Trails List */}
      <View style={styles.trailsSection}>
        <Text style={styles.sectionTitle}>Detected Scent Trails</Text>

        {scentTrails.length === 0 ? (
          <BlurView intensity={20} style={styles.emptyState}>
            <Ionicons name="paw-outline" size={60} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Scent Trails Found</Text>
            <Text style={styles.emptySubtitle}>
              Start scanning to detect nearby pet scent trails
            </Text>
          </BlurView>
        ) : (
          <View style={styles.trailsList}>
            {scentTrails.map((trail) => (
              <TouchableOpacity
                key={trail.id}
                style={styles.trailCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    "Follow Trail",
                    `Follow ${trail.petName}'s scent trail?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Follow",
                        onPress: () => {
                          Alert.alert(
                            "Navigation",
                            "Starting navigation to scent trail...",
                          );
                        },
                      },
                    ],
                  );
                }}
              >
                <Image
                  source={{ uri: trail.petPhoto }}
                  style={styles.petImage}
                />

                <View style={styles.trailInfo}>
                  <View style={styles.trailHeader}>
                    <Text style={styles.petName}>{trail.petName}</Text>
                    <View
                      style={[
                        styles.intensityBadge,
                        {
                          backgroundColor: `${getIntensityColor(trail.intensity)}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.intensityText,
                          { color: getIntensityColor(trail.intensity) },
                        ]}
                      >
                        {trail.intensity.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.petBreed}>{trail.petBreed}</Text>

                  <View style={styles.trailDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="navigate" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        {getDirectionIcon(trail.direction)} {trail.distance}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{trail.lastSeen}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.followButton}>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert("Filter", "Filter scent trails by intensity");
            }}
          >
            <LinearGradient
              colors={["#3b82f6", "#1d4ed8"]}
              style={styles.actionGradient}
            >
              <Ionicons name="filter" size={20} color="#fff" />
              <Text style={styles.actionText}>Filter</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert("Map View", "Switch to map view");
            }}
          >
            <LinearGradient
              colors={["#10b981", "#047857"]}
              style={styles.actionGradient}
            >
              <Ionicons name="map" size={20} color="#fff" />
              <Text style={styles.actionText}>Map</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert("Settings", "AR settings");
            }}
          >
            <LinearGradient
              colors={["#8b5cf6", "#7c3aed"]}
              style={styles.actionGradient}
            >
              <Ionicons name="settings" size={20} color="#fff" />
              <Text style={styles.actionText}>Settings</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  backButton: {
    padding: 8,
  },
  arContainer: {
    height: 300,
    backgroundColor: "#000",
  },
  arView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  arContent: {
    alignItems: "center",
    padding: 20,
  },
  arTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  arSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 24,
  },
  scanningContainer: {
    alignItems: "center",
  },
  scanningAnimation: {
    marginBottom: 16,
  },
  scanningText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  scanButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  scanButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  trailsSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  trailsList: {
    gap: 12,
  },
  trailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  trailInfo: {
    flex: 1,
  },
  trailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  petBreed: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  trailDetails: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
  },
  followButton: {
    padding: 8,
  },
  actionsSection: {
    padding: 20,
    paddingBottom: 40,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ARScentTrailsScreen;
