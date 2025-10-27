/**
 * useMemoryWeave Hook
 * Manages memory weave display, navigation, and animations
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface MemoryNode {
  id: string;
  type: "text" | "image" | "video" | "location";
  content: string;
  title: string;
  timestamp: string;
  metadata?: {
    location?: string;
    participants?: string[];
    emotion?: "happy" | "excited" | "love" | "playful";
  };
}

interface UseMemoryWeaveReturn {
  // Data
  memories: MemoryNode[];
  currentIndex: number;

  // Animation refs
  scrollX: Animated.Value;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  scrollViewRef: React.RefObject<any>;

  // State
  isAnimating: boolean;

  // Actions
  setCurrentIndex: (index: number) => void;
  scrollToIndex: (index: number) => void;
  handleScroll: (event: any) => void;

  // Helpers
  getEmotionColor: (emotion?: string) => string;
  getEmotionEmoji: (emotion?: string) => string;
  formatTimestamp: (timestamp: string) => string;
}

export const useMemoryWeave = (
  initialMemories: MemoryNode[] = [],
): UseMemoryWeaveReturn => {
  const [memories] = useState<MemoryNode[]>(initialMemories);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const scrollViewRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Entrance animation
  useEffect(() => {
    setIsAnimating(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  }, []);

  const handleScroll = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / screenWidth);

      if (index !== currentIndex && index >= 0 && index < memories.length) {
        setCurrentIndex(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [currentIndex, memories.length],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      if (scrollViewRef.current && index >= 0 && index < memories.length) {
        scrollViewRef.current.scrollTo({
          x: index * screenWidth,
          animated: true,
        });
        setCurrentIndex(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [memories.length],
  );

  const getEmotionColor = useCallback((emotion?: string): string => {
    switch (emotion) {
      case "happy":
        return "#FFD700";
      case "excited":
        return "#FF6B6B";
      case "love":
        return "#FF69B4";
      case "playful":
        return "#4ECDC4";
      default:
        return "#8B5CF6";
    }
  }, []);

  const getEmotionEmoji = useCallback((emotion?: string): string => {
    switch (emotion) {
      case "happy":
        return "😊";
      case "excited":
        return "🎉";
      case "love":
        return "💕";
      case "playful":
        return "🎾";
      default:
        return "✨";
    }
  }, []);

  const formatTimestamp = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  return {
    // Data
    memories,
    currentIndex,

    // Animation refs
    scrollX,
    fadeAnim,
    scaleAnim,
    scrollViewRef,

    // State
    isAnimating,

    // Actions
    setCurrentIndex,
    scrollToIndex,
    handleScroll,

    // Helpers
    getEmotionColor,
    getEmotionEmoji,
    formatTimestamp,
  };
};
