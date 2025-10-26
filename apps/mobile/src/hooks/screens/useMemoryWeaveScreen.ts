/**
 * useMemoryWeaveScreen Hook
 * Manages Memory Weave screen state and interactions
 */
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../contexts/ThemeContext";
import { useMemoryWeave } from "../domains/social/useMemoryWeave";

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

interface UseMemoryWeaveScreenReturn {
  // From domain hook
  memories: MemoryNode[];
  currentIndex: number;
  scrollX: any;
  fadeAnim: any;
  scaleAnim: any;
  scrollViewRef: any;
  isAnimating: boolean;
  setCurrentIndex: (index: number) => void;
  scrollToIndex: (index: number) => void;
  handleScroll: (event: any) => void;
  getEmotionColor: (emotion?: string) => string;
  getEmotionEmoji: (emotion?: string) => string;
  formatTimestamp: (timestamp: string) => string;

  // Screen-specific
  isDark: boolean;
  colors: any;
  handleGoBack: () => void;
  handleShare: () => void;
}

export const useMemoryWeaveScreen = (route: {
  params: { matchId: string; petName: string; memories?: MemoryNode[] };
}): UseMemoryWeaveScreenReturn => {
  const navigation = useNavigation();
  const { isDark, colors } = useTheme();
  const { matchId, petName, memories: initialMemories } = route.params;

  const {
    memories,
    currentIndex,
    scrollX,
    fadeAnim,
    scaleAnim,
    scrollViewRef,
    isAnimating,
    setCurrentIndex,
    scrollToIndex,
    handleScroll,
    getEmotionColor,
    getEmotionEmoji,
    formatTimestamp,
  } = useMemoryWeave(initialMemories);

  // Status bar management
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    return () => {
      StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
    };
  }, [isDark]);

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Share functionality would go here
  };

  return {
    // From domain hook
    memories,
    currentIndex,
    scrollX,
    fadeAnim,
    scaleAnim,
    scrollViewRef,
    isAnimating,
    setCurrentIndex,
    scrollToIndex,
    handleScroll,
    getEmotionColor,
    getEmotionEmoji,
    formatTimestamp,

    // Screen-specific
    isDark,
    colors,
    handleGoBack,
    handleShare,
  };
};
