/**
 * useMapScreen Hook
 * Manages MapScreen state and business logic
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { PERMISSIONS, RESULTS, request } from "react-native-permissions";
import type { Region } from "react-native-maps";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import { SOCKET_URL } from "../../config/environment";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";

export interface MapFilters {
  showMyPets: boolean;
  showMatches: boolean;
  showNearby: boolean;
  activityTypes: string[];
  radius: number;
}

export interface MapStats {
  totalPets: number;
  activePets: number;
  nearbyMatches: number;
  recentActivity: number;
}

export interface PulsePin {
  _id: string;
  latitude: number;
  longitude: number;
  coordinates?: [number, number];
  activity: string;
  petId: string;
  userId: string;
  timestamp: string;
  message?: string;
  createdAt: string;
}

export interface ActivityType {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
}

export interface UseMapScreenReturn {
  // Data
  region: Region;
  userLocation: { latitude: number; longitude: number } | null;
  pins: PulsePin[];
  filters: MapFilters;
  stats: MapStats;

  // State
  showFilters: boolean;
  selectedPin: PulsePin | null;
  filterPanelHeight: Animated.Value;
  statsOpacity: Animated.Value;

  // Activity types
  activityTypes: ActivityType[];

  // Actions
  setShowFilters: (show: boolean) => void;
  setSelectedPin: (pin: PulsePin | null) => void;
  setFilters: (filters: MapFilters) => void;
  requestLocationPermission: () => Promise<void>;
  getCurrentLocation: () => void;
  toggleFilterPanel: () => void;
  handlePinPress: (pin: PulsePin) => void;
  handleStatistics: () => void;
}

export const useMapScreen = (): UseMapScreenReturn => {
  const { user } = useAuthStore();

  // Map state
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

  // Animation values
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

  // Toggle filter panel
  const toggleFilterPanel = useCallback(() => {
    Animated.spring(filterPanelHeight, {
      toValue: showFilters ? 0 : 1,
      useNativeDriver: false,
    }).start();
    setShowFilters(!showFilters);
  }, [showFilters]);

  // Handle pin press
  const handlePinPress = useCallback((pin: PulsePin) => {
    setSelectedPin(pin);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle statistics
  const handleStatistics = useCallback(() => {
    // Update stats based on filtered pins
    const filteredPins = pins.filter((pin) => {
      if (!filters.activityTypes.includes(pin.activity)) return false;
      // Add distance filtering logic here
      return true;
    });

    setStats({
      totalPets: filteredPins.length,
      activePets: filteredPins.filter((p) => {
        const timeDiff = Date.now() - new Date(p.timestamp).getTime();
        return timeDiff < 3600000; // Last hour
      }).length,
      nearbyMatches: filteredPins.length,
      recentActivity: filteredPins.length,
    });
  }, [pins, filters]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      logger.info("MapSocket connected");
      socket.emit("join_map", { userId: user._id });
    });

    socket.on("pulse_update", (data: PulsePin) => {
      setPins((prev) => {
        // Update existing pin or add new one
        const existingIndex = prev.findIndex((p) => p._id === data._id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        }
        return [...prev, data];
      });
    });

    socket.on("disconnect", () => {
      logger.info("MapSocket disconnected");
    });

    socketRef.current = socket;

    return () => {
      socket.emit("leave_map", { userId: user._id });
      socket.disconnect();
    };
  }, [user]);

  // Load initial data
  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  return {
    // Data
    region,
    userLocation,
    pins,
    filters,
    stats,

    // State
    showFilters,
    selectedPin,
    filterPanelHeight,
    statsOpacity,

    // Activity types
    activityTypes,

    // Actions
    setShowFilters,
    setSelectedPin,
    setFilters,
    requestLocationPermission,
    getCurrentLocation,
    toggleFilterPanel,
    handlePinPress,
    handleStatistics,
  };
};
