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
  filteredPins: PulsePin[];
  filters: MapFilters;
  stats: MapStats;
  heatmapPoints: { latitude: number; longitude: number; weight?: number }[];

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
  toggleActivity: (activityId: string) => void;
  getMarkerColor: (activity: string, isMatch?: boolean) => string;
  getStableMatchFlag: (pin: PulsePin) => boolean;
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
  const [heatmapPoints, setHeatmapPoints] = useState<{ latitude: number; longitude: number; weight?: number }[]>([]);

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

  // Helper: Calculate distance between two coordinates
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const earthRadiusKm = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return earthRadiusKm * c;
    },
    [],
  );

  // Filter pins based on filters
  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      if (!filters.activityTypes.includes(pin.activity)) return false;
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
  }, [pins, filters, userLocation, calculateDistance]);

  // Toggle activity filter
  const toggleActivity = useCallback(
    (activityId: string) => {
      setFilters((prev) => ({
        ...prev,
        activityTypes: prev.activityTypes.includes(activityId)
          ? prev.activityTypes.filter((a) => a !== activityId)
          : [...prev.activityTypes, activityId],
      }));
    },
    [],
  );

  // Get marker color based on activity
  const getMarkerColor = useCallback(
    (activity: string, isMatch = false): string => {
      if (isMatch) return "#EC4899";
      const activityType = activityTypes.find((a) => a.id === activity);
      return activityType?.color || "#6B7280";
    },
    [activityTypes],
  );

  // Get stable match flag (for demo purposes)
  const getStableMatchFlag = useCallback((pin: PulsePin): boolean => {
    let hash = 0;
    for (const char of pin._id) {
      hash += char.codePointAt(0) ?? 0;
    }
    return hash % 10 >= 7;
  }, []);

  // Handle statistics (auto-computed on filteredPins change)
  useEffect(() => {
    const now = Date.now();
    const recent = filteredPins.filter((p) => {
      const ts = new Date(p.timestamp || p.createdAt || Date.now()).getTime();
      return now - ts < 60 * 60 * 1000; // last hour
    });
    const matches = filteredPins.filter((p) => getStableMatchFlag(p)).length;

    setStats({
      totalPets: filteredPins.length,
      activePets: recent.length,
      nearbyMatches: matches,
      recentActivity: recent.length,
    });
  }, [filteredPins, getStableMatchFlag]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      logger.info("MapSocket connected");
      if (user?._id) {
        socket.emit("join_map", { userId: user._id });
      }
    });

    // Fixed: use pin:update event (matches server)
    function onPinUpdate(pin: PulsePin) {
      setPins((prev) => {
        const idx = prev.findIndex((p) => p._id === pin._id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...prev[idx], ...pin };
          return next;
        }
        return [pin, ...prev];
      });
    }
    socket.on("pin:update", onPinUpdate);

    // Heatmap updates
    function onHeatmapUpdate(data: { lat: number; lng: number; w?: number }[]) {
      setHeatmapPoints(data.map((d) => ({ latitude: d.lat, longitude: d.lng, weight: d.w ?? 1 })));
    }
    socket.on("heatmap:update", onHeatmapUpdate);

    socket.on("disconnect", () => {
      logger.info("MapSocket disconnected");
    });

    socketRef.current = socket;

    return () => {
      socket.off("pin:update", onPinUpdate);
      socket.off("heatmap:update", onHeatmapUpdate);
      if (user?._id) {
        socket.emit("leave_map", { userId: user._id });
      }
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
    filteredPins,
    filters,
    stats,
    heatmapPoints,

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
    toggleActivity,
    getMarkerColor,
    getStableMatchFlag,
  };
};
