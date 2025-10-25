import { useAuthStore } from "@pawfectmatch/core";
import { logger } from "@pawfectmatch/core";
import Geolocation from "@react-native-community/geolocation";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Region } from "react-native-maps";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { PERMISSIONS, RESULTS, request } from "react-native-permissions";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";

import { SOCKET_URL } from "../config/environment";
import type { RootStackParamList } from "../navigation/types";

type MapScreenProps = NativeStackScreenProps<RootStackParamList, "Map">;

type ArScentTrailsNavigation = {
  navigate: (
    screen: "ARScentTrails",
    params: RootStackParamList["ARScentTrails"],
  ) => void;
};

const { width } = Dimensions.get("window");

interface MapFilters {
  showMyPets: boolean;
  showMatches: boolean;
  showNearby: boolean;
  activityTypes: string[];
  radius: number;
}

interface MapStats {
  totalPets: number;
  activePets: number;
  nearbyMatches: number;
  recentActivity: number;
}

interface PulsePin {
  _id: string;
  latitude: number;
  longitude: number;
  coordinates?: [number, number]; // For backward compatibility
  activity: string;
  petId: string;
  userId: string;
  timestamp: string;
  message?: string;
  createdAt: string;
}

interface ActivityType {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
}

function MapScreen({ navigation }: MapScreenProps): React.JSX.Element {
  const { user } = useAuthStore();
  const [region, setRegion] = useState<Region>({
    latitude: 40.7589,
    longitude: -73.9851,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [pins, setPins] = useState<PulsePin[]>([]);
  const [selectedPin, setSelectedPin] = useState<PulsePin | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    showMyPets: true,
    showMatches: true,
    showNearby: true,
    activityTypes: ["walking", "playing", "feeding"],
    radius: 5,
  });
  const [stats, setStats] = useState<MapStats>({
    totalPets: 0,
    activePets: 0,
    nearbyMatches: 0,
    recentActivity: 0,
  });
  const [filterPanelHeight] = useState(new Animated.Value(0));
  const [statsOpacity] = useState(new Animated.Value(1));
  const socketRef = useRef<Socket | null>(null);

  // Activity types configuration
  const activityTypes = useMemo<ActivityType[]>(
    () => [
      {
        id: "walking",
        name: "Walking",
        label: "Walking",
        emoji: "🚶‍♂️",
        color: "#4CAF50",
      },
      {
        id: "playing",
        name: "Playing",
        label: "Playing",
        emoji: "🎾",
        color: "#FF9800",
      },
      {
        id: "feeding",
        name: "Feeding",
        label: "Feeding",
        emoji: "🍽️",
        color: "#9C27B0",
      },
      {
        id: "resting",
        name: "Resting",
        label: "Resting",
        emoji: "😴",
        color: "#607D8B",
      },
      {
        id: "training",
        name: "Training",
        label: "Training",
        emoji: "🎯",
        color: "#E91E63",
      },
    ],
    [],
  );

  // Get current location
  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error: unknown) => {
        logger.error("Location error:", { error });
        Alert.alert("Location Error", "Unable to get your current location.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  // Location permission request
  const requestLocationPermission = useCallback(async () => {
    try {
      const permission = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );

      if (permission === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        Alert.alert(
          "Location Permission",
          "Please enable location access to see nearby pets.",
        );
      }
    } catch (error: unknown) {
      logger.error("Location permission error:", { error });
    }
  }, [getCurrentLocation]);

  const socketUrl = useMemo(() => {
    const expoSocketUrl =
      process.env.EXPO_PUBLIC_SOCKET_URL ??
      process.env.REACT_NATIVE_SOCKET_URL ??
      process.env.SOCKET_URL ??
      process.env.REACT_APP_SOCKET_URL;

    if (expoSocketUrl && expoSocketUrl.trim().length > 0) {
      return expoSocketUrl;
    }

    if (SOCKET_URL && SOCKET_URL.trim().length > 0) {
      return SOCKET_URL;
    }

    logger.warn("No socket URL configured; falling back to default localhost.");
    return "http://localhost:5000";
  }, []);

  useEffect(() => {
    if (!socketUrl) {
      logger.error("Socket URL is undefined; skipping socket initialization.");
      return undefined;
    }

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      upgrade: true,
    });

    newSocket.on("connect", () => {
      logger.info("📱 Mobile map connected to socket");
      if (user?._id) {
        newSocket.emit("join", { userId: user._id });
      }
    });

    newSocket.on("authenticated", () => {
      logger.info("✅ Mobile map authenticated");
      newSocket.emit("request:initial-pins", { radius: filters.radius });
    });

    newSocket.on("pin:update", (pin: PulsePin) => {
      setPins((prev) => {
        const updated = prev.filter((p) => p._id !== pin._id);
        return [...updated, pin].slice(-100);
      });
    });

    newSocket.on("pin:remove", (pinId: string) => {
      setPins((prev) => prev.filter((p) => p._id !== pinId));
    });

    newSocket.on("nearby:response", (nearbyPins: PulsePin[]) => {
      setPins(nearbyPins);
    });

    socketRef.current = newSocket;

    return () => {
      socketRef.current = null;
      newSocket.disconnect();
    };
  }, [user?._id, filters.radius, socketUrl]);

  // Request location permission on mount
  useEffect(() => {
    void requestLocationPermission();
  }, [requestLocationPermission]);

  // Simulate stats updates
  useEffect(() => {
    const updateStats = () => {
      setStats({
        totalPets: Math.floor(Math.random() * 50) + 20,
        activePets: pins.length,
        nearbyMatches: Math.floor(Math.random() * 8) + 2,
        recentActivity: Math.floor(Math.random() * 12) + 3,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 15000);
    return () => {
      clearInterval(interval);
    };
  }, [pins.length]);

  // Filter pins based on current filters
  const toRadians = useCallback((degrees: number): number => {
    return degrees * (Math.PI / 180);
  }, []);

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const earthRadiusKm = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return earthRadiusKm * c;
    },
    [toRadians],
  );

  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      if (!filters.activityTypes.includes(pin.activity)) return false;
      // Add distance filtering if user location is available
      if (userLocation && filters.radius) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          pin.latitude,
          pin.longitude,
        );
        return distance <= filters.radius;
      }
      return true;
    });
  }, [calculateDistance, filters, pins, userLocation]);

  // Handle marker press
  const handleMarkerPress = useCallback((pin: PulsePin) => {
    setSelectedPin(pin);
  }, []);

  // Toggle filter panel
  const toggleFilters = useCallback(() => {
    const toValue = showFilters ? 0 : 300;
    setShowFilters(!showFilters);

    Animated.spring(filterPanelHeight, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  }, [showFilters, filterPanelHeight]);

  // Toggle activity filter
  const toggleActivity = useCallback((activityId: string) => {
    setFilters((prev) => ({
      ...prev,
      activityTypes: prev.activityTypes.includes(activityId)
        ? prev.activityTypes.filter((a) => a !== activityId)
        : [...prev.activityTypes, activityId],
    }));
  }, []);

  // Get marker color based on activity
  const getMarkerColor = useCallback(
    (activity: string, isMatch = false): string => {
      if (isMatch) return "#EC4899";
      const activityType = activityTypes.find((a) => a.id === activity);
      return activityType?.color || "#6B7280";
    },
    [activityTypes],
  );

  const getStableMatchFlag = useCallback((pin: PulsePin): boolean => {
    let hash = 0;
    for (const char of pin._id) {
      hash += char.codePointAt(0) ?? 0;
    }
    return hash % 10 >= 7;
  }, []);

  // Update user location
  const updateUserLocation = useCallback(() => {
    const socketInstance = socketRef.current;
    if (userLocation && socketInstance) {
      socketInstance.emit("location:update", {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        activity: "other",
        message: "Updated location",
      });
    }
  }, [userLocation]);

  const navigateToArScentTrails = useCallback(() => {
    const typedNavigation = navigation as unknown as ArScentTrailsNavigation;

    typedNavigation.navigate("ARScentTrails", {
      initialLocation: userLocation ?? null,
    });
  }, [navigation, userLocation]);

  const sliderPosition = useMemo(() => {
    const percentage = Math.min(100, Math.max(0, (filters.radius / 50) * 100));

    return `${percentage.toFixed(0)}%`;
  }, [filters.radius]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Header */}
      <LinearGradient colors={["#1F2937", "#374151"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🗺️</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Pet Activity Map</Text>
              <Text style={styles.headerSubtitle}>Real-time locations</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
            <Text style={styles.filterButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <Animated.View
          style={[styles.statsContainer, { opacity: statsOpacity }]}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.activePets}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.nearbyMatches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.recentActivity}</Text>
            <Text style={styles.statLabel}>Recent</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        loadingEnabled={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="#EC4899"
          />
        )}

        {/* Pet activity markers */}
        {filteredPins.map((pin) => {
          const isMatch = getStableMatchFlag(pin);
          return (
            <React.Fragment key={pin._id}>
              <Marker
                coordinate={{
                  latitude: pin.latitude,
                  longitude: pin.longitude,
                }}
                title={pin.activity}
                description={pin.message || "Pet activity"}
                pinColor={getMarkerColor(pin.activity, isMatch)}
                onPress={() => {
                  handleMarkerPress(pin);
                }}
              />

              {/* Activity radius circle */}
              <Circle
                center={{
                  latitude: pin.latitude,
                  longitude: pin.longitude,
                }}
                radius={100}
                strokeColor={getMarkerColor(pin.activity, isMatch)}
                fillColor={`${getMarkerColor(pin.activity, isMatch)}20`}
                strokeWidth={2}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Filter Panel */}
      <Animated.View
        style={[styles.filterPanel, { height: filterPanelHeight }]}
      >
        <BlurView style={styles.filterBlur} intensity={50} tint="light">
          <ScrollView style={styles.filterContent}>
            <Text style={styles.filterTitle}>Map Filters</Text>

            {/* Activity Types */}
            <Text style={styles.filterSectionTitle}>Activity Types</Text>
            <View style={styles.activityGrid}>
              {activityTypes.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityButton,
                    {
                      backgroundColor: filters.activityTypes.includes(
                        activity.id,
                      )
                        ? activity.color
                        : "#F3F4F6",
                    },
                  ]}
                  onPress={() => {
                    toggleActivity(activity.id);
                  }}
                >
                  <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                  <Text
                    style={[
                      styles.activityLabel,
                      {
                        color: filters.activityTypes.includes(activity.id)
                          ? "#FFFFFF"
                          : "#374151",
                      },
                    ]}
                  >
                    {activity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Radius Slider */}
            <Text style={styles.filterSectionTitle}>
              Search Radius: {filters.radius} km
            </Text>
            <View style={styles.sliderContainer}>
              {/* Simple slider implementation */}
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderThumb, { left: sliderPosition }]} />
              </View>
            </View>
          </ScrollView>
        </BlurView>
      </Animated.View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.arFab]}
          onPress={navigateToArScentTrails}
        >
          <Text style={styles.fabIcon}>👁️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.locationFab]}
          onPress={getCurrentLocation}
        >
          <Text style={styles.fabIcon}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fab, styles.updateFab]}
          onPress={updateUserLocation}
        >
          <Text style={styles.fabIcon}>📡</Text>
        </TouchableOpacity>
      </View>

      {/* Pin Detail Modal */}
      <Modal
        visible={!!selectedPin}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSelectedPin(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <BlurView style={styles.modalBlur} intensity={80} tint="dark">
            <View style={styles.modalContent}>
              {selectedPin && (
                <>
                  <Text style={styles.modalTitle}>
                    {
                      activityTypes.find((a) => a.id === selectedPin.activity)
                        ?.emoji
                    }{" "}
                    {selectedPin.activity.charAt(0).toUpperCase() +
                      selectedPin.activity.slice(1)}
                  </Text>

                  {selectedPin.message && (
                    <Text style={styles.modalMessage}>
                      {selectedPin.message}
                    </Text>
                  )}

                  <Text style={styles.modalTime}>
                    {new Date(selectedPin.createdAt).toLocaleTimeString()}
                  </Text>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.likeButton]}
                    >
                      <Text style={styles.modalButtonText}>❤️ Like</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.chatButton]}
                    >
                      <Text style={styles.modalButtonText}>💬 Chat</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setSelectedPin(null);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EC4899",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#D1D5DB",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#D1D5DB",
  },
  map: {
    flex: 1,
  },
  filterPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  filterBlur: {
    flex: 1,
  },
  filterContent: {
    padding: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginTop: 16,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activityButton: {
    width: (width - 64) / 3,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  activityEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    position: "relative",
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: "#EC4899",
    borderRadius: 10,
    position: "absolute",
    top: -8,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 100,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationFab: {
    backgroundColor: "#3B82F6",
  },
  updateFab: {
    backgroundColor: "#10B981",
  },
  arFab: {
    backgroundColor: "#8B5CF6",
  },
  fabIcon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBlur: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  modalTime: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  likeButton: {
    backgroundColor: "#FEE2E2",
  },
  chatButton: {
    backgroundColor: "#DBEAFE",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  closeButton: {
    padding: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
});

export default MapScreen;
