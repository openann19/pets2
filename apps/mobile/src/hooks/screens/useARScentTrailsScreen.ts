import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

interface ScentTrail {
  id: string;
  petName: string;
  petBreed: string;
  distance: string;
  direction: string;
  intensity: string;
  lastSeen: string;
  petPhoto: string;
}

export function useARScentTrailsScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scentTrails, setScentTrails] = useState<ScentTrail[]>([
    {
      id: "1",
      petName: "Buddy",
      petBreed: "Golden Retriever",
      distance: "150m",
      direction: "north",
      intensity: "strong",
      lastSeen: "5 minutes ago",
      petPhoto:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200",
    },
    {
      id: "2",
      petName: "Luna",
      petBreed: "Siberian Husky",
      distance: "280m",
      direction: "east",
      intensity: "medium",
      lastSeen: "12 minutes ago",
      petPhoto:
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=200",
    },
    {
      id: "3",
      petName: "Max",
      petBreed: "Beagle",
      distance: "420m",
      direction: "southwest",
      intensity: "weak",
      lastSeen: "25 minutes ago",
      petPhoto:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200",
    },
  ]);

  const startScanning = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      Alert.alert("Scan Complete", "Found 3 scent trails nearby!");
    }, 3000);
  }, []);

  const getIntensityColor = useCallback((intensity: string) => {
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
  }, []);

  const getDirectionIcon = useCallback((direction: string) => {
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
  }, []);

  const handleFollowTrail = useCallback((petName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Follow Trail",
      `Follow ${petName}'s scent trail?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Follow",
          onPress: () => {
            Alert.alert("Navigation", "Starting navigation to scent trail...");
          },
        },
      ],
    );
  }, []);

  return {
    isScanning,
    scentTrails,
    startScanning,
    getIntensityColor,
    getDirectionIcon,
    handleFollowTrail,
  };
}

