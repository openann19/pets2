/**
 * useMemoryWeaveScreen Hook
 * Manages Memory Weave screen state and interactions
 */
import { useTheme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import type { Animated, ScrollView } from 'react-native';
import { StatusBar } from 'react-native';
import type { SemanticColors } from '../../theme/types';
import { useMemoryWeave } from '../domains/social/useMemoryWeave';

interface MemoryNode {
  id: string;
  type: 'text' | 'image' | 'video' | 'location';
  content: string;
  title: string;
  timestamp: string;
  metadata?: {
    location?: string;
    participants?: string[];
    emotion?: 'happy' | 'excited' | 'love' | 'playful';
  };
}

interface UseMemoryWeaveScreenReturn {
  // From domain hook
  memories: MemoryNode[];
  currentIndex: number;
  scrollX: Animated.Value;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  scrollViewRef: React.RefObject<ScrollView>;
  isAnimating: boolean;
  setCurrentIndex: (index: number) => void;
  scrollToIndex: (index: number) => void;
  handleScroll: (event: { nativeEvent: { contentOffset: { x: number } } }) => void;
  getEmotionColor: (emotion?: string) => string;
  getEmotionEmoji: (emotion?: string) => string;
  formatTimestamp: (timestamp: string) => string;
  petName: string;
  matchId: string;

  // Screen-specific
  isDark: boolean;
  colors: SemanticColors;
  handleGoBack: () => void;
  handleShare: () => void;
}

// Helper to ensure boolean
const ensureBoolean = (value: boolean | undefined): boolean => {
  return Boolean(value);
};

export const useMemoryWeaveScreen = (route: {
  params?: { matchId?: string; petName?: string; memories?: MemoryNode[] | unknown[] };
}): UseMemoryWeaveScreenReturn => {
  const navigation = useNavigation();
  const theme = useTheme();
  const isDark = theme.isDark ?? theme.scheme === 'dark';
  const colors = theme.colors;
  const params = route.params ?? {};
  const matchId = params.matchId ?? '';
  const petName = params.petName ?? '';
  const initialMemories = params.memories
    ? Array.isArray(params.memories)
      ? (params.memories as MemoryNode[])
      : []
    : [];

  const {
    memories,
    currentIndex,
    scrollX: scrollXValue,
    fadeAnim: fadeAnimValue,
    scaleAnim: scaleAnimValue,
    scrollViewRef,
    isAnimating: isAnimatingValue,
    setCurrentIndex,
    scrollToIndex,
    handleScroll,
    getEmotionColor,
    getEmotionEmoji,
    formatTimestamp,
  } = useMemoryWeave(initialMemories);

  // Status bar management
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
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
    scrollX: scrollXValue,
    fadeAnim: fadeAnimValue,
    scaleAnim: scaleAnimValue,
    scrollViewRef,
    isAnimating: Boolean(isAnimatingValue),
    setCurrentIndex,
    scrollToIndex,
    handleScroll,
    getEmotionColor,
    getEmotionEmoji,
    formatTimestamp,
    petName,
    matchId,

    // Screen-specific
    isDark: ensureBoolean(isDark),
    colors,
    handleGoBack,
    handleShare,
  };
};
